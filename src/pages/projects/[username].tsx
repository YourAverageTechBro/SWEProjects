import { type GetServerSideProps } from "next";
import { log } from "next-axiom";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { type CustomSessionClaims } from "~/utils/types";
import Header from "~/components/Common/Header";
import BackgroundGradient from "~/components/Common/BackgroundGradient";
import Link from "next/link";
import React from "react";
import EndOfTheRoad from "~/components/Images/EndOfTheRoad";
import { api } from "~/utils/api";

type Props = {
  authorUserId: string;
};
export default function UserProjectsPage({ authorUserId }: Props) {
  const { data: projects } = api.projects.getUsersCreatedProjects.useQuery({
    userId: authorUserId,
  });

  if (!projects || projects.length === 0) {
    return (
      <div>
        <Header />
        <div className={"flex flex-col items-center justify-center"}>
          <p className={"text-4xl font-bold"}>
            {" "}
            No projects found for this user
          </p>
          <EndOfTheRoad tailwindStyle={"w-1/2"} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackgroundGradient />
      <Header />
      <div className={"flex w-full flex-col items-center justify-center gap-4"}>
        {" "}
        <>
          <p className={"text-4xl font-bold"}> {`Check out my projects`}</p>
          {projects.map((project) => (
            <div
              key={project.id}
              className={"w-full rounded-lg border p-8 shadow-lg  sm:w-1/2"}
            >
              <p className={"mb-8 text-center text-6xl font-bold"}>
                {project.title}
              </p>
              <img
                className="mb-2 mt-8"
                src={project.thumbnailUrl}
                alt={"react-flappy-bird"}
              />
              <Link href={`/projectsv2/${project.id}`}>
                <button
                  type="submit"
                  role="link"
                  className="mt-4 w-full rounded-md bg-indigo-600 py-6 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-2xl"
                >
                  Go to the tutorial
                </button>
              </Link>
            </div>
          ))}
        </>
      </div>
    </div>
  );
}

const emptyResponse = {
  props: {
    authorUserId: "",
  },
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  log.info("[projectsv2]/[projectId] Starting getServerSideProps");
  const session = getAuth(context.req);
  const userId = session.userId;
  const isAdmin =
    (session.sessionClaims as CustomSessionClaims)?.publicMetadata?.isAdmin ??
    false;
  const ssg = generateSSGHelper(userId ?? undefined, isAdmin);
  const username = context.params?.username;
  if (typeof username !== "string") {
    return emptyResponse;
  }

  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  if (users.length === 0) {
    return emptyResponse;
  } else if (users.length > 1) {
    log.error("[projectsv2]/[username] Multiple users with username found", {
      users: JSON.stringify(
        users.map((user) => {
          return { id: user.id, username: user.username };
        })
      ),
    });
    return emptyResponse;
  }

  const authorUserId = users[0]?.id;

  if (!authorUserId) {
    return emptyResponse;
  }

  await ssg.projects.getUsersCreatedProjects.prefetch({
    userId: authorUserId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      authorUserId: authorUserId,
    },
  };
};
