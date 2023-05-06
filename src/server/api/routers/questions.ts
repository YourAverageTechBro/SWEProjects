import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const questionsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        instructionsId: z.string(),
        userId: z.string(),
        question: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      ctx.log?.info("[questions] Starting endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
      });
      const { instructionsId, userId, question } = input;

      const result = await ctx.prisma.questions.create({
        data: {
          instructionsId,
          userId,
          question,
        },
      });

      ctx.log?.info("[questions] Completed endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });

      return result;
    }),
  getAllQuestionsForInstruction: privateProcedure
    .input(z.object({ instructionsId: z.string() }))
    .query(async ({ ctx, input }) => {
      ctx.log?.info("[questions] Starting endpoint", {
        userId: ctx.userId,
        function: "getQuestionsForInstruction",
        input: JSON.stringify(input),
      });

      const { instructionsId } = input;

      const result = await ctx.prisma.questions.findMany({
        where: {
          instructionsId,
        },
      });

      ctx.log?.info("[questions] Completed endpoint", {
        userId: ctx.userId,
        function: "getQuestionsForInstruction",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });

      return result;
    }),
});
