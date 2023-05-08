import MdEditor from "~/components/Common/MdEditor/MdEditor";
import React, { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  instructionsId: string;
};
export default function QuestionBox({ instructionsId }: Props) {
  const [title, setTitle] = useState<string | undefined>("");
  const [question, setQuestion] = useState<string | undefined>("");
  const { userId } = useAuth();
  const ctx = api.useContext();

  const { mutate, isLoading } = api.questions.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setQuestion("");
      void ctx.comments.getAllCommentsForQuestion.invalidate();
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

  const postQuestion = () => {
    if (title && question && userId) {
      mutate({ userId, instructionsId, question, title });
    }
  };

  return (
    <div
      className={"h-full w-full overflow-scroll rounded-lg"}
      data-color-mode="light"
    >
      <p className={"my-4 text-center text-2xl font-semibold"}>
        {" "}
        Ask a question below{" "}
      </p>
      <div className={"px-4"}>
        <label className="text-xl font-bold text-gray-700">
          {" "}
          Question Title:
        </label>
        <input
          className="mb-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="text-xl font-bold text-gray-700">
          {" "}
          Question Details:
        </label>
        <MdEditor
          value={question}
          onChange={setQuestion}
          index={0}
          hideToolbar={true}
          preview={"edit"}
          height={"150px"}
        />
      </div>
      <button
        type="button"
        className="ml-4 mt-4 inline-flex items-center rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={postQuestion}
      >
        {isLoading && (
          <LoadingSpinner spinnerColor="fill-indigo-500 text-white" />
        )}{" "}
        Submit Question
      </button>
    </div>
  );
}
