import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SignUpButton, useUser } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { type GetServerSideProps } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import {
  ProjectAccessType,
  type Projects,
  type Purchases,
} from "@prisma/client";
import { api } from "~/utils/api";
import { log } from "next-axiom";
import { usePostHog } from "posthog-js/react";
import { PostHog } from "posthog-node";
import { getAuth } from "@clerk/nextjs/server";
import Link from "next/link";

const preRequisiteColors = ["bg-green-300", "bg-yellow-300", "bg-red-300"];

type ProjectsWithCreatedAtString = Omit<Projects, "createdAt"> & {
  createdAt: string;
};

type Props = {
  project: (ProjectsWithCreatedAtString & { purchases: Purchases[] }) | null;
  stripePrice: number | undefined;
  isNewProjectsUiEnabled: boolean;
};
export default function PreviewPage({
  project,
  stripePrice,
  isNewProjectsUiEnabled,
}: Props) {
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("");
  const { isSignedIn, user } = useUser();
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const { canceledPayment } = router.query as { canceledPayment: string };
  const projectId = project?.id;
  const postHog = usePostHog();

  const { data: purchasedProjects } =
    api.projects.getUsersPurchasedProjects.useQuery({
      userId: user?.id,
    });

  useEffect(() => {
    setRedirectUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (isSignedIn && user && canceledPayment === "true") {
      postHog?.identify(user?.id, {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Canceled Payment", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
        price: stripePrice,
      });
    }
  }, [projectId, isSignedIn, user, stripePrice, canceledPayment]);

  useEffect(() => {
    if (isSignedIn && user) {
      postHog?.identify(user?.id, {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Visit Project Preview", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
        price: stripePrice,
      });
    }
  }, [projectId, isSignedIn, user, stripePrice]);
  if (!project) return null;

  const userHasPurchasedProject = purchasedProjects?.some(
    (purchasedProject) => purchasedProject.id === project?.id
  );

  const oldPreviewUi = (
    <>
      {user?.id && !userHasPurchasedProject && (
        <form
          action={`/api/checkout_sessions?userId=${
            user.id ?? ""
          }&stripePriceId=${project.stripePriceId ?? ""}&projectId=${
            project.id
          }`}
          method="POST"
          className={"w-full"}
        >
          <button
            type="submit"
            role="link"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 py-6 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-2xl"
            onClick={() => {
              setIsRedirectingToStripe(true);
              postHog?.capture("Clicked Buy Now", {
                distinct_id: user.id,
                project_id: projectId,
                price: stripePrice,
              });
            }}
          >
            {isRedirectingToStripe && (
              <LoadingSpinner spinnerColor="fill-indigo-500 text-white" />
            )}
            Get The Coding Tutorial Now!
          </button>
        </form>
      )}
      {!user?.id && (
        <SignUpButton mode={"modal"} redirectUrl={redirectUrl}>
          <button
            type="submit"
            role="link"
            className="mt-4 w-full rounded-full bg-indigo-600 py-6 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign Up To Get The Coding Tutorial
          </button>
        </SignUpButton>
      )}
    </>
  );

  const newPreviewUi = (
    <div className={"mb-8 flex w-full flex-col justify-center gap-4"}>
      <Link href={`/projectsv2/${project.id}`}>
        <button className="mt-4 w-full rounded-full bg-indigo-600 px-8 py-6 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {" "}
          {project.projectAccessType === ProjectAccessType.Free
            ? "View the FREE coding tutorial"
            : "Preview the tutorial"}
        </button>
      </Link>

      {user?.id &&
        !userHasPurchasedProject &&
        project.projectAccessType !== ProjectAccessType.Free && (
          <form
            action={`/api/checkout_sessions?userId=${
              user.id ?? ""
            }&stripePriceId=${project.stripePriceId ?? ""}&projectId=${
              project.id
            }`}
            method="POST"
          >
            <button
              type="submit"
              role="link"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-green-600 px-8 py-6 text-xl font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:text-2xl"
              onClick={() => {
                setIsRedirectingToStripe(true);
                postHog?.capture("Clicked Buy Now", {
                  distinct_id: user.id,
                  project_id: projectId,
                  price: stripePrice,
                });
              }}
            >
              {isRedirectingToStripe && (
                <LoadingSpinner spinnerColor="fill-indigo-500 text-white" />
              )}
              Purchase The Tutorial
            </button>
          </form>
        )}
      {!user?.id && project.projectAccessType !== ProjectAccessType.Free && (
        <SignUpButton mode={"modal"} redirectUrl={redirectUrl}>
          <button
            type="submit"
            role="link"
            className="mt-4 rounded-full bg-green-600 px-8 py-6 text-2xl font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Sign Up To Get The Coding Tutorial
          </button>
        </SignUpButton>
      )}
    </div>
  );

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
        <div className={"w-full rounded-lg border p-8 shadow-lg  sm:w-1/2"}>
          {project && (
            <>
              <p className={"mb-8 text-center text-6xl font-bold"}>
                {project.title}
              </p>
              {!isNewProjectsUiEnabled &&
                !userHasPurchasedProject &&
                stripePrice && (
                  <p
                    className={
                      "mb-8 text-center text-6xl font-bold text-green-500"
                    }
                  >
                    {`$${stripePrice}`}
                  </p>
                )}
              {!stripePrice && <LoadingSpinner />}
              {isNewProjectsUiEnabled && !userHasPurchasedProject
                ? newPreviewUi
                : oldPreviewUi}
              {user?.id && userHasPurchasedProject && (
                <button
                  role="link"
                  className="mt-4 w-full rounded-md bg-green-600 py-6 text-xl font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:text-2xl"
                  onClick={() => {
                    void (async () => {
                      await router.push(`/projects/${project.id}`);
                    })();
                  }}
                >
                  Already Purchased — Go to the tutorial now!
                </button>
              )}
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
              <img
                className="mb-2 mt-8"
                src={project.thumbnailUrl}
                alt={"react-flappy-bird"}
              />
              <p className={"text-2xl"}>{project.description}</p>
              <p className={"mt-8 text-2xl"}>
                {
                  "By purchasing the coding tutorial you get LIFETIME ACCESS to it. We're constantly improving our tutorials, adding new tech stack variations, answering questions that other learners have, and you will get lifetime access to all those improvements."
                }
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  log.info("[projects/preview/[projectId] Starting getStaticProps");
  const ssg = generateSSGHelper();

  const projectId = context.params?.projectId;

  if (typeof projectId !== "string") {
    log.error("[projects/preview/[projectId] No projectId");
    throw new Error("no projectId");
  }

  const project = await ssg.projects.getPreviewById.fetch({ projectId });
  if (!project) {
    log.error("[projects/preview/[projectId] No project");
    throw new Error("no project");
  }
  const priceId = project.stripePriceId;
  let stripePrice;
  if (priceId) {
    stripePrice = await ssg.stripe.getPrices.fetch({ priceId });
  }

  const { userId } = getAuth(context.req);

  let isNewProjectsUiEnabled = true;
  if (userId) {
    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    });

    isNewProjectsUiEnabled =
      (await client.isFeatureEnabled("new-projects-ui", userId)) ?? true;

    await client.shutdownAsync();
  }

  return {
    props: {
      project: {
        ...project,
        createdAt: JSON.stringify(project.createdAt),
      },
      stripePrice,
      isNewProjectsUiEnabled,
    },
  };
};
