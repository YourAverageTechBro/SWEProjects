import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
  isSignedIn,
} from "@clerk/nextjs";
import { Fragment } from "react";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";

import { Button } from "src/components/LandingPage/Button";
import { Container } from "src/components/LandingPage/Container";
import { Logo } from "~/components/LandingPage/Logo";
import { NavLink } from "~/components/LandingPage/NavLink";
import { StarIcon } from "@heroicons/react/24/outline";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function MobileNavLink({ href, children }) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <Popover.Button as={Link} href={href} className="inline-flex w-full p-2">
      {children}
    </Popover.Button>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function MobileNavIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          "origin-center transition",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          open && "scale-90 opacity-0"
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          "origin-center transition",
          !open && "scale-90 opacity-0"
        )}
      />
    </svg>
  );
}

function MobileNavigation() {
  const { isSignedIn } = useUser();

  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-slate-300/50" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5"
          >
            <MobileNavLink href="#features">Features</MobileNavLink>
            <MobileNavLink href="#testimonials">Testimonials</MobileNavLink>
            <MobileNavLink href="#faq">FAQ</MobileNavLink>
            <MobileNavLink
              href={"https://github.com/YourAverageTechBro/SWEProjects"}
            >
              {" "}
              Star us on Github <StarIcon className={"h-6 w-6"} />
            </MobileNavLink>
            <hr className="m-2 border-slate-300/40" />
            {/*<MobileNavLink>*/}
            {/* Signed-out users get sign in button */}
            {isSignedIn ? (
              <SignOutButton>
                <Button color="blue">
                  <span>Sign Out</span>
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton>
                {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                {/*@ts-ignore*/}
                <Button color="blue">
                  <span>Sign in</span>
                </Button>
              </SignInButton>
            )}
            {/*</MobileNavLink>*/}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  );
}

export function Header() {
  const { isSignedIn } = useUser();
  return (
    <header className="py-10">
      {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
      {/*@ts-ignore*/}
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="/" aria-label="Home">
              <Logo className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex md:gap-x-6">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#testimonials">Testimonials</NavLink>
              <NavLink href="#faq">FAQ</NavLink>
              <NavLink
                href={"https://github.com/YourAverageTechBro/SWEProjects"}
              >
                {" "}
                Star us on Github <StarIcon className={"h-6 w-6"} />
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            {!isSignedIn && (
              <div className="hidden md:block">
                <SignInButton />
              </div>
            )}
            {isSignedIn ? (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              <Button
                href="/projects/preview/clgk8x5w1000cvrvb86b13ut7"
                color="blue"
              >
                <span>
                  View all <span className="hidden lg:inline">projects</span>
                </span>
              </Button>
            ) : (
              <SignUpButton>
                {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                {/*@ts-ignore*/}
                <Button color="blue">
                  <span>
                    Get started <span className="hidden lg:inline">today</span>
                  </span>
                </Button>
              </SignUpButton>
            )}
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
