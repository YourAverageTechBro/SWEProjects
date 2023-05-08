import QuestionBox from "~/components/QuestionsAndAnswers/QuestionBox";
import QuestionsList from "~/components/QuestionsAndAnswers/QuestionsList";
import FocusedQuestionComponent from "~/components/DraftProjects/FocusedQuestion";
import { useState } from "react";
import { type Comment, type Questions } from "@prisma/client";

type Props = {
  instructionsId: string;
};
export default function QuestionAndAnswerComponent({ instructionsId }: Props) {
  const [focusedQuestion, setFocusedQuestion] = useState<
    Questions & { comments: Comment[] }
  >();

  return (
    <div>
      {" "}
      {focusedQuestion ? (
        <FocusedQuestionComponent
          question={focusedQuestion}
          setFocusedQuestion={setFocusedQuestion}
        />
      ) : (
        <>
          <QuestionBox instructionsId={instructionsId} />{" "}
          <div className="mt-4 border-t border-gray-400"></div>
          <QuestionsList
            instructionsId={instructionsId}
            setFocusedQuestion={setFocusedQuestion}
          />
        </>
      )}
    </div>
  );
}
