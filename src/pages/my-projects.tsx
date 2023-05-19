import Header from "~/components/Common/Header";
import React from "react";
import BackgroundGradient from "~/components/Common/BackgroundGradient";
import { getAuth } from "@clerk/nextjs/server";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { type GetServerSideProps } from "next";
import { type CustomSessionClaims } from "~/utils/types";
import { type Projects } from "@prisma/client";
import { PostHog } from "posthog-node";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { PhotoIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

type Props = {
  projects: Omit<Projects, "createdAt">[];
  isNewProjectsUIEnabled: boolean;
};
export default function MyProjects({
  isNewProjectsUIEnabled,
  projects,
}: Props) {
  const router = useRouter();
  if (!isNewProjectsUIEnabled) {
    void router.push("/projects");
  }

  const { mutate: createNewProject, isLoading: isCreatingNewProject } =
    api.projects.create.useMutation({
      onSuccess: (data) => {
        void router.push(`/projectsv2/${data.id}`);
      },
    });

  return (
    <div>
      <BackgroundGradient />
      <Header />
      <div className={"mx-48"}>
        {projects.length === 0 && (
          <div className={"flex justify-center text-4xl font-bold"}>
            {
              "You haven't created a project tutorial yet. Create your first one below!"
            }
          </div>
        )}
        <button
          type="button"
          className="mt-8 rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => createNewProject()}
        >
          Create Project Tutorial
          {isCreatingNewProject && <LoadingSpinner />}
        </button>
        <div className={"mt-8 flex"}>
          {projects.map((project, index) => (
            <div
              key={index}
              className={
                "w-96 rounded-lg border hover:cursor-pointer hover:border-2 hover:border-indigo-600"
              }
              onClick={() => {
                void router.push(`/projectsv2/${project.id}`);
              }}
            >
              <div
                className={"flex h-48 items-center justify-center bg-gray-200"}
              >
                <PhotoIcon className={"h-24 w-24"} />
              </div>
              <p className={"py-4 text-center text-4xl font-bold"}>
                {project.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = getAuth(context.req);
  const userId = session.userId;
  const isAdmin =
    (session.sessionClaims as CustomSessionClaims)?.publicMetadata?.isAdmin ??
    false;
  let projects: Projects[] = [];
  if (userId) {
    const ssg = generateSSGHelper(userId ?? undefined, isAdmin);
    projects =
      (await ssg.projects.getUsersCreatedProjects.fetch({ userId })) ?? [];
  }

  let isNewProjectsUIEnabled = false;
  if (userId) {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    });

    isNewProjectsUIEnabled =
      (await client.isFeatureEnabled("new-projects-ui", userId)) ?? false;

    await client.shutdownAsync();
  }

  return {
    props: {
      projects: projects
        .reverse()
        .map((project) => ({ ...project, createdAt: null })),
      isNewProjectsUIEnabled,
    },
  };
};
