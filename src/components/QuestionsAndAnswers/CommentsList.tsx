import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import EmptyComments from "~/components/Images/EmptyComments";
import { getRelativeDate } from "~/utils/utils";

type Props = {
  questionId: string;
};
export default function CommentsList({ questionId }: Props) {
  const { data, isFetching } = api.comments.getAllCommentsForQuestion.useQuery(
    {
      questionId,
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
  if (!data) {
    return (
      <div className={"flex flex-col items-center justify-center pt-16"}>
        {" "}
        <EmptyComments tailwindStyle={"w-32 h-32"} />{" "}
        <p> No comments found...yet 👀</p>
      </div>
    );
  }
  return (
    <div className={"mt-4 flex flex-col gap-4"}>
      {data.map((comment) => (
        <div key={comment.id}>
          <div>{comment.comment}</div>
          <p className={"text-xs text-gray-500"}>
            {getRelativeDate(comment.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
