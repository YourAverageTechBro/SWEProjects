import Celebration from "~/components/Images/Celebration";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Header from "~/components/Common/Header";

export default function CompletedPage() {
  const router = useRouter();
  const { projectId } = router.query as {
    projectId: string;
  };
  const { isSignedIn, user } = useUser();
  const postHog = usePostHog();

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      isSignedIn &&
      user &&
      projectId
    ) {
      postHog?.identify(user?.id, {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Successfully Completed Project", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
      });
    }
  }, [isSignedIn, projectId, user, postHog]);
  return (
    <div>
      <Header />
      <div className={"flex h-screen flex-col items-center justify-center"}>
        <Celebration />{" "}
        <p className={"text-4xl font-bold"}>
          {" "}
          Congrats on finishing the project tutorial!{" "}
        </p>
        <Link href={"/projects/all"}>
          <button
            type={"button"}
            className="mt-4 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {" "}
            Click here to go back to view all the projects{" "}
          </button>
        </Link>
      </div>{" "}
    </div>
  );
}
