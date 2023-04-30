import { useRouter } from "next/router";
import { api } from "~/utils/api";
import DraftPageComponent from "../../components/DraftProjects/DraftPageComponent";
import { BackendVariant, FrontendVariant } from "@prisma/client";
import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

export default function EditProject() {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { projectId, successfullyPurchased } = router.query as {
    projectId: string;
    successfullyPurchased?: string;
  };
  const { data, isFetching } = api.projects.getById.useQuery(
    {
      projectId,
      frontendVariant: FrontendVariant.NextJS,
      backendVariant: BackendVariant.Supabase,
      userId,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  if (!projectId) return <div>404</div>;
  if (!data) return <div>404</div>;
  const isAuthor = userId === data.authorId;
  if (isFetching) return <LoadingSpinner />;
  if (data.purchases.length === 0 && !isAuthor) return <div> 404 </div>;

  const projectVariant = data.projectVariants[0];

  return (
    <>
      <Header />
      <div className={"flex h-full w-full flex-col gap-4"}>
        <div className={"p-16"}>
          {userId === data.authorId && !isEditing && (
            <button
              type="button"
              className="mb-8 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsEditing(true)}
            >
              Enable Editing
            </button>
          )}

          {userId === data.authorId && isEditing && (
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
