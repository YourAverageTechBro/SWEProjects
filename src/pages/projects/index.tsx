import { api } from "~/utils/api";
import { useAuth } from "@clerk/nextjs";
import Header from "~/components/Common/Header";
import React from "react";
import EmptyCart from "~/components/Images/EmptyCart";
import Link from "next/link";
import LoadingSpinner from "~/components/Common/LoadingSpinner";

export default function Projects() {
  const { userId } = useAuth();
  const { data, isFetching } = api.projects.getUsersPurchasedProjects.useQuery({
    userId,
  });
  if (isFetching) return <LoadingSpinner />;
  return (
    <>
      <Header />
      <div className={"mt-8 flex w-full flex-col items-center justify-center"}>
        <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
          <svg
            className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                x1="1155.49"
                x2="-78.208"
                y1=".177"
                y2="474.645"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#9089FC" />
                <stop offset={1} stopColor="#FF80B5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className={"flex w-full flex-col items-center justify-center gap-4"}>
        {" "}
        {data?.length === 0 ? (
          <>
            <p className={"text-4xl font-bold"}> No projects found </p>
            <p className={"text-2xl font-bold"}>
              {" "}
              View all the available projcts{" "}
              <Link
                href={"/projects/preview/clgk8x5w1000cvrvb86b13ut7"}
                className={"text-indigo-500 underline"}
              >
                {" "}
                here{" "}
              </Link>
            </p>
            <EmptyCart tailwindStyle={"h-64 w-64"} />
          </>
        ) : (
          <>
            <p className={"text-4xl font-bold"}> Your Purchased Projects </p>
            {data?.map((project) => (
              <div
                key={project.id}
                className={"w-full rounded-lg border p-8 shadow-lg  sm:w-1/2"}
              >
                <p className={"mb-8 text-center text-6xl font-bold"}>
                  {project.title}
                </p>
                <img
                  className="mb-2 mt-8"
                  src={project.thumbnailUrl}
                  alt={"react-flappy-bird"}
                />
                <Link href={`/projects/${project.id}`}>
                  <button
                    type="submit"
                    role="link"
                    className="mt-4 w-full rounded-md bg-indigo-600 py-6 text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-2xl"
                  >
                    Go to the tutorial
                  </button>
                </Link>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
