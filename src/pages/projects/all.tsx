import { type GetStaticProps } from "next";
import { log } from "next-axiom";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import Header from "~/components/Common/Header";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import mixpanel from "mixpanel-browser";
import { useRouter } from "next/router";
import Link from "next/link";

const preRequisiteColors = ["bg-green-300", "bg-yellow-300", "bg-red-300"];

export default function AllProjects() {
  const router = useRouter();
  const { data } = api.projects.getAllPreviews.useQuery();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      mixpanel.identify(user.id);
      mixpanel.people.set({
        $name: user.fullName,
        $email: user.primaryEmailAddress?.emailAddress,
      });
      mixpanel.track("Visit all projects", {
        distinct_id: user.id,
        time: new Date(),
      });
    }
  }, [user, isSignedIn]);

  const onMouseOverLearnMoreButton = (projectId: string) => {
    if (isSignedIn && user) {
      mixpanel.track("Hovered Over Sign Up Button", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
      });
    }
  };

  const onMouseOverViewDemoButton = (projectId: string) => {
    if (isSignedIn && user) {
      mixpanel.track("Hovered Over View Demo Button", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
      });
    }
  };

  const redirectToProjectsPreview = async (projectId: string) => {
    await router.push(`/projects/preview/${projectId}`);
  };

  return (
    <>
      <Header />
      <div className={"mt-8 flex w-full flex-col items-center justify-center"}>
        <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
          <svg
            className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9089FC" />
                <stop offset={1} stopColor="#FF80B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className={"mb-8 text-center text-4xl font-bold"}>
          Our Coding Tutorials
        </p>
        <p className={"mb-8 text-center text-lg font-semibold sm:w-1/2"}>
          We are constantly adding new projects and new tech stacks, so make
          sure to sign up for an account to get notified of all the new projects
          we create and release!
        </p>
        <div className={"flex flex-wrap gap-4 sm:flex-nowrap"}>
          {data?.map((project, index) => (
            <div
              className={"w-full rounded-lg border p-8 shadow-lg  sm:w-1/2"}
              key={index}
            >
              <p className={"mb-8 text-center text-4xl font-bold"}>
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
                    mixpanel.track("Clicked Learn More Button", {
                      distinct_id: user.id,
                      project_id: project.id,
                      time: new Date(),
                    });
                  }
                  void (async () => {
                    await redirectToProjectsPreview(project.id);
                  })();
                }}
                onMouseOver={() => onMouseOverLearnMoreButton(project.id)}
              >
                Learn more
              </button>
              <button className="mt-4 w-full rounded-md bg-indigo-50  py-6 text-2xl font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
                <Link
                  onClick={() => {
                    if (user) {
                      mixpanel.track("Clicked View Demo Button", {
                        distinct_id: user.id,
                        project_id: project.id,
                        time: new Date(),
                      });
                    }
                  }}
                  href={project.videoDemoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  onMouseOver={() => onMouseOverViewDemoButton(project.id)}
                >
                  View demo
                </Link>
              </button>
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
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  log.info("[projects/preview/[projectId] Starting getStaticProps");
  const ssg = generateSSGHelper();
  const projects = await ssg.projects.getAll.fetch();
  if (!projects) {
    log.error("[projects/preview/[projectId] No project");
    throw new Error("no projects");
  }

  await Promise.all(
    projects.map(async (project) => {
      await ssg.stripe.getPrices.prefetch({ priceId: project.stripePriceId });
    })
  );

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
