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
import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_KEY ?? "", {
  debug: process.env.NODE_ENV !== "production",
});

export default function Header() {
  const { user } = useUser();

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
            mixpanel.identify(user?.id);
            mixpanel.people.set({
              $name: user?.fullName,
              $email: user?.primaryEmailAddress?.emailAddress,
            });
            mixpanel.track("Click on Logo", {
              distinct_id: user?.id,
              time: new Date(),
            });
          }}
        />
      </Link>
      <div className={"flex items-center gap-8"}>
        <SignedIn>
          {/* Mount the UserButton component */}
          <Link
            href="/projects"
            aria-label="My projects"
            className={`rounded-lg p-4 font-semibold hover:bg-indigo-200`}
            onClick={() => {
              mixpanel.identify(user?.id);
              mixpanel.people.set({
                $name: user?.fullName,
                $email: user?.primaryEmailAddress?.emailAddress,
              });
              mixpanel.track("Click on my projects", {
                distinct_id: user?.id,
                time: new Date(),
              });
            }}
          >
            {" "}
            My projects{" "}
          </Link>
          <Link
            href="/projects/preview/clgk8x5w1000cvrvb86b13ut7"
            aria-label="View all projects"
            className={`rounded-lg p-4 font-semibold hover:bg-indigo-200`}
            onClick={() => {
              mixpanel.identify(user?.id);
              mixpanel.people.set({
                $name: user?.fullName,
                $email: user?.primaryEmailAddress?.emailAddress,
              });
              mixpanel.track("Click on view all projects", {
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
