import Header from "~/components/Common/Header";
import React from "react";
import BackgroundGradient from "~/components/Common/BackgroundGradient";
import { getAuth } from "@clerk/nextjs/server";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { type GetServerSideProps } from "next";
import { type CustomSessionClaims } from "~/utils/types";
import { type Projects } from "@prisma/client";
import { PostHog } from "posthog-node";
import { useRouter } from "next/router";

type Props = {
  projects: Projects[];
  isNewProjectsUIEnabled: boolean;
};
export default function MyProjects({
  isNewProjectsUIEnabled,
  projects,
}: Props) {
  const router = useRouter();
  if (!isNewProjectsUIEnabled) {
    void router.push("/projects");
  }

  return (
    <div>
      <BackgroundGradient />
      <Header />
      {projects.length === 0 && (
        <div className={"flex justify-center text-4xl font-bold"}>
          {
            "You haven't created a project tutorial yet. Create your first one below!"
          }
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = getAuth(context.req);
  const userId = session.userId;
  const isAdmin =
    (session.sessionClaims as CustomSessionClaims)?.publicMetadata?.isAdmin ??
    false;
  let projects: Projects[] = [];
  if (userId) {
    const ssg = generateSSGHelper(userId ?? undefined, isAdmin);
    projects =
      (await ssg.projects.getUsersCreatedProjects.fetch({ userId })) ?? [];
  }

  let isNewProjectsUIEnabled = false;
  if (userId) {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    });

    isNewProjectsUIEnabled =
      (await client.isFeatureEnabled("new-projects-ui", userId)) ?? false;

    await client.shutdownAsync();
  }

  return {
    props: {
      projects,
      isNewProjectsUIEnabled,
    },
  };
};
