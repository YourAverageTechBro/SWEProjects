import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { ProjectEnrollmentType } from "@prisma/client";

export const projectEnrollmentsRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        projectsId: z.string(),
        userId: z.string(),
        projectEnrollmentType: z.nativeEnum(ProjectEnrollmentType),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { projectEnrollmentType, projectsId, userId } = input;
        ctx.log?.info("[purchases] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.projectEnrollment.create({
          data: {
            projectsId,
            userId,
            projectEnrollmentType,
          },
        });

        ctx.log?.info("[purchases] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });
        return result;
      } catch (error) {
        ctx.log?.error("[purchases] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
