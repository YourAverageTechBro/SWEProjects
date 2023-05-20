import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const projectPreviewEnrollmentsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        email: z.string(),
        projectsId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projectPreviewEnrollments] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });
        const { userId, projectsId, email } = input;

        const result = await ctx.prisma.projectPreviewEnrollment.create({
          data: {
            userId,
            projectsId,
            email,
          },
        });

        ctx.log?.info("[projectPreviewEnrollments] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[projectPreviewEnrollments] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getUsersProjectPreviewEnrollmentsForProjectId: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable().optional(),
        projectsId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projectPreviewEnrollments] Starting endpoint", {
          userId: ctx.userId,
          function: "getUsersProjectPreviewEnrollmentsForProjectId",
          input: JSON.stringify(input),
        });

        const { projectsId, userId } = input;

        if (!userId) return [];

        const result = await ctx.prisma.projectPreviewEnrollment.findMany({
          where: {
            projectsId,
            userId,
          },
        });

        ctx.log?.info("[projectPreviewEnrollments] Completed endpoint", {
          userId: ctx.userId,
          function: "getUsersProjectPreviewEnrollmentsForProjectId",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[projectPreviewEnrollments] Failed endpoint", {
          userId: ctx.userId,
          function: "getUsersProjectPreviewEnrollmentsForProjectId",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
