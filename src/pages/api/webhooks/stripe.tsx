import type { NextApiResponse } from "next";
import { type AxiomAPIRequest, withAxiom } from "next-axiom";
import Stripe from "stripe";
import { prisma } from "~/server/db";
import { Resend } from "resend";
import ProjectPurchaseEmail from "../../../../emails/ProjectPurchaseEmail";
import { buffer } from "micro";
import { PostHog } from "posthog-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
});

// Disable next.js body parsing (stripe needs the raw body to validate the event)
export const config = {
  api: {
    bodyParser: false,
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);
async function handler(req: AxiomAPIRequest, res: NextApiResponse) {
  req.log.info("[api/stripe-webhook] Starting endpoint");
  try {
    const stripeWebhookSigningSecret =
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
    if (!stripeWebhookSigningSecret) {
      throw new Error("Missing Stripe Webhook Signing Secret");
    }
    const signature = req.headers["stripe-signature"] as string;
    const buf = await buffer(req);
    const receivedEvent = stripe.webhooks.constructEvent(
      buf.toString(),
      signature,
      stripeWebhookSigningSecret
    );

    if (!receivedEvent) {
      const error = "receivedEvent is undefined";
      req.log.error("[api/stripe-webhook] Error", {
        error,
      });
      throw Error(error);
    }

    const eventType = receivedEvent.type;

    switch (eventType) {
      case "checkout.session.completed":
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        await handleCheckoutSessionCompleted(req, receivedEvent);
        break;
      default:
        break;
    }
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    if (error instanceof Error) {
      req.log.error("[api/stripe-webhook] Error ", {
        error: error.message,
      });
    }
    res.status(500).json({ status: "failed" });
  }
}

const handleCheckoutSessionCompleted = async (
  req: AxiomAPIRequest,
  receivedEvent: Stripe.Event
) => {
  req.log.info(
    "[api/stripe-webhook][checkout.session.completed] receivedEvent: ",
    receivedEvent
  );
  const checkoutSession = receivedEvent.data.object as Stripe.Checkout.Session;
  const successUrl = checkoutSession.success_url;

  if (!successUrl) {
    const error = "success_url not found in checkout session";
    req.log.error("[api/stripe-webhook][checkout.session.completed] Error", {
      error,
      successUrl,
    });
    throw Error(error);
  }

  const queryParams = successUrl.split("?")[1];

  if (!queryParams) {
    const error = "queryParams not found in success_url";
    req.log.error("[api/stripe-webhook][checkout.session.completed] Error", {
      error,
      successUrl,
    });
    throw Error(error);
  }

  const userId = queryParams.split("&")[0]?.split("=")[1];
  const projectId = queryParams.split("&")[1]?.split("=")[1];

  if (!userId) {
    const error = "projectId not found in queryParams";
    req.log.error(`[api/stripe-webhook][checkout.session.completed] Error`, {
      error,
      queryParams,
    });
    throw Error(error);
  }

  if (!projectId) {
    const error = "projectId not found in queryParams";
    req.log.error(`[api/stripe-webhook][checkout.session.completed] Error`, {
      error,
      queryParams,
    });
    throw Error(error);
  }

  await prisma.purchases.create({
    data: {
      projectsId: projectId,
      userId,
    },
  });

  const emailAddress = checkoutSession.customer_details?.email;
  if (!emailAddress) {
    const error = "emailAddress not found in checkout session";
    req.log.error(`[api/stripe-webhook][checkout.session.completed] Error `, {
      error,
      customerDetails: checkoutSession.customer_details,
    });
    throw Error(error);
  }

  const project = await prisma.projects.findUnique({
    where: {
      id: projectId,
    },
    select: {
      title: true,
    },
  });

  if (!project) {
    const error = "project not found";
    req.log.error(`[api/stripe-webhook][checkout.session.completed] Error `, {
      error,
      projectId,
    });
    throw Error(error);
  }

  const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
  });

  const newProjectsUiEnabled =
    (await client.isFeatureEnabled("new-projects-ui", userId)) ?? true;

  client.identify({
    distinctId: userId,
    properties: {
      email: emailAddress,
    },
  });

  client.capture({
    distinctId: userId,
    event: "Successfully Purchased Project",
    properties: {
      project_id: projectId,
      time: new Date(),
    },
  });

  await client.shutdownAsync();

  await resend.sendEmail({
    from: "noreply@updates.sweprojects.com",
    to: emailAddress,
    subject: "Here's the project tutorial you purchased 🚀",
    react: (
      <ProjectPurchaseEmail
        projectName={project.title}
        projectUrl={`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/${
          newProjectsUiEnabled ? "projectsv2" : "projects"
        }/${projectId}`}
      />
    ),
  });

  req.log.info(
    "[api/stripe-webhook][checkout.session.completed] Completed endpoint"
  );
};

export default withAxiom(handler);
