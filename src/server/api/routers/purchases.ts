import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const purchasesRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ projectsId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectsId, userId } = input;
      ctx.log?.info("[purchases] Starting endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
      });

      const result = await ctx.prisma.purchases.create({
        data: {
          projectsId,
          userId,
        },
      });

      ctx.log?.info("[purchases] Completed endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });
      return result;
    }),
});
