import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { getRelativeDate } from "~/utils/utils";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { type Dispatch, type SetStateAction } from "react";
import { type Questions } from "@prisma/client";
import EmptyComments from "~/components/Images/EmptyComments";

type Props = {
  instructionId: string;
  setFocusedQuestion: Dispatch<SetStateAction<Questions | undefined>>;
};
export default function QuestionsList({
  instructionId,
  setFocusedQuestion,
}: Props) {
  const { data, isFetching } =
    api.questions.getAllQuestionsForInstruction.useQuery(
      {
        instructionsId: instructionId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  if (isFetching) {
    return (
      <div className={"mt-8"}>
        {" "}
        <LoadingSpinner />{" "}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={"mt-8 flex w-full flex-col items-center justify-center"}>
        <p className={"text-4xl font-bold"}> No questions asked...yet 👀</p>
        <p className={"text-2xl"}>
          {" "}
          Ask the first question to get the discussion started{" "}
        </p>
        <EmptyComments />
      </div>
    );
  }

  return (
    <div>
      {" "}
      {data?.map((question) => (
        <div
          key={question.id}
          className={
            "rounded-lg bg-gray-100 p-4 hover:cursor-pointer hover:bg-gray-200"
          }
          onClick={() => setFocusedQuestion(question)}
        >
          <div className={"text-2xl font-bold"}> {question.title} </div>
          <div className={"flex items-center justify-between"}>
            <div className={"flex items-center"}>
              <ChatBubbleOvalLeftEllipsisIcon className={"h-4 w-4"} />
              {question._count.comments}
            </div>

            {getRelativeDate(question.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
