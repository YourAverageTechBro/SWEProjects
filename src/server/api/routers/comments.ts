import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ctx.log?.info("[comments] Starting endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
      });
      const { userId, questionId, comment } = input;

      const result = await ctx.prisma.comment.create({
        data: {
          userId,
          questionId,
          comment,
        },
      });

      ctx.log?.info("[comments] Completed endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });

      return result;
    }),
});
