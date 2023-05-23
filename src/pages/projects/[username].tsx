import { type GetServerSideProps } from "next";
import { log } from "next-axiom";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { type CustomSessionClaims } from "~/utils/types";
import Header from "~/components/Common/Header";
import BackgroundGradient from "~/components/Common/BackgroundGradient";
import Link from "next/link";
import React, { useEffect } from "react";
import EndOfTheRoad from "~/components/Images/EndOfTheRoad";
import { api } from "~/utils/api";
import { usePostHog } from "posthog-js/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

const preRequisiteColors = ["bg-green-300", "bg-yellow-300", "bg-red-300"];

type Props = {
  authorUserId: string;
  authorUsername: string;
  authorProfilePictureUrl?: string;
};
export default function UserProjectsPage({
  authorUserId,
  authorUsername,
  authorProfilePictureUrl,
}: Props) {
  const router = useRouter();
  const postHog = usePostHog();
  const { isSignedIn, user } = useUser();
  const { data: projects } = api.projects.getUsersCreatedProjects.useQuery({
    userId: authorUserId,
  });
  useEffect(() => {
    if (isSignedIn && user) {
      postHog?.identify(user?.id, {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Visit author page", {
        distinct_id: user.id,
        time: new Date(),
        authorUserId,
      });
    }
  }, [user, isSignedIn]);

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

  const redirectToProjectsPreview = async (projectId: string) => {
    await router.push(`/projects/preview/${projectId}`);
  };

  return (
    <div>
      <BackgroundGradient />
      <Header />
      <div className={"flex w-full flex-col items-center justify-center gap-4"}>
        {" "}
        <>
          <p className={"text-center text-4xl font-bold"}>
            {" "}
            {`Check out ${authorUsername}'s projects`}
          </p>
          <img
            className="mb-2 mt-8 h-36 w-36 rounded-full"
            src={authorProfilePictureUrl}
            alt={`${authorUsername} image`}
          />
          {projects.reverse().map((project) => (
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
              <button
                className="mt-4 w-full rounded-md bg-indigo-600 py-6 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  if (user) {
                    postHog?.capture("Clicked Learn More Button", {
                      distinct_id: user.id,
                      project_id: project.id,
                      time: new Date(),
                    });
                  }
                  void (async () => {
                    await redirectToProjectsPreview(project.id);
                  })();
                }}
              >
                Learn more
              </button>
              <Link
                className="mt-4 block w-full rounded-md bg-indigo-50 py-6  text-center text-2xl font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
                onClick={() => {
                  if (user) {
                    postHog?.capture("Clicked View Demo Button", {
                      distinct_id: user.id,
                      project_id: project.id,
                      time: new Date(),
                    });
                  }
                }}
                href={project.videoDemoUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                View demo
              </Link>
              <div className={"mt-4"}>
                <p className={"mb-4 text-2xl font-bold"}> Prerequisites: </p>
                <div className={"flex flex-wrap items-center gap-4"}>
                  {project.preRequisites
                    ?.split(",")
                    .map((preRequisite, index) => (
                      <p
                        className={`rounded-lg p-4 text-sm font-bold  ${
                          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                          preRequisiteColors[index] ?? preRequisiteColors[0]
                        }`}
                        key={index}
                      >
                        {preRequisite}
                      </p>
                    ))}
                </div>
              </div>
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
    authorUsername: "",
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

  const authorProfilePictureUrl = users[0]?.profileImageUrl;

  await ssg.projects.getUsersCreatedProjects.prefetch({
    userId: authorUserId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      authorUserId: authorUserId,
      authorUsername: username,
      authorProfilePictureUrl,
    },
  };
};
