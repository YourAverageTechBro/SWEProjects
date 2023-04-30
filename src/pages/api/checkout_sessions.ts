import type { NextApiResponse } from "next";
import { type AxiomAPIRequest, withAxiom } from "next-axiom";
import type Stripe from "stripe";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

type Data = {
  error?: string;
  data?: Stripe.Checkout.Session;
};

async function handler(req: AxiomAPIRequest, res: NextApiResponse<Data>) {
  if (req.method === "POST") {
    const { userId, projectId, stripePriceId } = req.query as {
      userId: string;
      projectId: string;
      stripePriceId: string;
    };
    try {
      req.log.info(`[api/checkout_sessions] Starting endpoint`, {
        userId,
        projectId,
        stripePriceId,
      });
      // Create Checkout Sessions from body params.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const session: Stripe.Checkout.Session =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await stripe.checkout.sessions.create({
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price: stripePriceId,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${
            process.env.NEXT_PUBLIC_BASE_URL ?? ""
          }/projects/successfulPurchase?userId=${userId}&projectId=${projectId}`,
          cancel_url: `${
            process.env.NEXT_PUBLIC_BASE_URL ?? ""
          }/projects/preview/${projectId}?canceledPayment=true`,
          automatic_tax: { enabled: true },
        });

      req.log.info(`[api/checkout_sessions] Completed endpoint`, {
        userId,
        projectId,
        stripePriceId,
        sessionUrl: session.url,
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.redirect(303, session.url);
    } catch (err: any) {
      req.log.error(`[api/checkout_sessions] Error`, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        error: err.message,
        userId,
        projectId,
        stripePriceId,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

export default withAxiom(handler);
