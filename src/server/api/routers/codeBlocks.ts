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
    }),
  delete: privateProcedure
    .input(
      z.object({
        codeBlockId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
  getCodeBlocksForInstructionId: publicProcedure
    .input(z.object({ instructionsId: z.string() }))
    .query(async ({ ctx, input }) => {
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
    }),
  getMostRecentDiffForFileName: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        createdAt: z.date(),
        instructionsId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.log?.info("[codeBlocks] Starting endpoint", {
        userId: ctx.userId,
        function: "getMostRecentDiffForFileName",
        input: JSON.stringify(input),
      });
      const { fileName, createdAt, instructionsId } = input;
      const result = await ctx.prisma.codeBlocks.findMany({
        where: {
          fileName: fileName,
          createdAt: {
            lte: createdAt,
          },
          instructionsId: instructionsId,
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

      return result[0];
    }),
});
