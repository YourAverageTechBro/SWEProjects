import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

export const codeBlocksRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        instructionsId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { instructionsId } = input;
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.codeBlocks.create({
          data: {
            instructionsId,
            code: "",
            fileName: "sample.tsx",
          },
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  delete: privateProcedure
    .input(
      z.object({
        codeBlockId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { codeBlockId } = input;
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "delete",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.codeBlocks.delete({
          where: {
            id: codeBlockId,
          },
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "delete",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "delete",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  duplicate: privateProcedure
    .input(
      z.object({
        instructionsId: z.string(),
        codeBlocks: z.array(
          z.object({
            instructionsId: z.string(),
            code: z.string(),
            fileName: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { codeBlocks } = input;
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "duplicate",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.codeBlocks.createMany({
          data: codeBlocks,
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "duplicate",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });
        return result;
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "duplicate",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  update: privateProcedure
    .input(
      z.object({
        code: z.string(),
        fileName: z.string(),
        codeBlockId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { code, fileName, codeBlockId } = input;
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.codeBlocks.update({
          where: {
            id: codeBlockId,
          },
          data: {
            code,
            fileName,
          },
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getCodeBlocksForInstructionId: publicProcedure
    .input(z.object({ instructionsId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "getCodeBlocksForInstructionId",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.codeBlocks.findMany({
          where: {
            instructionsId: input.instructionsId,
          },
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "getCodeBlocksForInstructionId",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "getCodeBlocksForInstructionId",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getMostRecentDiffForFileName: publicProcedure
    .input(
      z.object({
        fileName: z.string().optional(),
        createdAt: z.date().optional(),
        projectVariantId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[codeBlocks] Starting endpoint", {
          userId: ctx.userId,
          function: "getMostRecentDiffForFileName",
          input: JSON.stringify(input),
        });
        const { fileName, createdAt, projectVariantId } = input;
        if (!fileName || !createdAt || !projectVariantId) return null;
        const result = await ctx.prisma.instructions.findMany({
          where: {
            projectVariantId,
            codeBlock: {
              some: {
                fileName,
                createdAt: {
                  lt: createdAt,
                },
              },
            },
          },
          include: {
            codeBlock: {
              where: {
                fileName,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        ctx.log?.info("[codeBlocks] Completed endpoint", {
          userId: ctx.userId,
          function: "getMostRecentDiffForFileName",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return (
          result.find((instruction) => instruction.codeBlock.length === 1)
            ?.codeBlock[0]?.code ?? ""
        );
      } catch (error) {
        ctx.log?.error("[codeBlocks] Failed endpoint", {
          userId: ctx.userId,
          function: "getMostRecentDiffForFileName",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
