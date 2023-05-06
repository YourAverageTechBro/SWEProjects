import { type NextPage } from "next";
import Head from "next/head";
import { CallToAction } from "~/components/LandingPage/CallToAction";
import { Faqs } from "~/components/LandingPage/Faqs";
import { Footer } from "~/components/LandingPage/Footer";
import { Header } from "~/components/LandingPage/Header";
import { Hero } from "~/components/LandingPage/Hero";
import { PrimaryFeatures } from "~/components/LandingPage/PrimaryFeatures";
import { Testimonials } from "~/components/LandingPage/Testimonials";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

const Home: NextPage = () => {
  const { isSignedIn, user } = useUser();
  const postHog = usePostHog();

  useEffect(() => {
    if (isSignedIn && user) {
      postHog?.identify(user.id, {
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
      });
      postHog?.capture("Visit Landing Page", {
        distinct_id: user.id,
        time: new Date(),
      });
    }
  }, [isSignedIn, user]);

  return (
    <>
      <Head>
        <title>
          SWEProjects — Coding projects that teach you to become a better
          developer
        </title>
        <meta
          name="description"
          content={`SWE Projects is the home to high quality coding
          tutorials and projects that you'll actually be excited to show to 
          recruiters, friends, and family. Take your coding skills to the next
          level by building projects, deploying to the internet, and
          sharing with the world.`}
        />
      </Head>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <Testimonials />
        <CallToAction />
        <Faqs />
      </main>
      <Footer />
    </>
  );
};

export default Home;
