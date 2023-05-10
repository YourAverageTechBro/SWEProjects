import { useRouter } from "next/router";
import { BackendVariant, FrontendVariant } from "@prisma/client";
import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { type GetServerSideProps } from "next";
import { PostHog } from "posthog-node";
import { log } from "next-axiom";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { getAuth } from "@clerk/nextjs/server";
import InstructionSidebar from "~/components/ProjectsV2/InstructionSidebar";

type Props = {
  projectInstructionTitles: { id: string; title: string }[];
  isQAFeatureEnabled: boolean;
};

export default function EditProject({
  isQAFeatureEnabled,
  projectInstructionTitles,
}: Props) {
  console.log("projectInstructionTitles: ", projectInstructionTitles);
  const user = useUser();
  const isAdmin = user?.user?.publicMetadata.isAdmin as boolean;
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { projectId, successfullyPurchased } = router.query as {
    projectId: string;
    successfullyPurchased?: string;
  };

  const { data: purchasedProjects, isFetching: isFetchingPurchasedProjects } =
    api.projects.getUsersPurchasedProjects.useQuery(
      {
        userId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  if (!projectId) return <div>404</div>;
  if (isFetchingPurchasedProjects) return <LoadingSpinner />;

  const userHasPurchasedProject = purchasedProjects?.some(
    (purchasedProject) => purchasedProject.id === projectId
  );
  if (!userHasPurchasedProject && !isAdmin) return <div> 404 </div>;

  return (
    <>
      <Header />
      <div className={"flex h-full w-full flex-col gap-4"}>
        <div className={"p-2"}>
          {isAdmin && !isEditing && (
            <button
              type="button"
              className="mb-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsEditing(true)}
            >
              Enable Editing
            </button>
          )}

          {isAdmin && isEditing && (
            <button
              type="button"
              className="mb-8 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => setIsEditing(false)}
            >
              Disable Editing
            </button>
          )}

          {successfullyPurchased && successfullyPurchased === "true" && (
            <p
              className={
                "mb-8 rounded-lg bg-green-300 px-4 py-8 text-4xl font-semibold"
              }
            >
              Congrats on purchasing the tutorial! You now have lifetime access
              to it. 🎉
            </p>
          )}
        </div>
        <div className={"flex"}>
          <div className={"w-1/3"}>
            <InstructionSidebar
              isEditing={isEditing}
              isAuthor={isAdmin}
              isQAFeatureEnabled={isQAFeatureEnabled}
              projectInstructionTitles={projectInstructionTitles}
            />
          </div>
          <div className={"w-2/3 bg-green-300"}>placeholder</div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  log.info("[projectsv2/[projectId] Starting getServerSideProps");
  const ssg = generateSSGHelper();
  const projectId = context.params?.projectId as string;
  if (!projectId) {
    log.error(
      "[projectsv2/[projectId] No projectId found in getServerSideProps"
    );
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
      },
    };
  }
  const projectVariant = await ssg.projects.getProjectVariantId.fetch({
    projectsId: projectId,
    frontendVariant: FrontendVariant.NextJS,
    backendVariant: BackendVariant.Supabase,
  });
  console.log("PROJECT VARIANT: ", projectVariant);

  if (!projectVariant) {
    log.error("[projectsv2/[projectId] No project found in getServerSideProps");
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
      },
    };
  }

  const projectInstructionTitles =
    await ssg.instructions.getInstructionTitlesForProjectVariantId.fetch({
      projectVariantId: projectVariant.id,
    });

  if (!projectInstructionTitles) {
    log.error(
      "[projectsv2/[projectId] No project instruction titles found in getServerSideProps"
    );
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
      },
    };
  }

  const { userId } = getAuth(context.req);

  let isQAFeatureEnabled = false;
  if (userId && process.env.NODE_ENV === "production") {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    });

    isQAFeatureEnabled =
      (await client.isFeatureEnabled("q-a-feature", userId)) ?? false;

    await client.shutdownAsync();
  }

  return {
    props: {
      // TODO: Debug why is Superjson unable to parse the dates in the createdAt field?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      projectInstructionTitles: projectInstructionTitles ?? [],
      isQAFeatureEnabled: true,
    },
  };
};
