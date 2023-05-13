import QuestionBox from "~/components/QuestionsAndAnswers/QuestionBox";
import QuestionsList from "~/components/QuestionsAndAnswers/QuestionsList";
import FocusedQuestionComponent from "~/components/DraftProjects/FocusedQuestion";
import { useState } from "react";
import { type Questions } from "@prisma/client";

export default function QuestionAndAnswerComponent() {
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
          <QuestionBox /> <div className="mt-4 border-t border-gray-400"></div>
          <QuestionsList setFocusedQuestion={setFocusedQuestion} />
        </>
      )}
    </div>
  );
}
