import { createTRPCRouter } from "~/server/api/trpc";
import { projectsRouter } from "~/server/api/routers/projects";
import { instructionsRouter } from "~/server/api/routers/instructions";
import { codeBlocksRouter } from "~/server/api/routers/codeBlocks";
import { purchasesRouter } from "~/server/api/routers/purchases";
import { stripeRouter } from "~/server/api/routers/stripe";
import { questionsRouter } from "~/server/api/routers/questions";
import { commentsRouter } from "~/server/api/routers/comments";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  instructions: instructionsRouter,
  codeBlocks: codeBlocksRouter,
  comments: commentsRouter,
  purchases: purchasesRouter,
  questions: questionsRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
