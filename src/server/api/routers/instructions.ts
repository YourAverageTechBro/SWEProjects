import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import InstructionsUpdateInput = Prisma.InstructionsUpdateInput;

export const instructionsRouter = createTRPCRouter({
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      ctx.log?.info("[instructions] Starting endpoint", {
        userId: ctx.userId,
        function: "delete",
        input: JSON.stringify(input),
      });
      const result = ctx.prisma.instructions.delete({
        where: {
          id,
        },
      });

      ctx.log?.info("[instructions] Completed endpoint", {
        userId: ctx.userId,
        function: "delete",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });

      return result;
    }),
  createEmptyInstruction: privateProcedure
    .input(
      z.object({
        projectVariantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { projectVariantId } = input;
      ctx.log?.info("[instructions] Starting endpoint", {
        userId: ctx.userId,
        function: "createEmptyInstruction",
        input: JSON.stringify(input),
      });

      const result = await ctx.prisma.instructions.create({
        data: {
          projectVariantId,
          codeBlock: {
            create: [
              {
                fileName: "index.tsx",
                code: "console.log('Hello World!');",
              },
            ],
          },
        },
      });

      ctx.log?.info("[instructions] Completed endpoint", {
        userId: ctx.userId,
        function: "createEmptyInstruction",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });
      return result;
    }),
  duplicateInstruction: privateProcedure
    .input(
      z.object({
        projectVariantId: z.string(),
        explanation: z.string(),
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
      const { projectVariantId, explanation, codeBlocks } = input;
      ctx.log?.info("[instructions] Starting endpoint", {
        userId: ctx.userId,
        function: "duplicateInstruction",
        input: JSON.stringify(input),
      });

      const result = await ctx.prisma.instructions.create({
        data: {
          projectVariantId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          explanation,
          codeBlock: {
            createMany: {
              data: codeBlocks.map((codeBlock) => ({
                fileName: codeBlock.fileName,
                code: codeBlock.code,
              })),
            },
          },
        },
      });

      ctx.log?.info("[instructions] Completed endpoint", {
        userId: ctx.userId,
        function: "duplicateInstruction",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });
      return result;
    }),
  update: privateProcedure
    .input(
      z.object({
        instructionId: z.string(),
        explanation: z.string().optional(), // array of block notes
        successMedia: z
          .object({
            mediaUrl: z.string(),
            caption: z.string(),
          })
          .optional(),
        hasCodeBlocks: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { successMedia, instructionId, explanation, hasCodeBlocks } = input;
      ctx.log?.info("[instructions] Starting endpoint", {
        userId: ctx.userId,
        function: "update",
        input: JSON.stringify(input),
      });

      const updatedData: InstructionsUpdateInput = {};
      if (explanation) updatedData.explanation = explanation;
      if (successMedia) {
        updatedData.successMedia = {
          create: [successMedia],
        };
      }
      if (hasCodeBlocks !== undefined) {
        updatedData.hasCodeBlocks = {
          set: hasCodeBlocks,
        };
      }

      const result = await ctx.prisma.instructions.update({
        where: {
          id: instructionId,
        },
        data: updatedData,
      });

      ctx.log?.info("[instructions] Completed endpoint", {
        userId: ctx.userId,
        function: "update",
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });
      return result;
    }),
});
