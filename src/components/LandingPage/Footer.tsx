import Link from "next/link";

import { Container } from "src/components/LandingPage/Container";
import { Logo } from "~/components/LandingPage/Logo";
import { NavLink } from "~/components/LandingPage/NavLink";
import { EnvelopeIcon, MapIcon } from "@heroicons/react/24/solid";

export function Footer() {
  return (
    <footer className="bg-slate-50">
      {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
      {/*@ts-ignore*/}
      <Container>
        <div className="py-16">
          <Logo className="mx-auto h-10 w-auto" />
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#testimonials">Testimonials</NavLink>
              <NavLink href="#faq">FAQ</NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex gap-x-6">
            <Link
              href="https://thomasdohyunkim.notion.site/Privacy-Policy-7de98d782dd244768fc9b9ef6abfb319"
              className="group"
              aria-label={"privacy policy"}
            >
              Privacy Policy
            </Link>
            <Link
              href="https://thomasdohyunkim.notion.site/SWE-Projects-Terms-Of-Service-b4ac629fd20f47a88291111091676c16"
              className="group"
              aria-label={"terms of service"}
            >
              Terms of Service
            </Link>
            <Link
              href="mailto:dohyun@youraveragebro.com"
              className="group"
              aria-label={"email customer support"}
            >
              <EnvelopeIcon className={"h-6 w-6 text-gray-500"} />
            </Link>
            <Link
              href="https://sweprojects.canny.io/feature-requests"
              className="group"
              aria-label={"Add a feature request"}
            >
              <MapIcon className={"h-6 w-6 text-gray-500"} />
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 sm:mt-0">
            Copyright &copy; {new Date().getFullYear()} SWEProjects. All rights
            reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
