import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { getRelativeDate } from "~/utils/utils";
import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  instructionsId: string;
};
export default function QuestionsList({ instructionsId }: Props) {
  const { data, isFetching } =
    api.questions.getAllQuestionsForInstruction.useQuery(
      {
        instructionsId,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  if (isFetching)
    return (
      <div className={"mt-8"}>
        {" "}
        <LoadingSpinner />{" "}
      </div>
    );

  return (
    <div>
      {" "}
      {data?.map((question) => (
        <div
          key={question.id}
          className={
            "rounded-lg bg-gray-100 p-4 hover:cursor-pointer hover:bg-gray-200"
          }
        >
          <div className={"text-2xl font-bold"}> {question.question} </div>
          <div className={"flex items-center justify-between"}>
            <div className={"flex items-center"}>
              <ChatBubbleOvalLeftEllipsisIcon className={"h-4 w-4"} />
              {question.comments.length}
            </div>

            {getRelativeDate(question.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
