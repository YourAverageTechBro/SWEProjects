import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        comment: z.string(),
        parentCommentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[comments] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });
        const { userId, questionId, comment, parentCommentId } = input;

        const result = await ctx.prisma.comment.create({
          data: {
            userId,
            questionId,
            comment,
            parentCommentId,
          },
        });

        ctx.log?.info("[comments] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[comments] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getAllCommentsForQuestion: privateProcedure
    .input(z.object({ questionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[comments] Starting endpoint", {
          userId: ctx.userId,
          function: "getAllCommentsForQuestion",
          input: JSON.stringify(input),
        });

        const { questionId } = input;

        const result = await ctx.prisma.comment.findMany({
          where: {
            questionId,
            parentCommentId: null,
          },
          include: {
            replies: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        ctx.log?.info("[comments] Completed endpoint", {
          userId: ctx.userId,
          function: "getAllCommentsForQuestion",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[comments] Failed endpoint", {
          userId: ctx.userId,
          function: "getAllCommentsForQuestion",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
