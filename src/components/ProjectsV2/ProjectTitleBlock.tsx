import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { CheckIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type KeyboardEvent, useState } from "react";

type Props = {
  projectId: string;
  isEditingProject: boolean;
  projectTitle: string;
};
export default function ProjectTitleBlock({
  projectId,
  isEditingProject,
  projectTitle,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(projectTitle);
  const router = useRouter();

  const { mutate: updateProjectTitle, isLoading: isUpdatingProjectTitle } =
    api.projects.update.useMutation({
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
    <div className={"flex items-center gap-8"}>
      {isEditingTitle ? (
        <div className={"ml-16 flex items-center"}>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEnterKeyPress(() =>
                updateProjectTitle({
                  projectId,
                  title,
                })
              )}
            />
          </div>
        </div>
      ) : (
        <p className={"ml-16 text-4xl font-bold"}>{projectTitle}</p>
      )}
      {isUpdatingProjectTitle && <LoadingSpinner styleOverride={"h-6 w-6"} />}
      {isEditingTitle && !isUpdatingProjectTitle && (
        <CheckIcon className={"h-6 w-6 text-green-500"} />
      )}
      {isEditingProject && !isEditingTitle && !isUpdatingProjectTitle && (
        <div className={"flex gap-4"}>
          <PencilIcon
            className={"h-6 w-6 text-indigo-500 hover:cursor-pointer"}
            onClick={() => setIsEditingTitle(true)}
          />
        </div>
      )}
    </div>
  );
}
