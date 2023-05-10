import { useState } from "react";
import QuestionAndAnswerComponent from "~/components/QuestionsAndAnswers/QuestionAndAnswerComponent";
import QuestionsPlaceholder from "~/components/Images/Questions";
import { useRouter } from "next/router";
import TextExplanationComponent from "~/components/ProjectsV2/TextExplanationComponent";

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
};
export default function InstructionLeftSidebar({
  isEditing,
  isAuthor,
  isQAFeatureEnabled,
  projectInstructionTitles,
}: Props) {
  const router = useRouter();
  const { instructionId } = router.query as { instructionId: string };
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
      <div className={"h-full overflow-scroll pb-8"}>
        {focusedSideBarContent === SideBarContent.TABLE_OF_CONTENTS &&
          projectInstructionTitles.map((entry, index) => {
            return (
              <div
                key={entry.id}
                className={`border p-4 text-lg font-bold ${
                  instructionId === entry.id ? "bg-gray-300" : ""
                }`}
              >
                {index + 1}. {entry.title}
              </div>
            );
          })}
        {focusedSideBarContent === SideBarContent.INSTRUCTIONS && (
          <TextExplanationComponent
            instructionId={instructionId}
            readOnly={!isEditing}
            isAuthor={isAuthor}
          />
        )}
        {focusedSideBarContent === SideBarContent.QUESTIONS &&
          isQAFeatureEnabled && (
            <div className={"h-full w-full overflow-scroll"}>
              <QuestionAndAnswerComponent instructionsId={instructionId} />
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
