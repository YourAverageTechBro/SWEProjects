import { Resend } from "resend";
import { type IncomingHttpHeaders } from "http";
import type { NextApiResponse } from "next";
import { Webhook, type WebhookRequiredHeaders } from "svix";
import { buffer } from "micro";
import WelcomeEmail from "emails/WelcomeEmail";
import { type AxiomAPIRequest, withAxiom } from "next-axiom";

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
  } catch (e: any) {
    req.log.error(
      "[api/webhooks/clerk/users] Error",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      { error: e.message }
    );
    return res.status(400).json({});
  }

  // Handle the webhook
  const eventType: EventType = evt.type;
  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    req.log.info("[api/webhooks/clerk/users] Starting endpoint", {
      data: JSON.stringify(evt.data),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!id || !email_addresses || !email_addresses[0].email_address) {
      req.log.info("[api/webhooks/clerk/users] Invalid data from Clerk", {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: JSON.stringify({ id, email_addresses }),
      });
      return;
    }
    await resend.sendEmail({
      from: "noreply@updates.sweprojects.com",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      to: email_addresses[0].email_address as string,
      subject: "Welcome to SWE Projects! Here are some helpful links",
      react: <WelcomeEmail />,
    });
    req.log.info("[api/webhooks/clerk/users] Completed endpoint", {
      data: JSON.stringify(evt.data),
    });
    res.json({});
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
