import { type Comment } from "@prisma/client";
import { getRelativeDate } from "~/utils/utils";

type Props = {
  comments: Comment[];
};
export default function CommentsList({ comments }: Props) {
  return (
    <div className={"mt-4 flex flex-col gap-4"}>
      {comments.map((comment) => (
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
