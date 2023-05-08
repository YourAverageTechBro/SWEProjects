import { ArrowSmallLeftIcon } from "@heroicons/react/24/solid";
import { type Dispatch, type SetStateAction } from "react";
import { type Comment, type Questions } from "@prisma/client";
import CommentBox from "~/components/QuestionsAndAnswers/CommentBox";
import CommentsList from "~/components/QuestionsAndAnswers/CommentsList";

type Props = {
  question: Questions & { comments: Comment[] };
  setFocusedQuestion: Dispatch<
    SetStateAction<(Questions & { comments: Comment[] }) | undefined>
  >;
};
export default function FocusedQuestionComponent({
  question,
  setFocusedQuestion,
}: Props) {
  return (
    <div className={"px-4 py-2"}>
      <button onClick={() => setFocusedQuestion(undefined)}>
        <ArrowSmallLeftIcon className={"h-10 w-10"} />
      </button>
      <div className={"text-4xl font-bold"}>{question.title}</div>
      <div className={"mt-4 text-xl font-medium"}>{question.question}</div>

      <div className="mt-4 border-t border-gray-400"></div>
      <CommentBox questionId={question.id} />
      <CommentsList questionId={question.id} />
    </div>
  );
}
