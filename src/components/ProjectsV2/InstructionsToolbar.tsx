import {
  CodeBracketSquareIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { type Instructions } from "@prisma/client";
import { useRouter } from "next/router";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  viewDiff: boolean;
  setViewDiff: (viewDiff: boolean) => void;
  currentInstruction: Instructions;
};
export default function InstructionsToolbar({
  currentInstruction,
  viewDiff,
  setViewDiff,
}: Props) {
  const router = useRouter();

  const { mutate: updateInstruction, isLoading } =
    api.instructions.update.useMutation({
      onSuccess: () => {
        // Show successfully saved state
        toast.success("Saved!");
        void router.replace(router.asPath);
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

  const toggleCodeBlock = () => {
    const instructionId = currentInstruction.id;
    if (!instructionId) return;
    updateInstruction({
      instructionId,
      hasCodeBlocks: !currentInstruction.hasCodeBlocks,
    });
  };

  const toggleDiff = () => setViewDiff(!viewDiff);
  return (
    <div className={"flex flex-col gap-8 px-4 py-4"}>
      <div className="group relative flex">
        <DocumentMagnifyingGlassIcon
          className={"h-6 w-6 text-gray-500 hover:cursor-pointer"}
          onClick={toggleDiff}
        />
        <span
          className="absolute right-1/2 z-10 rounded-md bg-gray-800
    px-1 text-sm text-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
        >
          Toggle diff view
        </span>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="group relative flex">
          <CodeBracketSquareIcon
            className={"h-6 w-6 text-gray-500 hover:cursor-pointer"}
            onClick={toggleCodeBlock}
            title={"Toggle code blocks"}
          />
          <span
            className="absolute right-1/2 z-10 rounded-md bg-gray-800
    px-1 text-sm text-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
          >
            Toggle code blocks
          </span>
        </div>
      )}
    </div>
  );
}
