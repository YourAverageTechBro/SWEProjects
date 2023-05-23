import {
  adminProcedure,
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import ProjectsFindUniqueArgs = Prisma.ProjectsFindUniqueArgs;
import ProjectsFindManyArgs = Prisma.ProjectsFindManyArgs;
import ProjectsUpdateInput = Prisma.ProjectsUpdateInput;

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
  getById: publicProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
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
            instructions: {
              include: {
                codeBlock: true;
                successMedia: true;
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
        if (!input.userId) return [];
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
  create: adminProcedure.mutation(async ({ ctx, input }) => {
    try {
      const authorId = ctx.userId;
      ctx.log?.info("[projects] Starting endpoint", {
        userId: ctx.userId,
        function: "create",
        input: JSON.stringify(input),
      });
      const result = await ctx.prisma.projects.create({
        data: {
          authorId,
          instructions: {
            create: [
              {
                title: "Step title",
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
  getUsersCreatedProjects: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        ctx.log?.info("[projects] Starting endpoint", {
          function: "getUsersCreatedProjects",
          input: JSON.stringify(input),
        });

        const posts = await ctx.prisma.projects.findMany({
          where: {
            authorId: input.userId,
          },
        });

        ctx.log?.info("[projects] Completed endpoint", {
          function: "getUsersCreatedProjects",
          input: JSON.stringify(input),
          post: JSON.stringify(posts),
        });
        return posts;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          function: "getUsersCreatedProjects",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
  update: privateProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { projectId, title } = input;
        ctx.log?.info("[projects] Starting endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
        });

        const updatedData: ProjectsUpdateInput = {};

        if (title) {
          updatedData.title = title;
        }

        const result = await ctx.prisma.projects.update({
          where: {
            id: projectId,
          },
          data: updatedData,
        });

        ctx.log?.info("[projects] Completed endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
          result: JSON.stringify(result),
        });
        return result;
      } catch (error) {
        ctx.log?.error("[projects] Failed endpoint", {
          userId: ctx.userId,
          function: "update",
          input: JSON.stringify(input),
          error: JSON.stringify(error),
        });
        throw error;
      }
    }),
});
