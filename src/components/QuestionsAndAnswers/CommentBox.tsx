import MdEditor from "~/components/Common/MdEditor/MdEditor";
import React, { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  parentCommentId?: string;
  questionId: string;
  cancelCallback?: () => void;
};
export default function CommentBox({
  parentCommentId,
  questionId,
  cancelCallback,
}: Props) {
  const [comment, setComment] = useState<string | undefined>("");
  const { userId } = useAuth();
  const ctx = api.useContext();

  const { mutate, isLoading } = api.comments.create.useMutation({
    onSuccess: () => {
      setComment("");
      cancelCallback?.();
      void ctx.comments.getAllCommentsForQuestion.invalidate({ questionId });
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to ask the question — please try again later.");
      }
    },
  });

  const postComment = () => {
    if (comment && userId) {
      mutate({ userId, comment, parentCommentId, questionId });
    }
  };

  return (
    <div
      className={"mt-4 h-full w-full overflow-scroll rounded-lg"}
      data-color-mode="light"
    >
      <div className={"px-4"}>
        <label className="text-xl font-bold text-gray-700">Comment</label>
        <MdEditor
          value={comment}
          onChange={setComment}
          index={0}
          hideToolbar={true}
          preview={"edit"}
          height={"100px"}
        />
      </div>
      <button
        type="button"
        className="ml-4 mt-4 inline-flex items-center rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={postComment}
      >
        {isLoading && (
          <LoadingSpinner spinnerColor="fill-indigo-500 text-white" />
        )}{" "}
        Add comment
      </button>

      {cancelCallback && (
        <button
          type="button"
          className="ml-4 rounded-full bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
          onClick={cancelCallback}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
