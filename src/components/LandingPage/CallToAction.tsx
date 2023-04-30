import Image from "next/image";

import { Button } from "src/components/LandingPage/Button";
import { Container } from "~/components/LandingPage/Container";
import backgroundImage from "./images/background-call-to-action.jpg";
import { SignUpButton, useUser } from "@clerk/nextjs";

export function CallToAction() {
  const { isSignedIn } = useUser();

  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Get started today
          </h2>
          <p className="mb-10 mt-4 text-lg tracking-tight text-white">
            Ready to start building?
          </p>
          {isSignedIn ? (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <Button href="/projects" color="white">
              <span>
                Get started <span className="hidden lg:inline">today</span>
              </span>
            </Button>
          ) : (
            <SignUpButton>
              {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
              {/*@ts-ignore*/}
              <Button color="white">
                <span>
                  Get started <span className="hidden lg:inline">today</span>
                </span>
              </Button>
            </SignUpButton>
          )}
        </div>
      </Container>
    </section>
  );
}
