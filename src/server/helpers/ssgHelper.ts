import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { createInnerTRPCContext } from "~/server/api/trpc";

export const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({}),
    transformer: superjson, // optional - adds superjson serialization
  });
