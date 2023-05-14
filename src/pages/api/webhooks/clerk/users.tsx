import clerk from "@clerk/clerk-sdk-node";
import { Resend } from "resend";
import { type IncomingHttpHeaders } from "http";
import type { NextApiResponse } from "next";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { buffer } from "micro";
import WelcomeEmail from "emails/WelcomeEmail";
import { type AxiomAPIRequest, withAxiom } from "next-axiom";
import MailerLite from "@mailerlite/mailerlite-nodejs";

// Disable the bodyParser, so we can access the raw
// request body for verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestWithSvixRequiredHeaders = AxiomAPIRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};

const webhookSecret: string = process.env.WEBHOOK_SECRET || "";

const resend = new Resend(process.env.RESEND_API_KEY);

const mailerlite = new MailerLite({
  api_key: process.env.MAILER_LITE_API_KEY ?? "",
});

async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse
) {
  // Verify the webhook signature
  // See https://docs.svix.com/receiving/verifying-payloads/how
  const payload = (await buffer(req)).toString();
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payload, headers) as Event;

    // Handle the webhook
    const eventType: EventType = evt.type;
    if (eventType === "user.created") {
      req.log.info("[api/webhooks/clerk/users] Starting endpoint", {
        data: JSON.stringify(evt.data),
      });
      const { id, email_addresses, first_name, last_name } = evt.data;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!id || !email_addresses || !email_addresses[0].email_address) {
        req.log.info("[api/webhooks/clerk/users] Invalid data from Clerk", {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: JSON.stringify({ id, email_addresses }),
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const emailAddress = email_addresses[0].email_address as string;

      req.log.info("[api/webhooks/clerk/users] Sending welcome email", {
        data: JSON.stringify({
          id: id as string,
          emailAddress,
          first_name: first_name as string,
          last_name: last_name as string,
        }),
      });

      await resend.sendEmail({
        from: "noreply@updates.sweprojects.com",
        to: emailAddress,
        subject: "Welcome to SWE Projects! Here are some helpful links",
        react: <WelcomeEmail />,
      });

      req.log.info("[api/webhooks/clerk/users] Adding user to mailer lite", {
        data: JSON.stringify({
          id: id as string,
          emailAddress,
          first_name: first_name as string,
          last_name: last_name as string,
        }),
      });
      const resp = await mailerlite.subscribers.createOrUpdate({
        email: emailAddress,
        fields: {
          name: first_name as string,
          last_name: last_name as string,
          clerk_id: id as string,
        },
        status: "active",
      });

      req.log.info("[api/webhooks/clerk/users] Updating clerk metadata", {
        data: JSON.stringify({
          id: id as string,
          emailAddress,
          first_name: first_name as string,
          last_name: last_name as string,
        }),
      });
      await clerk.users.updateUserMetadata(id as string, {
        privateMetadata: {
          mailerLiteId: resp.data.data.id,
        },
      });

      req.log.info("[api/webhooks/clerk/users] Completed endpoint", {
        data: JSON.stringify(evt.data),
      });
      res.json({});
    }
  } catch (e: any) {
    req.log.error(
      "[api/webhooks/clerk/users] Error",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      { error: e.message }
    );
    return res.status(400).json({});
  }
}

export default withAxiom(handler);

// Generic (and naive) way for the Clerk event
// payload type.
type Event = {
  data: Record<string, any>;
  object: "event";
  type: EventType;
};

type EventType = "user.created";
