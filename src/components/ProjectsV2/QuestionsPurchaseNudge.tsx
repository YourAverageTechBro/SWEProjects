import EndOfTheRoad from "~/components/Images/EndOfTheRoad";
import LoadingSpinner from "~/components/Common/LoadingSpinner";
import React, { useEffect, useState } from "react";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { usePostHog } from "posthog-js/react";
import { api } from "~/utils/api";

type Props = {
  projectId: string;
  stripePriceId: string;
};
export default function QuestionsPurchaseNudge({
  projectId,
  stripePriceId,
}: Props) {
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const postHog = usePostHog();
  const { user } = useUser();
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    setRedirectUrl(window.location.href);
  }, []);

  const { data: price } = api.stripe.getPrices.useQuery(
    {
      priceId: stripePriceId,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div
      className={"flex flex-col items-center justify-center p-8 text-center"}
    >
      <EndOfTheRoad tailwindStyle={"h-48 w-48"} />
      <p className={"text-2xl font-bold"}>
        {" "}
        {"To access the Q&A section, you must purchase the full tutorial."}{" "}
      </p>

      {user ? (
        <form
          action={`/api/checkout_sessions?userId=${
            user.id ?? ""
          }&stripePriceId=${stripePriceId ?? ""}&projectId=${projectId}`}
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
                price,
              });
            }}
          >
            {isRedirectingToStripe && (
              <LoadingSpinner spinnerColor="fill-indigo-500 text-white" />
            )}
            Unlock the Q & A section now
          </button>
        </form>
      ) : (
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
    </div>
  );
}
