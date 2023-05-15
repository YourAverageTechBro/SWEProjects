import { useCallback, useEffect, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { debounce } from "throttle-debounce";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MdEditor from "~/components/Common/MdEditor/MdEditor";

type Props = {
  instructionId: string;
  readOnly: boolean;
  isAuthor: boolean;
  initialExplanation: string;
};
export default function TextExplanationComponent({
  instructionId,
  readOnly,
  isAuthor,
  initialExplanation,
}: Props) {
  const [explanation, setExplanation] = useState<string | undefined>(
    initialExplanation
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const debouncedSave = useCallback(
    debounce(1000, (instructionId: string, explanation: string) => {
      mutate({ instructionId, explanation });
    }),
    []
  );

  useEffect(() => {
    try {
      if (explanation && isAuthor) {
        debouncedSave(instructionId, explanation);
      }
    } catch (error: any) {}
  }, [explanation, debouncedSave]);

  const { mutate } = api.instructions.update.useMutation({
    onSuccess: () => {
      if (!isInitialized) {
        setIsInitialized(true);
      } else {
        // Show successfully saved state
        toast.success("Saved!");
      }
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to save! Please try again later.");
      }
    },
  });

  return (
    <div
      className={"h-[70vh] w-full overflow-scroll rounded-lg border"}
      data-color-mode="light"
    >
      <MdEditor
        value={explanation}
        onChange={setExplanation}
        index={0}
        hideToolbar={readOnly}
        preview={readOnly ? "preview" : "live"}
        height={"100%"}
      />
    </div>
  );
}
