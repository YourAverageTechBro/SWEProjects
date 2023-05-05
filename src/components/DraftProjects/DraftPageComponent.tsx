import { type CodeBlocks, type Instructions } from "@prisma/client";
import DraftCodeBlocks from "~/components/DraftProjects/DraftCodeBlocks";
import { toast, Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import {
  CodeBracketSquareIcon,
  DocumentDuplicateIcon,
  DocumentMagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import DraftLeftSidebar from "~/components/DraftProjects/InstructionLeftSidebar";

type Props = {
  instructions: (Instructions & {
    codeBlock: CodeBlocks[];
  })[];
  currentInstruction: Instructions & {
    codeBlock: CodeBlocks[];
  };
  shouldShowTrashIcon: boolean;
  index: number;
  isEditing: boolean;
  isAuthor: boolean;
};
export default function DraftPageComponent({
  instructions,
  currentInstruction,
  shouldShowTrashIcon,
  index,
  isEditing,
  isAuthor,
}: Props) {
  const [viewDiff, setViewDiff] = useState(false);
  const { explanation } = currentInstruction;

  const ctx = api.useContext();

  const { mutate: createNewInstruction, isLoading: isCreatingNewInstruction } =
    api.instructions.createEmptyInstruction.useMutation({
      onSuccess: (project) => {
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

  const { mutate: updateInstruction, isLoading: isUpdatingInstruction } =
    api.instructions.update.useMutation({
      onSuccess: (project) => {
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

  const {
    mutate: duplicateInstructions,
    isLoading: isDuplicatingInstructions,
  } = api.instructions.duplicateInstruction.useMutation({
    onSuccess: (project) => {
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

  const {
    mutate: deleteInstructionById,
    isLoading: isDeletingInstructionById,
  } = api.instructions.delete.useMutation({
    onSuccess: (project) => {
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
      explanation,
      codeBlocks: currentInstruction.codeBlock,
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
    <div className={"flex h-full flex-col items-end gap-2"}>
      {isAuthor && isEditing && (
        <div className={"flex gap-8"}>
          {shouldShowTrashIcon && (
            <TrashIcon
              className={"h-6 w-6 text-red-500 hover:cursor-pointer"}
              onClick={deleteCard}
            />
          )}
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
      )}
      <div
        className={"flex w-full rounded-lg border shadow-lg"}
        style={{ height: "800px" }}
      >
        <div
          className={`${currentInstruction.hasCodeBlocks ? "w-1/3" : "w-full"}`}
        >
          <DraftLeftSidebar
            explanation={explanation}
            instructionId={currentInstruction.id}
            index={index}
            isEditing={isEditing}
            isAuthor={isAuthor}
          />
        </div>
        {currentInstruction.hasCodeBlocks && (
          <DraftCodeBlocks
            codeBlocks={currentInstruction.codeBlock}
            instructionsId={currentInstruction.id}
            instructions={instructions}
            viewDiff={viewDiff || !isEditing}
            isAuthor={isAuthor}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
}
