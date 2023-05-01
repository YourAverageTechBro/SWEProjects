import { useRouter } from "next/router";
import DraftPageComponent from "../../components/DraftProjects/DraftPageComponent";
import {
  BackendVariant,
  type CodeBlocks,
  FrontendVariant,
  type Instructions,
  type Projects,
  type ProjectVariant,
  type SuccessMedia,
} from "@prisma/client";
import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { type GetServerSideProps } from "next";
import { log } from "next-axiom";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  project:
    | (Projects & {
        projectVariants: (ProjectVariant & {
          instructions: (Instructions & {
            successMedia: SuccessMedia[];
            codeBlock: CodeBlocks[];
          })[];
        })[];
      })
    | null
    | undefined;
};

export default function EditProject({ project }: Props) {
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
  if (!project) return <div>404</div>;
  if (isFetchingPurchasedProjects) return <LoadingSpinner />;
  const isAuthor = userId === project.authorId;

  const userHasPurchasedProject = purchasedProjects?.some(
    (purchasedProject) => purchasedProject.id === project?.id
  );
  if (!userHasPurchasedProject && !isAuthor) return <div> 404 </div>;

  const projectVariant = project?.projectVariants?.[0];

  return (
    <>
      <Header />
      <div className={"flex h-full w-full flex-col gap-4"}>
        <div className={"p-16"}>
          {userId === project.authorId && !isEditing && (
            <button
              type="button"
              className="mb-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsEditing(true)}
            >
              Enable Editing
            </button>
          )}

          {userId === project.authorId && isEditing && (
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
          <div className={"flex flex-col gap-16"}>
            {projectVariant?.instructions &&
              projectVariant.instructions.map((instruction, index) => (
                <DraftPageComponent
                  key={instruction.id}
                  previousInstruction={
                    index > 0
                      ? projectVariant.instructions[index - 1]
                      : undefined
                  }
                  currentInstruction={instruction}
                  shouldShowTrashIcon={projectVariant.instructions.length > 1}
                  index={index}
                  isEditing={isEditing}
                  isAuthor={isAuthor}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  log.info("[projects/[projectId] Starting getServerSideProps");
  const ssg = generateSSGHelper();
  const projectId = context.params?.projectId as string;
  if (!projectId) {
    log.error("[projects/[projectId] No projectId found in getServerSideProps");
    return { props: { project: null } };
  }
  const project = await ssg.projects.getById.fetch({
    projectId,
    frontendVariant: FrontendVariant.NextJS,
    backendVariant: BackendVariant.Supabase,
  });

  if (!project) {
    log.error("[projects/[projectId] No project found in getServerSideProps");
    return { props: { project: null } };
  }
  return {
    props: {
      // TODO: Debug why is Superjson unable to parse the dates in the createdAt field?
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      project: JSON.parse(JSON.stringify(project)),
    },
  };
};
