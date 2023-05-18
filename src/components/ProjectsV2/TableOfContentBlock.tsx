import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { type KeyboardEvent, useState } from "react";

type Props = {
  entry: { id: string; title: string };
  instructionId: string;
  projectId: string;
  index: number;
  isEditingProject: boolean;
};
export default function TableOfContentBlock({
  entry,
  instructionId,
  projectId,
  index,
  isEditingProject,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const router = useRouter();

  const { mutate: deleteInstruction, isLoading: isDeletingInstruction } =
    api.instructions.delete.useMutation({
      onSuccess: () => {
        void router.replace(router.asPath);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error(
            "Failed to create a new instruction. Please try again later."
          );
        }
      },
    });

  const { mutate: updateInstruction, isLoading: isUpdatingInstruction } =
    api.instructions.update.useMutation({
      onSuccess: () => {
        void router.replace(router.asPath);
        setIsEditingTitle(false);
      },
    });

  function handleEnterKeyPress<T = Element>(f: () => void) {
    return handleKeyPress<T>(f, "Enter");
  }

  function handleKeyPress<T = Element>(f: () => void, key: string) {
    return (e: KeyboardEvent<T>) => {
      if (e.key === key) {
        f();
      }
    };
  }

  return (
    <button
      key={entry.id}
      className={`flex items-center justify-between border p-4 text-left text-lg font-bold hover:bg-gray-100 ${
        instructionId === entry.id ? "bg-gray-300" : ""
      }`}
      onClick={() => {
        void (async () => {
          await router.push(
            `/projectsv2/${projectId}?instructionId=${entry.id}`
          );
        })();
      }}
    >
      {isEditingTitle ? (
        <div className={"flex items-center"}>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEnterKeyPress(() =>
                updateInstruction({
                  instructionId,
                  title,
                })
              )}
            />
          </div>
        </div>
      ) : (
        <p>
          {index + 1}. {entry.title}{" "}
        </p>
      )}
      {(isDeletingInstruction || isUpdatingInstruction) && (
        <LoadingSpinner styleOverride={"h-6 w-6"} />
      )}
      {isEditingTitle && !isUpdatingInstruction && (
        <CheckIcon className={"h-6 w-6 text-green-500"} />
      )}
      {isEditingProject && !isEditingTitle && !isDeletingInstruction && (
        <div className={"flex gap-4"}>
          <PencilIcon
            className={"h-6 w-6 text-indigo-500 hover:cursor-pointer"}
            onClick={() => setIsEditingTitle(true)}
          />
          <XMarkIcon
            className={"h-6 w-6 text-red-500 hover:cursor-pointer"}
            onClick={() =>
              deleteInstruction({
                id: entry.id,
              })
            }
          />
        </div>
      )}
    </button>
  );
}
