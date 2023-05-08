import { useState } from "react";
import DraftInstructionalTextComponent from "~/components/DraftProjects/DraftInstructionalTextComponent";
import QuestionAndAnswerComponent from "~/components/QuestionsAndAnswers/QuestionAndAnswerComponent";
import QuestionsPlaceholder from "~/components/Images/Questions";

enum SideBarContent {
  INSTRUCTIONS = "Instructions",
  QUESTIONS = "Questions",
}

type Props = {
  explanation: string;
  instructionId: string;
  index: number;
  isEditing: boolean;
  isAuthor: boolean;
  isQAFeatureEnabled: boolean;
};
export default function InstructionLeftSidebar({
  explanation,
  instructionId,
  index,
  isEditing,
  isAuthor,
  isQAFeatureEnabled,
}: Props) {
  const [focusedSideBarContent, setFocusedSideBarContent] = useState(
    SideBarContent.INSTRUCTIONS
  );
  return (
    <div className={"relative h-full overflow-y-hidden"}>
      <div className={"flex w-full justify-center"}>
        {Object.values(SideBarContent).map((sideBarContent, index) => (
          <div
            className={`w-1/2 border py-2 text-center hover:cursor-pointer hover:bg-gray-200
                ${focusedSideBarContent === sideBarContent ? "bg-gray-200" : ""}
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
        {focusedSideBarContent === SideBarContent.INSTRUCTIONS && (
          <DraftInstructionalTextComponent
            initialValue={explanation}
            instructionId={instructionId}
            index={index}
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
