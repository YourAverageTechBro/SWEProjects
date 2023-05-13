import QuestionBox from "~/components/QuestionsAndAnswers/QuestionBox";
import QuestionsList from "~/components/QuestionsAndAnswers/QuestionsList";
import FocusedQuestionComponent from "~/components/DraftProjects/FocusedQuestion";
import { useState } from "react";
import { type Questions } from "@prisma/client";

type Props = {
  instructionId: string;
  projectId: string;
};
export default function QuestionAndAnswerComponent({
  instructionId,
  projectId,
}: Props) {
  const [focusedQuestion, setFocusedQuestion] = useState<Questions>();

  return (
    <div className={"overflow-scroll"}>
      {" "}
      {focusedQuestion ? (
        <FocusedQuestionComponent
          question={focusedQuestion}
          setFocusedQuestion={setFocusedQuestion}
        />
      ) : (
        <>
          <QuestionBox instructionId={instructionId} projectId={projectId} />{" "}
          <div className="mt-4 border-t border-gray-400"></div>
          <QuestionsList
            instructionId={instructionId}
            setFocusedQuestion={setFocusedQuestion}
          />
        </>
      )}
    </div>
  );
}
