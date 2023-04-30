import type { NextApiResponse } from "next";
import { type AxiomAPIRequest, withAxiom } from "next-axiom";
import Stripe from "stripe";
import { prisma } from "~/server/db";
import { Resend } from "resend";
import ProjectPurchaseEmail from "../../../../emails/ProjectPurchaseEmail";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
});
const stripeWebhookSigningSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

const resend = new Resend(process.env.RESEND_API_KEY);
async function handler(req: AxiomAPIRequest, res: NextApiResponse) {
  req.log.info("[api/stripe-webhook] Starting endpoint");
  try {
    if (!stripeWebhookSigningSecret) {
      throw new Error("Missing Stripe Webhook Signing Secret");
    }
    const signature = req.headers["Stripe-Signature"] as string;
    const buf = await buffer(req);
    let receivedEvent;
    try {
      receivedEvent = await stripe.webhooks.constructEventAsync(
        buf.toString(),
        signature,
        stripeWebhookSigningSecret
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        return new Response(err.message, { status: 400 });
      }
    }

    if (!receivedEvent) {
      throw Error("receivedEvent is undefined");
    }

    // Secondly, we use this event to query the Stripe API in order to avoid
    // handling any forged event. If available, we use the idempotency key.
    const requestOptions =
      receivedEvent.request && receivedEvent.request.idempotency_key
        ? {
            idempotencyKey: receivedEvent.request.idempotency_key,
          }
        : {};

    let retrievedEvent;
    try {
      retrievedEvent = await stripe.events.retrieve(
        receivedEvent.id,
        requestOptions
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        return new Response(err.message, { status: 400 });
      }
    }

    if (!retrievedEvent) {
      throw Error("retrievedEvent is undefined");
    }

    const eventType = retrievedEvent.type;

    switch (eventType) {
      case "checkout.session.completed":
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        req.log.info(
          "[api/stripe-webhook][checkout.session.completed] retrievedEvent: ",
          retrievedEvent
        );
        const checkoutSession = retrievedEvent.data
          .object as Stripe.Checkout.Session;
        const successUrl = checkoutSession.success_url;

        if (!successUrl) {
          const error = "success_url not found in checkout session";
          req.log.error(
            "[api/stripe-webhook][checkout.session.completed] Error",
            {
              error,
              successUrl,
            }
          );
          throw Error(error);
        }

        const queryParams = successUrl.split("?")[1];

        if (!queryParams) {
          const error = "queryParams not found in success_url";
          req.log.error(
            "[api/stripe-webhook][checkout.session.completed] Error",
            {
              error,
              successUrl,
            }
          );
          throw Error(error);
        }

        const userId = queryParams.split("&")[0]?.split("=")[1];
        const projectId = queryParams.split("&")[1]?.split("=")[1];

        if (!userId) {
          const error = "projectId not found in queryParams";
          req.log.error(
            `[api/stripe-webhook][checkout.session.completed] Error`,
            {
              error,
              queryParams,
            }
          );
          throw Error(error);
        }

        if (!projectId) {
          const error = "projectId not found in queryParams";
          req.log.error(
            `[api/stripe-webhook][checkout.session.completed] Error`,
            {
              error,
              queryParams,
            }
          );
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
          req.log.error(
            `[api/stripe-webhook][checkout.session.completed] Error `,
            {
              error,
              customerDetails: checkoutSession.customer_details,
            }
          );
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
          req.log.error(
            `[api/stripe-webhook][checkout.session.completed] Error `,
            {
              error,
              projectId,
            }
          );
          throw Error(error);
        }

        await resend.sendEmail({
          from: "noreply@updates.sweprojects.com",
          to: emailAddress,
          subject: "Welcome to SWE Projects! Here are some helpful links",
          react: (
            <ProjectPurchaseEmail
              projectName={project.title}
              projectUrl={`${
                process.env.NEXT_PUBLIC_BASE_URL ?? ""
              }/projects/${projectId}`}
            />
          ),
        });

        req.log.info(
          "[stripe-webhook][checkout.session.completed] Completed endpoint"
        );
      default:
        break;
    }
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    if (error instanceof Error) {
      req.log.error("[stripe-webhook] Error ", {
        error: error.message,
      });
    }
    res.status(500).json({ status: "failed" });
  }
  res.status(500).json({ status: "failed" });
}

export default withAxiom(handler);
