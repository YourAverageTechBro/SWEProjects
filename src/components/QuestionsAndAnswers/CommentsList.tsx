import { api } from "~/utils/api";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import EmptyComments from "~/components/Images/EmptyComments";
import { getRelativeDate } from "~/utils/utils";
import { useState } from "react";
import CommentBox from "~/components/QuestionsAndAnswers/CommentBox";

type Props = {
  questionId: string;
};
export default function CommentsList({ questionId }: Props) {
  const [commentToReplyTo, setCommentToReplyTo] = useState("");
  const { data, isFetching } = api.comments.getAllCommentsForQuestion.useQuery(
    {
      questionId,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const cancelReplyToComment = () => setCommentToReplyTo("");

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
          <div
            className={"flex items-center justify-between text-xs font-bold"}
          >
            <div className={"flex items-center gap-2"}>
              <div className={"rounded-full bg-gray-300 px-2 py-2 text-xs"}>
                {comment.username}
              </div>
              <button onClick={() => setCommentToReplyTo(comment.id)}>
                reply
              </button>
            </div>
            <p className={"text-xs text-gray-500"}>
              {getRelativeDate(comment.createdAt)}
            </p>
          </div>
          {commentToReplyTo === comment.id && (
            <div className={"ml-4"}>
              <CommentBox
                questionId={questionId}
                parentCommentId={comment.id}
                cancelCallback={cancelReplyToComment}
              />
            </div>
          )}
          {comment.replies.map((reply) => (
            <>
              <div
                key={reply.id}
                className={"mt-2 rounded-md bg-gray-100 py-2 pl-4"}
              >
                <div>{reply.comment}</div>
                <div
                  className={
                    "flex items-center justify-between text-xs font-bold"
                  }
                >
                  <button onClick={() => setCommentToReplyTo(reply.id)}>
                    reply
                  </button>
                  <p className={"text-xs text-gray-500"}>
                    {getRelativeDate(reply.createdAt)}
                  </p>
                </div>
              </div>

              {commentToReplyTo === reply.id && (
                <div className={"ml-4"}>
                  <CommentBox
                    questionId={questionId}
                    parentCommentId={comment.id}
                    cancelCallback={cancelReplyToComment}
                  />
                </div>
              )}
            </>
          ))}
        </div>
      ))}
    </div>
  );
}
