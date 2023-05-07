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
  const [question, setQuestion] = useState<string | undefined>("");
  const { userId } = useAuth();
  const ctx = api.useContext();

  const { mutate, isLoading } = api.questions.create.useMutation({
    onSuccess: () => {
      setQuestion("");
      void ctx.questions.getAllQuestionsForInstruction.invalidate();
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
    if (question && userId) {
      mutate({ userId, instructionsId, question });
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
