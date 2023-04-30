import { useRouter } from "next/router";
import PersonCoding from "~/components/Images/PersonCoding";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import { useEffect } from "react";
import { wait } from "~/utils/utils";
import mixpanel from "mixpanel-browser";
import { useUser } from "@clerk/nextjs";

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_KEY ?? "", {
  debug: process.env.NODE_ENV !== "production",
});

export default function SuccessfulPurchase() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { projectId, userId } = router.query as {
    projectId: string;
    userId: string;
  };

  useEffect(() => {
    if (isSignedIn && user) {
      mixpanel.identify(user.id);
      mixpanel.people.set({
        $name: user.fullName,
        $email: user.primaryEmailAddress?.emailAddress,
      });
      mixpanel.track("Successfully Purchased Project", {
        distinct_id: user.id,
        project_id: projectId,
        time: new Date(),
      });
    }
  }, [isSignedIn, projectId, user]);

  const { mutate } = api.purchases.create.useMutation({
    onSuccess: async (purchase) => {
      if (purchase.projectsId) {
        await wait(4000);
        await router.push(
          `/projects/${purchase.projectsId}?successfullyPurchased=true`
        );
      }
    },
    onError: () => {
      toast.error(
        "Woops, something went wrong on our end. Please refresh the page."
      );
    },
  });

  useEffect(() => {
    if (projectId && userId) {
      mutate({ projectsId: projectId, userId });
    }
  }, [projectId, mutate, userId]);

  return (
    <>
      <div
        className={
          "flex flex-col items-center justify-center gap-4 text-center"
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
          {"You will be redirected to the project tutorial in a few seconds."}
        </p>
        <LoadingSpinner />
        <PersonCoding />
      </div>
    </>
  );
}
