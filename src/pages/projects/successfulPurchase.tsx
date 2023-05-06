import { useRouter } from "next/router";
import PersonCoding from "~/components/Images/PersonCoding";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export default function SuccessfulPurchase() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { projectId } = router.query as {
    projectId: string;
  };
  const postHog = usePostHog();

  useEffect(() => {
    if (isSignedIn && user && projectId) {
      postHog?.identify(user?.id, {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Successfully Purchased Project", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
      });
    }
  }, [isSignedIn, projectId, user]);

  return (
    <>
      <div
        className={
          "flex flex-col items-center justify-center gap-4 px-8 text-center"
        }
      >
        <style global jsx>{`
          html,
          body,
          body > div:first-child,
          div#__next,
          div#__next > div {
            height: 100%;
          }
        `}</style>
        <p className={"text-4xl font-bold sm:text-6xl"}>
          {" "}
          Congrats on purchasing the project!{" "}
        </p>
        <p className={"text-md font-bold sm:text-2xl"}>
          {`Once we finish processing your payment, 
          you will  receive an email confirmation 
          with a direct link to the project.`}
        </p>
        <PersonCoding />
        <Link
          href="/projects"
          className="rounded-full bg-blue-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          View All Of Your Projects
        </Link>
      </div>
    </>
  );
}
