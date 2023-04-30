import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { BackendVariant, FrontendVariant } from "@prisma/client";
import Selectors from "~/components/Common/Selectors";
import { useState } from "react";

export default function Projects() {
  const router = useRouter();
  const ctx = api.useContext();

  const [selectedFrontendVariant, setSelectedFrontendVariant] =
    useState<string>("");
  const [selectedBackendVariant, setSelectedBackendVariant] =
    useState<string>("");
  const { data, isLoading: isFetching } = api.projects.getAll.useQuery();
  const { mutate, isLoading: isCreating } = api.projects.create.useMutation({
    onSuccess: async (project) => {
      await router.push(`/projects/edit/${project.id}`);
      void ctx.projects.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (isFetching || isCreating) return null;

  return (
    <div className={"flex w-full flex-col items-center justify-center"}>
      {" "}
      <p className={"text-4xl font-bold"}> Projects </p>
      {data?.map((project, index) => (
        <div key={index}> {project.id}</div>
      ))}
      <Selectors
        values={Object.keys(FrontendVariant)}
        selected={selectedFrontendVariant}
        setSelected={setSelectedFrontendVariant}
        label={"Frontend Variant"}
      />
      <Selectors
        values={Object.keys(BackendVariant)}
        selected={selectedBackendVariant}
        setSelected={setSelectedBackendVariant}
        label={"Backend Variant"}
      />
      <button
        type="button"
        className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        onClick={() =>
          mutate({
            frontendVariant: selectedFrontendVariant as FrontendVariant,
            backendVariant: selectedBackendVariant as BackendVariant,
          })
        }
      >
        Create Project
      </button>
    </div>
  );
}
