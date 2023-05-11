import {
  CodeBracketSquareIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { type CodeBlocks, type Instructions } from "@prisma/client";

type Props = {
  viewDiff: boolean;
  setViewDiff: (viewDiff: boolean) => void;
  currentInstruction: Instructions;
  codeBlocks: CodeBlocks[];
};
export default function InstructionsToolbar({
  codeBlocks,
  currentInstruction,
  viewDiff,
  setViewDiff,
}: Props) {
  const ctx = api.useContext();

  const { mutate: createNewInstruction } =
    api.instructions.createEmptyInstruction.useMutation({
      onSuccess: () => {
        // Show successfully saved state
        toast.success("Saved!");
        void ctx.projects.getById.invalidate();
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

  const { mutate: updateInstruction } = api.instructions.update.useMutation({
    onSuccess: () => {
      // Show successfully saved state
      toast.success("Saved!");
      void ctx.projects.getById.invalidate();
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

  const { mutate: duplicateInstructions } =
    api.instructions.duplicateInstruction.useMutation({
      onSuccess: () => {
        // Show successfully saved state
        toast.success("Saved!");
        void ctx.projects.getById.invalidate();
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

  const { mutate: deleteInstructionById } = api.instructions.delete.useMutation(
    {
      onSuccess: () => {
        // Show successfully saved state
        toast.success("Saved!");
        void ctx.projects.getById.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to save! Please try again later.");
        }
      },
    }
  );

  const addNewCard = () => {
    const projectVariantId = currentInstruction.projectVariantId;
    if (!projectVariantId) return;
    createNewInstruction({
      projectVariantId: projectVariantId,
    });
  };

  const duplicateCard = () => {
    const projectVariantId = currentInstruction.projectVariantId;
    if (!projectVariantId) return;
    duplicateInstructions({
      projectVariantId: projectVariantId,
      explanation: currentInstruction.explanation,
      codeBlocks: codeBlocks,
    });
  };

  const deleteCard = () => {
    const instructionId = currentInstruction.id;
    if (!instructionId) return;
    deleteInstructionById({
      id: instructionId,
    });
  };

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
    <div className={"flex justify-end gap-8 py-4"}>
      <TrashIcon
        className={"h-6 w-6 text-red-500 hover:cursor-pointer"}
        onClick={deleteCard}
      />
      <DocumentMagnifyingGlassIcon
        className={"h-6 w-6 hover:cursor-pointer"}
        onClick={toggleDiff}
      />
      <CodeBracketSquareIcon
        className={"h-6 w-6 hover:cursor-pointer"}
        onClick={toggleCodeBlock}
      />
      <DocumentDuplicateIcon
        className={"h-6 w-6 hover:cursor-pointer"}
        onClick={duplicateCard}
      />
      <PlusIcon
        className={"h-6 w-6 hover:cursor-pointer"}
        onClick={addNewCard}
      />
    </div>
  );
}
