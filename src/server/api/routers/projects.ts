import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { BackendVariant, FrontendVariant, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import ProjectsFindUniqueArgs = Prisma.ProjectsFindUniqueArgs;
import ProjectsFindManyArgs = Prisma.ProjectsFindManyArgs;

export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    try {
      ctx.log?.info("[projects] Starting endpoint", {
        userId: ctx.userId,
        function: "getAll",
      });
      const result = ctx.prisma.projects.findMany();
      ctx.log?.info("[projects] Completed endpoint", {
        userId: ctx.userId,
        function: "getAll",
        result: JSON.stringify(result),
      });
      return result;
    } catch (error) {
      ctx.log?.error("[projects] Failed endpoint", {
        userId: ctx.userId,
        function: "getAll",
        error: JSON.stringify(error),
      });
      throw error;
    }
  }),
  getAllPreviews: publicProcedure.query(({ ctx }) => {
    try {
      ctx.log?.info("[projects] Starting endpoint", {
        userId: ctx.userId,
        function: "getAllPreviews",
      });
      const result = ctx.prisma.projects.findMany({
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          preRequisites: true,
          videoDemoUrl: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      ctx.log?.info("[projects] Completed endpoint", {
        userId: ctx.userId,
        function: "getAllPreviews",
        result: JSON.stringify(result),
      });
      return result;
    } catch (error) {
      ctx.log?.error("[projects] Failed endpoint", {
        userId: ctx.userId,
        function: "getAllPreviews",
        error: JSON.stringify(error),
      });
      throw error;
    }
  }),
  getPreviewById: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        userId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projects] Starting endpoint", {
          function: "getPreviewById",
          input: JSON.stringify(input),
        });
        if (!input.projectId) return null;
        const filter: ProjectsFindUniqueArgs = {
          where: {
            id: input.projectId,
          },
        };
        if (input.userId) {
          filter.include = {
            purchases: {
              where: {
                userId: input.userId,
              },
            },
          };
        }

        const post = await ctx.prisma.projects.findUnique(filter);

        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        ctx.log?.info("[projects] Completed endpoint", {
          function: "getPreviewById",
          input: JSON.stringify(input),
          post: JSON.stringify(post),
        });
        return post as Prisma.ProjectsGetPayload<{
          include: {
            purchases: true;
          };
        }>;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          function: "getPreviewById",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getProjectVariantId: publicProcedure
    .input(
      z.object({
        projectsId: z.string().optional(),
        frontendVariant: z.nativeEnum(FrontendVariant),
        backendVariant: z.nativeEnum(BackendVariant),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projects] Starting endpoint", {
          userId: ctx.userId,
          function: "getProjectVariantId",
          input: JSON.stringify(input),
        });

        const { projectsId, frontendVariant, backendVariant } = input;

        if (!projectsId || !frontendVariant || !backendVariant) return null;
        const result = await ctx.prisma.projects.findUnique({
          where: {
            id: projectsId,
          },
          include: {
            projectVariants: {
              where: {
                frontendVariant: input.frontendVariant,
                backendVariant: input.backendVariant,
              },
            },
          },
        });

        if (result?.projectVariants.length !== 1)
          throw new TRPCError({ code: "CONFLICT" });

        ctx.log?.info("[projects] Completed endpoint", {
          userId: ctx.userId,
          function: "getProjectVariantId",
          input: JSON.stringify(input),
        });

        return result;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          userId: ctx.userId,
          function: "getProjectVariantId",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getById: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        frontendVariant: z.nativeEnum(FrontendVariant),
        backendVariant: z.nativeEnum(BackendVariant),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projects] Starting endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
        });
        if (!input.projectId) return null;
        const filter: ProjectsFindUniqueArgs = {
          where: {
            id: input.projectId,
          },
          include: {
            projectVariants: {
              where: {
                frontendVariant: input.frontendVariant,
                backendVariant: input.backendVariant,
              },
              include: {
                instructions: {
                  include: {
                    codeBlock: true,
                    successMedia: true,
                  },
                },
              },
            },
          },
        };
        const post = await ctx.prisma.projects.findUnique(filter);

        if (!post) throw new TRPCError({ code: "NOT_FOUND" });

        ctx.log?.info("[projects] Completed endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
          data: JSON.stringify({
            id: post.id,
            title: post.title,
            description: post.description,
          }),
        });

        return post as Prisma.ProjectsGetPayload<{
          include: {
            projectVariants: {
              include: {
                instructions: {
                  include: {
                    codeBlock: true;
                    successMedia: true;
                  };
                };
              };
            };
          };
        }>;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          userId: ctx.userId,
          function: "getById",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  getUsersPurchasedProjects: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projects] Starting endpoint", {
          userId: ctx.userId,
          function: "getUsersPurchasedProjects",
          input: JSON.stringify(input),
        });
        if (!input.userId) return null;
        const filter: ProjectsFindManyArgs = {
          where: {
            purchases: {
              some: {
                userId: input.userId,
              },
            },
          },
        };
        const posts = await ctx.prisma.projects.findMany(filter);

        ctx.log?.info("[projects] Completed endpoint", {
          userId: ctx.userId,
          function: "getUsersPurchasedProjects",
          input: JSON.stringify(input),
          posts: JSON.stringify(posts),
        });

        return posts;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          userId: ctx.userId,
          function: "getUsersPurchasedProjects",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  create: adminProcedure
    .input(
      z.object({
        frontendVariant: z.nativeEnum(FrontendVariant),
        backendVariant: z.nativeEnum(BackendVariant),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const authorId = ctx.userId;
        const { frontendVariant, backendVariant } = input;
        ctx.log?.info("[projects] Starting endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });
        const result = await ctx.prisma.projects.create({
          data: {
            authorId,
            projectVariants: {
              create: [
                {
                  frontendVariant: frontendVariant,
                  backendVariant: backendVariant,
                  instructions: {
                    create: [
                      {
                        codeBlock: {
                          create: [
                            {
                              fileName: "index.tsx",
                              code: "console.log('Hello World!');",
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
        ctx.log?.info("[projects] Completed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
        });
        return result;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          userId: ctx.userId,
          function: "create",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
