import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "src/components/LandingPage/Button";
import Link from "next/link";
import { Logo } from "~/components/LandingPage/Logo";
import { usePostHog } from "posthog-js/react";

export default function Header() {
  const { user } = useUser();
  const postHog = usePostHog();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 20,
        alignItems: "center",
      }}
    >
      <Link href="/" aria-label="My projects">
        <Logo
          className="h-10 w-auto"
          onClick={() => {
            postHog?.identify(user?.id, {
              name: user?.fullName,
              email: user?.primaryEmailAddress?.emailAddress,
            });
            postHog?.capture("Click on Logo", {
              distinct_id: user?.id,
              time: new Date(),
            });
          }}
        />
      </Link>
      <div className={"flex items-center gap-8"}>
        <SignedIn>
          {
            <Link
              href="/my-projects"
              aria-label="
            My Project Tutorials"
              className={`rounded-lg p-4 font-semibold hover:bg-indigo-200`}
            >
              {" "}
              My Project Tutorials
            </Link>
          }
          <Link
            href="/projects"
            aria-label="My projects"
            className={`rounded-lg p-4 font-semibold hover:bg-indigo-200`}
            onClick={() => {
              postHog?.identify(user?.id, {
                name: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress,
              });
              postHog?.capture("Click on my projects", {
                distinct_id: user?.id,
                time: new Date(),
              });
            }}
          >
            {" "}
            Purchased projects{" "}
          </Link>
          <Link
            href="/projects/all"
            aria-label="View all projects"
            className={`rounded-lg p-4 font-semibold hover:bg-indigo-200`}
            onClick={() => {
              postHog?.identify(user?.id, {
                name: user?.fullName,
                email: user?.primaryEmailAddress?.emailAddress,
              });
              postHog?.capture("Click on view all projects", {
                distinct_id: user?.id,
                time: new Date(),
              });
            }}
          >
            View all projects
          </Link>
          <UserButton />
        </SignedIn>
        <SignedOut>
          {/* Signed-out users get sign in button */}
          <SignInButton>
            {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
            {/*@ts-ignore*/}
            <Button color="blue">
              <span>Sign in</span>
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
