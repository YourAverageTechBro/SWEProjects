import Stripe from "stripe";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
});
export const stripeRouter = createTRPCRouter({
  getPrices: publicProcedure
    .input(
      z.object({
        priceId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[stripe] Starting endpoint", {
          function: "getPrices",
          input: JSON.stringify(input),
        });
        const { priceId } = input;
        if (!priceId) return;
        const price = await stripe.prices.retrieve(priceId);
        if (!price.unit_amount) return;
        ctx.log?.info("[stripe] Completed endpoint", {
          function: "getPrices",
          input: JSON.stringify(input),
          price: price.unit_amount / 100,
        });
        return price.unit_amount / 100;
      } catch (error) {
        ctx.log?.error("[stripe] Failed endpoint", {
          function: "getPrices",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
