import { useState } from "react";
import QuestionsPlaceholder from "~/components/Images/Questions";
import TextExplanationComponent from "~/components/ProjectsV2/TextExplanationComponent";
import { type Instructions, ProjectAccessType } from "@prisma/client";
import QuestionAndAnswerComponent from "~/components/QuestionsAndAnswers/QuestionAndAnswerComponent";
import { useRouter } from "next/router";
import QuestionsPurchaseNudge from "~/components/ProjectsV2/QuestionsPurchaseNudge";
import PurchaseNudge from "~/components/ProjectsV2/PurchaseNudge";
import { PlusIcon } from "@heroicons/react/24/solid";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import TableOfContentBlock from "~/components/ProjectsV2/TableOfContentBlock";

enum SideBarContent {
  TABLE_OF_CONTENTS = "Table of Contents",
  INSTRUCTIONS = "Instructions",
  QUESTIONS = "Questions",
}

type Props = {
  isEditing: boolean;
  isAuthor: boolean;
  isQAFeatureEnabled: boolean;

  projectInstructionTitles: { id: string; title: string }[];
  instruction: Instructions;
  projectId: string;
  isAtPagePreviewLimit: boolean;
  hasPurchasedProject: boolean;
  stripePriceId: string;
  projectAccessType: ProjectAccessType;
};
export default function InstructionLeftSidebar({
  isEditing,
  isAuthor,
  isQAFeatureEnabled,
  projectInstructionTitles,
  instruction,
  projectId,
  isAtPagePreviewLimit,
  hasPurchasedProject,
  stripePriceId,
  projectAccessType,
}: Props) {
  const isFreeProject = projectAccessType === ProjectAccessType.Free;
  const router = useRouter();
  const [focusedSideBarContent, setFocusedSideBarContent] = useState(
    SideBarContent.INSTRUCTIONS
  );

  const { mutate: createNewInstruction, isLoading: isCreatingNewInstruction } =
    api.instructions.createEmptyInstruction.useMutation({
      onSuccess: () => {
        void router.replace(router.asPath);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error(
            "Failed to create a new instruction. Please try again later."
          );
        }
      },
    });

  return (
    <div className={"h-70vh relative h-full overflow-y-scroll"}>
      <div className={"flex w-full justify-center"}>
        {Object.values(SideBarContent).map((sideBarContent, index) => (
          <div
            className={`w-1/2 border py-2 text-center hover:cursor-pointer hover:bg-gray-200
                ${
                  focusedSideBarContent === sideBarContent
                    ? "border-b-4 border-b-blue-600"
                    : ""
                }
                `}
            key={index}
            onClick={() =>
              setFocusedSideBarContent(sideBarContent as SideBarContent)
            }
          >
            {sideBarContent}
          </div>
        ))}
      </div>
      <div className={"flex h-[70vh] flex-col overflow-scroll"}>
        {focusedSideBarContent === SideBarContent.TABLE_OF_CONTENTS &&
          projectInstructionTitles.map((entry, index) => (
            <TableOfContentBlock
              entry={entry}
              instructionId={instruction.id}
              projectId={projectId}
              index={index}
              key={index}
              isEditingProject={isEditing}
            />
          ))}
        {focusedSideBarContent === SideBarContent.TABLE_OF_CONTENTS &&
          isEditing && (
            <button
              className={
                "mx-4 mt-4 inline-flex justify-center rounded-md border py-4 hover:bg-gray-200"
              }
              onClick={() => createNewInstruction({ projectsId: projectId })}
            >
              {isCreatingNewInstruction ? (
                <LoadingSpinner styleOverride={"h-6 w-6"} />
              ) : (
                <PlusIcon className={"h-6 w-6"} />
              )}
            </button>
          )}

        {focusedSideBarContent === SideBarContent.INSTRUCTIONS &&
          (hasPurchasedProject || !isAtPagePreviewLimit || isFreeProject) && (
            <TextExplanationComponent
              instructionId={instruction.id}
              readOnly={!isEditing}
              isAuthor={isAuthor}
              initialExplanation={instruction.explanation}
            />
          )}

        {focusedSideBarContent === SideBarContent.INSTRUCTIONS &&
          !hasPurchasedProject &&
          isAtPagePreviewLimit &&
          !isFreeProject && (
            <PurchaseNudge
              projectId={projectId}
              stripePriceId={stripePriceId}
              instructionId={instruction.id}
            />
          )}

        {focusedSideBarContent === SideBarContent.QUESTIONS &&
          isQAFeatureEnabled &&
          hasPurchasedProject && (
            <div className={"h-full w-full overflow-scroll"}>
              <QuestionAndAnswerComponent
                instructionId={instruction.id}
                projectId={projectId}
              />
            </div>
          )}

        {focusedSideBarContent === SideBarContent.QUESTIONS &&
          isQAFeatureEnabled &&
          !hasPurchasedProject && (
            <div className={"h-full w-full overflow-scroll"}>
              <QuestionsPurchaseNudge
                projectId={projectId}
                stripePriceId={stripePriceId}
                instructionId={instruction.id}
              />
            </div>
          )}
        {focusedSideBarContent === SideBarContent.QUESTIONS &&
          !isQAFeatureEnabled && (
            <div
              className={
                "flex w-full flex-col items-center justify-center gap-8 px-8 text-center"
              }
            >
              {" "}
              <QuestionsPlaceholder />{" "}
              <p className={"text-4xl font-bold"}>
                {" "}
                We are launching the questions feature soon!{" "}
              </p>
              <p className={"text-2xl font-semibold text-gray-500"}>
                Hold onto your questions for now and we will let you know when
                you can add them here!
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
