import { useState } from "react";
import QuestionsPlaceholder from "~/components/Images/Questions";
import TextExplanationComponent from "~/components/ProjectsV2/TextExplanationComponent";
import { type Instructions, ProjectAccessType } from "@prisma/client";
import QuestionAndAnswerComponent from "~/components/QuestionsAndAnswers/QuestionAndAnswerComponent";
import { useRouter } from "next/router";
import QuestionsPurchaseNudge from "~/components/ProjectsV2/QuestionsPurchaseNudge";
import PurchaseNudge from "~/components/ProjectsV2/PurchaseNudge";

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

  return (
    <div className={"relative h-full overflow-y-hidden"}>
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
          projectInstructionTitles.map((entry, index) => {
            return (
              <button
                key={entry.id}
                className={`border p-4 text-left text-lg font-bold hover:bg-gray-100 ${
                  instruction.id === entry.id ? "bg-gray-300" : ""
                }`}
                onClick={() => {
                  void (async () => {
                    await router.push(
                      `/projectsv2/${projectId}?instructionId=${entry.id}`
                    );
                  })();
                }}
              >
                {index + 1}. {entry.title}
              </button>
            );
          })}

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
          (hasPurchasedProject || isFreeProject) && (
            <div className={"h-full w-full overflow-scroll"}>
              <QuestionAndAnswerComponent
                instructionId={instruction.id}
                projectId={projectId}
              />
            </div>
          )}

        {focusedSideBarContent === SideBarContent.QUESTIONS &&
          isQAFeatureEnabled &&
          !hasPurchasedProject &&
          !isFreeProject && (
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
