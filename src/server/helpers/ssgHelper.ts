import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { createInnerTRPCContext } from "~/server/api/trpc";

export const generateSSGHelper = (userId?: string, isAdmin?: boolean) =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(userId, isAdmin),
    transformer: superjson, // optional - adds superjson serialization
  });
