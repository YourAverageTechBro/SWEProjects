import { useState } from "react";
import DraftInstructionalTextComponent from "~/components/DraftProjects/DraftInstructionalTextComponent";
import QuestionAndAnswerComponent from "~/components/QuestionsAndAnswers/QuestionAndAnswerComponent";

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
};
export default function InstructionLeftSidebar({
  explanation,
  instructionId,
  index,
  isEditing,
  isAuthor,
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
        {focusedSideBarContent === SideBarContent.QUESTIONS && (
          <div className={"h-full w-full"}>
            <QuestionAndAnswerComponent instructionsId={instructionId} />
          </div>
        )}
      </div>
    </div>
  );
}
