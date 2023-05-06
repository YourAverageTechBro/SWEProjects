import { useCallback, useEffect, useState } from "react";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { debounce } from "throttle-debounce";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MdEditor from "~/components/Common/MdEditor/MdEditor";

type Props = {
  initialValue?: string;
  instructionId: string;
  index: number;
  readOnly: boolean;
  isAuthor: boolean;
};
export default function DraftInstructionalTextComponent({
  initialValue,
  instructionId,
  index,
  readOnly,
  isAuthor,
}: Props) {
  const [explanation, setExplanation] = useState<string | undefined>(
    initialValue
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

  const { mutate, isLoading: isSaving } = api.instructions.update.useMutation({
    onSuccess: (project) => {
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
      className={"h-full w-full overflow-scroll rounded-lg border"}
      data-color-mode="light"
    >
      <MdEditor
        value={explanation}
        onChange={setExplanation}
        index={index}
        hideToolbar={readOnly}
        preview={readOnly ? "preview" : "live"}
        height={"100%"}
      />
    </div>
  );
}
