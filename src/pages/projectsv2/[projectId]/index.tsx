import { useRouter } from "next/router";
import { ProjectAccessType, type Projects } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { type GetServerSideProps } from "next";
import { PostHog } from "posthog-node";
import { log } from "next-axiom";
import { api } from "~/utils/api";
import { getAuth } from "@clerk/nextjs/server";
import InstructionSidebar from "~/components/ProjectsV2/InstructionSidebar";
import CodeBlocks from "~/components/ProjectsV2/CodeBlocks";
import { usePostHog } from "posthog-js/react";
import ProjectTitleBlock from "~/components/ProjectsV2/ProjectTitleBlock";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import InstructionsToolbar from "~/components/ProjectsV2/InstructionsToolbar";

type Props = {
  projectInstructionTitles: { id: string; title: string }[];
  isQAFeatureEnabled: boolean;
  isAuthor: boolean;
  numberOfPreviewPages: number;
  projectAccessType: ProjectAccessType;
  stripePriceId: string;
  project: Omit<Projects, "createdAt"> | null;
  hasPurchasedProject: boolean;
  hasEnrolledInProjectPreview: boolean;
};

export default function EditProject({
  isQAFeatureEnabled,
  projectInstructionTitles,
  isAuthor,
  numberOfPreviewPages,
  projectAccessType,
  stripePriceId,
  project,
  hasPurchasedProject,
  hasEnrolledInProjectPreview,
}: Props) {
  const { isSignedIn, user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [viewDiff, setViewDiff] = useState(!isEditing);
  const isAdmin = user?.publicMetadata.isAdmin as boolean;
  const router = useRouter();
  const {
    instructionId = projectInstructionTitles[0]?.id,
    projectId,
    successfullyPurchased,
  } = router.query as {
    instructionId?: string;
    projectId: string;
    successfullyPurchased?: string;
  };
  const postHog = usePostHog();

  const indexOfCurrentInstruction = projectInstructionTitles.findIndex(
    (instruction) => instruction.id === instructionId
  );

  useEffect(() => {
    if (!isAuthor && !hasPurchasedProject && !hasEnrolledInProjectPreview) {
      void router.push(`/projects/preview/${projectId}`);
    }
  }, [
    router,
    isAuthor,
    hasPurchasedProject,
    hasEnrolledInProjectPreview,
    projectId,
  ]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      user &&
      isSignedIn &&
      indexOfCurrentInstruction !== -1
    ) {
      postHog?.identify(user.id, {
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Visit Project Instruction", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
        indexOfCurrentInstruction,
      });
    }
  }, [projectId, isSignedIn, user, indexOfCurrentInstruction, postHog]);

  const isAtPagePreviewLimit =
    indexOfCurrentInstruction >= numberOfPreviewPages;

  const { data: instruction } = api.instructions.getById.useQuery(
    {
      instructionId: instructionId,
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

  if (!instruction || !projectId) return <div> 404 </div>;

  const isFreeProject = projectAccessType === ProjectAccessType.Free;

  const previousInstruction = findPreviousInstruction();
  const nextInstruction = findNextInstruction();

  if (!hasPurchasedProject && !hasEnrolledInProjectPreview) {
    return <LoadingSpinner />;
  }

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
        <ProjectTitleBlock
          projectId={projectId}
          isEditingProject={isEditing}
          projectTitle={project?.title ?? ""}
        />
        <div className={"flex flex-col border sm:h-[70vh] sm:flex-row"}>
          <div
            className={`${
              instruction.hasCodeBlocks &&
              (isFreeProject || hasPurchasedProject || !isAtPagePreviewLimit)
                ? `w-full sm:w-1/3`
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
                hasPurchasedProject !== null &&
                hasPurchasedProject !== undefined
              }
              stripePriceId={stripePriceId}
              projectAccessType={projectAccessType}
            />
          </div>
          {instruction.hasCodeBlocks &&
            (isFreeProject || hasPurchasedProject || !isAtPagePreviewLimit) && (
              <div className={"w-full sm:w-2/3"}>
                <CodeBlocks
                  instruction={instruction}
                  isAuthor={isAuthor}
                  isAdmin={isAdmin}
                  viewDiff={viewDiff}
                  projectId={projectId}
                />
              </div>
            )}

          {(isAuthor || isAdmin) && (
            <InstructionsToolbar
              viewDiff={viewDiff}
              setViewDiff={setViewDiff}
              currentInstruction={instruction}
            />
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

const emptyProps: Props = {
  projectInstructionTitles: [],
  isQAFeatureEnabled: false,
  isAuthor: false,
  numberOfPreviewPages: 0,
  projectAccessType: ProjectAccessType.Paid,
  stripePriceId: "",
  project: null,
  hasPurchasedProject: false,
  hasEnrolledInProjectPreview: false,
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  log.info("[projectsv2]/[projectId] Starting getServerSideProps");
  const ssg = generateSSGHelper();
  const { instructionId, projectId } = context.params as {
    projectId?: string;
    instructionId?: string;
  };
  if (!projectId) {
    log.error(
      "[projectsv2]/[projectId] No projectId found in getServerSideProps"
    );
    return {
      props: emptyProps,
    };
  }
  const project = await ssg.projects.getById.fetch({
    projectId,
  });

  if (!project) {
    log.error(
      "[projectsv2]/[projectId] No project found in getServerSideProps"
    );
    return {
      props: emptyProps,
    };
  }

  const projectInstructionTitles =
    await ssg.instructions.getInstructionTitlesForProjectId.fetch({
      projectsId: project.id,
    });

  if (!projectInstructionTitles) {
    log.error(
      "[projectsv2]/[projectId] No project instruction titles found in getServerSideProps"
    );
    return {
      props: emptyProps,
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

  const isAuthor = userId === project.authorId;

  const projectAccessType = project.projectAccessType;

  if (!projectAccessType) {
    return {
      props: emptyProps,
    };
  }
  const firstInstructionId = projectInstructionTitles[0]?.id;

  const instructionIdToFetch = instructionId ?? firstInstructionId;

  if (instructionIdToFetch) {
    await ssg.instructions.getById.prefetch({
      instructionId: instructionIdToFetch,
    });

    await ssg.codeBlocks.getCodeBlocksForInstructionId.prefetch({
      instructionsId: instructionIdToFetch,
    });
  }

  const purchasedProjects = await ssg.projects.getUsersPurchasedProjects.fetch({
    userId,
  });

  const projectPreviewEnrollments =
    await ssg.projectPreviewEnrollments.getUsersProjectPreviewEnrollmentsForProjectId.fetch(
      {
        userId,
        projectsId: projectId,
      }
    );

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
      project: { ...project, createdAt: null },
      hasPurchasedProject: purchasedProjects?.some(
        (purchasedProject) => purchasedProject.id === projectId
      ),
      hasEnrolledInProjectPreview: projectPreviewEnrollments?.some(
        (projectPreviewEnrollment) =>
          projectPreviewEnrollment.projectsId === projectId
      ),
      trpcState: ssg.dehydrate(),
    },
  };
};
