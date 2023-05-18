import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import InstructionsUpdateInput = Prisma.InstructionsUpdateInput;

export const instructionsRouter = createTRPCRouter({
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
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
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "delete",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  createEmptyInstruction: privateProcedure
    .input(
      z.object({
        projectVariantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
            title: "Empty Instruction",
          },
        });

        ctx.log?.info("[instructions] Completed endpoint", {
          userId: ctx.userId,
          function: "createEmptyInstruction",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });
        return result;
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "createEmptyInstruction",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
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
      try {
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
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "duplicateInstruction",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  update: privateProcedure
    .input(
      z.object({
        instructionId: z.string(),
        explanation: z.string().optional(), // array of block notes
        hasCodeBlocks: z.boolean().optional(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { instructionId, explanation, hasCodeBlocks, title } = input;
        ctx.log?.info("[instructions] Starting endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
        });

        const updatedData: InstructionsUpdateInput = {};
        if (explanation) {
          updatedData.explanation = explanation;
        }
        if (hasCodeBlocks !== undefined) {
          updatedData.hasCodeBlocks = {
            set: hasCodeBlocks,
          };
        }

        if (title) {
          updatedData.title = title;
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
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getInstructionTitlesForProjectVariantId: publicProcedure
    .input(z.object({ projectVariantId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[instructions] Starting endpoint", {
          userId: ctx.userId,
          function: "getInstructionTitlesForProjectVariantId",
          input: JSON.stringify(input),
        });

        const result = await ctx.prisma.instructions.findMany({
          select: {
            id: true,
            title: true,
          },
          where: {
            projectVariantId: input.projectVariantId,
          },
        });

        ctx.log?.info("[instructions] Completed endpoint", {
          userId: ctx.userId,
          function: "getInstructionTitlesForProjectVariantId",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "getInstructionTitlesForProjectVariantId",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getById: publicProcedure
    .input(z.object({ instructionId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[instructions] Starting endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
        });

        if (!input.instructionId) {
          throw new Error("instructionId is required");
        }

        const result = await ctx.prisma.instructions.findUnique({
          where: {
            id: input.instructionId,
          },
        });

        ctx.log?.info("[instructions] Completed endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[instructions] Failed endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
