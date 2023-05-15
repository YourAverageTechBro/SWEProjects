import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const questionsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        instructionsId: z.string(),
        userId: z.string(),
        question: z.string(),
        title: z.string(),
        username: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[questions] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });
        const { instructionsId, userId, question, title, username } = input;

        const result = await ctx.prisma.questions.create({
          data: {
            instructionsId,
            userId,
            question,
            title,
            username,
          },
        });

        ctx.log?.info("[questions] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[questions] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getAllQuestionsForInstruction: publicProcedure
    .input(z.object({ instructionsId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
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
          include: {
            _count: {
              select: { comments: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        ctx.log?.info("[questions] Completed endpoint", {
          userId: ctx.userId,
          function: "getQuestionsForInstruction",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[questions] Failed endpoint", {
          userId: ctx.userId,
          function: "getQuestionsForInstruction",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
