import { type JwtPayload } from "@clerk/types";

export type CustomSessionClaims = JwtPayload & {
  publicMetadata: {
    isAdmin: boolean;
  };
};
