import { useRouter } from "next/router";
import {
  BackendVariant,
  FrontendVariant,
  ProjectAccessType,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
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
import CodeBlocks from "~/components/ProjectsV2/CodeBlocks";

type Props = {
  projectInstructionTitles: { id: string; title: string }[];
  isQAFeatureEnabled: boolean;
  isAuthor: boolean;
  numberOfPreviewPages: number;
  projectAccessType: ProjectAccessType;
  stripePriceId: string;
  projectVariantId?: string;
};

export default function EditProject({
  isQAFeatureEnabled,
  projectInstructionTitles,
  isAuthor,
  numberOfPreviewPages,
  projectAccessType,
  stripePriceId,
  projectVariantId,
}: Props) {
  const user = useUser();
  const isAdmin = user?.user?.publicMetadata.isAdmin as boolean;
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { instructionId, projectId, successfullyPurchased } = router.query as {
    instructionId?: string;
    projectId: string;
    successfullyPurchased?: string;
  };

  useEffect(() => {
    const defaultInstructionId = projectInstructionTitles[0]?.id;
    if (!instructionId && defaultInstructionId) {
      void router.replace(
        `${router.asPath}?instructionId=${defaultInstructionId}`
      );
    }
  }, []);

  const indexOfCurrentInstruction = projectInstructionTitles.findIndex(
    (instruction) => instruction.id === instructionId
  );

  const isAtPagePreviewLimit =
    indexOfCurrentInstruction >= numberOfPreviewPages;

  const { data: instruction, isFetching: isFetchingInstruction } =
    api.instructions.getById.useQuery(
      {
        instructionId: instructionId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const { data: purchasedProjects, isFetching: isFetchingPurchasedProjects } =
    api.projects.getUsersPurchasedProjects.useQuery(
      {
        userId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const findPreviousInstruction = () => {
    const currentInstructionIndex = projectInstructionTitles.findIndex(
      (instruction) => instruction.id === instructionId
    );

    // instruction not found
    if (currentInstructionIndex === -1) {
      // TODO (add sentry alert if instruction index is not found)
      log.error(
        `[projectsv2][findPreviousInstruction] Instruction id index not found`,
        {
          instructionId,
          projectId,
        }
      );
      return null;
    }

    if (currentInstructionIndex === 0) return null;

    return projectInstructionTitles[currentInstructionIndex - 1];
  };

  const findNextInstruction = () => {
    const currentInstructionIndex = projectInstructionTitles.findIndex(
      (instruction) => instruction.id === instructionId
    );

    // instruction not found
    if (currentInstructionIndex === -1) {
      // TODO (add sentry alert if instruction index is not found)
      log.error(
        `[projectsv2][findNextInstruction] Instruction id index not found`,
        {
          instructionId,
          projectId,
        }
      );
      return null;
    }

    if (currentInstructionIndex === projectInstructionTitles.length - 1)
      return null;

    return projectInstructionTitles[currentInstructionIndex + 1];
  };

  if (!projectId) return <div>404</div>;
  if (isFetchingPurchasedProjects || isFetchingInstruction)
    return <LoadingSpinner />;

  const purchasedProject = purchasedProjects?.find(
    (purchasedProject) => purchasedProject.id === projectId
  );

  if (!instruction) return <div> 404 </div>;

  const isFreeProject = projectAccessType === ProjectAccessType.Free;

  const previousInstruction = findPreviousInstruction();
  const nextInstruction = findNextInstruction();

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
        <div className={"flex h-[80vh]"}>
          <div
            className={`${
              instruction.hasCodeBlocks &&
              (isFreeProject || purchasedProject || !isAtPagePreviewLimit)
                ? "w-1/3"
                : "w-full"
            }`}
          >
            <InstructionSidebar
              isEditing={isEditing}
              isAuthor={isAdmin}
              isQAFeatureEnabled={isQAFeatureEnabled}
              projectInstructionTitles={projectInstructionTitles}
              instruction={instruction}
              projectId={projectId}
              isAtPagePreviewLimit={isAtPagePreviewLimit}
              hasPurchasedProject={
                purchasedProject !== null && purchasedProject !== undefined
              }
              stripePriceId={stripePriceId}
              projectAccessType={projectAccessType}
            />
          </div>
          {instruction.hasCodeBlocks &&
            projectVariantId &&
            (isFreeProject || purchasedProject || !isAtPagePreviewLimit) && (
              <div className={"w-2/3"}>
                <CodeBlocks
                  instruction={instruction}
                  isAuthor={isAuthor}
                  isAdmin={isAdmin}
                  isEditing={isEditing}
                  projectVariantId={projectVariantId}
                />
              </div>
            )}
        </div>

        <div className={"flex justify-end gap-4 pb-8"}>
          {previousInstruction && (
            <button
              type="button"
              className="w-48 rounded-full bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
              onClick={() => {
                void (async () => {
                  if (previousInstruction) {
                    await router.push(
                      `/projectsv2/${projectId}?instructionId=${previousInstruction.id}`
                    );
                  }
                })();
              }}
            >
              Back
            </button>
          )}
          {nextInstruction ? (
            <>
              <button
                type="button"
                className="w-48 rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  void (async () => {
                    const nextInstruction = findNextInstruction();
                    if (nextInstruction) {
                      await router.push(
                        `/projectsv2/${projectId}?instructionId=${nextInstruction.id}`
                      );
                    }
                  })();
                }}
              >
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              className="w-48 rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                void (async () => {
                  await router.push(`/projectsv2/${projectId}/completed`);
                })();
              }}
            >
              Finish tutorial
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  log.info("[projectsv2]/[projectId] Starting getServerSideProps");
  const ssg = generateSSGHelper();
  const projectId = context.params?.projectId as string;
  if (!projectId) {
    log.error(
      "[projectsv2]/[projectId] No projectId found in getServerSideProps"
    );
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
        isAuthor: false,
        numberOfPreviewPages: 0,
        projectAccessType: ProjectAccessType.Paid,
        stripePriceId: "",
      },
    };
  }
  const project = await ssg.projects.getProjectVariantId.fetch({
    projectsId: projectId,
    frontendVariant: FrontendVariant.NextJS,
    backendVariant: BackendVariant.Supabase,
  });

  if (
    !project ||
    project.projectVariants.length === 0 ||
    project.projectVariants.length > 1
  ) {
    log.error(
      "[projectsv2]/[projectId] No project found in getServerSideProps"
    );
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
        isAuthor: false,
        numberOfPreviewPages: 0,
        projectAccessType: ProjectAccessType.Paid,
        stripePriceId: "",
      },
    };
  }

  const projectVariant = project.projectVariants[0];

  if (!projectVariant) {
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
        isAuthor: false,
        numberOfPreviewPages: 0,
        projectAccessType: ProjectAccessType.Paid,
        stripePriceId: "",
      },
    };
  }

  const projectInstructionTitles =
    await ssg.instructions.getInstructionTitlesForProjectVariantId.fetch({
      projectVariantId: projectVariant.id,
    });

  if (!projectInstructionTitles) {
    log.error(
      "[projectsv2]/[projectId] No project instruction titles found in getServerSideProps"
    );
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
        isAuthor: false,
        numberOfPreviewPages: 0,
        projectAccessType: ProjectAccessType.Paid,
        stripePriceId: "",
      },
    };
  }

  const { userId } = getAuth(context.req);

  let isQAFeatureEnabled = true;
  let numberOfPreviewPages = 5;
  if (userId) {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    });

    isQAFeatureEnabled =
      (await client.isFeatureEnabled("q-a-feature", userId)) ?? true;

    const numberOfPreviewPagesPayload = (await client.getFeatureFlagPayload(
      "number_of_preview_pages",
      userId
    )) as { number_of_preview_pages: number } | undefined;

    numberOfPreviewPages =
      numberOfPreviewPagesPayload?.number_of_preview_pages ?? 5;

    await client.shutdownAsync();
  }

  const isAuthor = userId === projectVariant.authorId;

  const projectAccessType = project.projectAccessType;

  if (!projectAccessType) {
    return {
      props: {
        projectInstructionTitles: [],
        isQAFeatureEnabled: false,
        isAuthor: false,
        numberOfPreviewPages: 0,
        projectAccessType: ProjectAccessType.Paid,
        stripePriceId: "",
      },
    };
  }

  log.info("[projectsv2]/[projectId] Completed getServerSideProps");

  return {
    props: {
      // TODO: Debug why is Superjson unable to parse the dates in the createdAt field?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      projectInstructionTitles: projectInstructionTitles ?? [],
      isQAFeatureEnabled,
      isAuthor,
      numberOfPreviewPages,
      projectAccessType: projectAccessType,
      stripePriceId: project.stripePriceId,
      projectVariantId: projectVariant.id,
    },
  };
};
