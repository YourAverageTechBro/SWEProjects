import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { BackendVariant, FrontendVariant, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import ProjectsFindUniqueArgs = Prisma.ProjectsFindUniqueArgs;
import ProjectsFindManyArgs = Prisma.ProjectsFindManyArgs;

export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
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
  }),
  getPreviewById: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        userId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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
    }),
  getById: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        frontendVariant: z.nativeEnum(FrontendVariant),
        backendVariant: z.nativeEnum(BackendVariant),
        userId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.log?.info("[projects] Starting endpoint", {
        userId: ctx.userId,
        function: "getById",
        input: JSON.stringify(input),
      });
      if (!input.projectId) return null;
      if (!input.userId) return null;
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
          purchases: {
            where: {
              userId: input.userId,
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
          purchases: true;
        };
      }>;
    }),
  getUsersPurchasedProjects: publicProcedure
    .input(
      z.object({
        userId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      if (!posts) throw new TRPCError({ code: "NOT_FOUND" });

      ctx.log?.info("[projects] Completed endpoint", {
        userId: ctx.userId,
        function: "getUsersPurchasedProjects",
        input: JSON.stringify(input),
        posts: JSON.stringify(posts),
      });

      return posts;
    }),
  create: privateProcedure
    .input(
      z.object({
        frontendVariant: z.nativeEnum(FrontendVariant),
        backendVariant: z.nativeEnum(BackendVariant),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
});
