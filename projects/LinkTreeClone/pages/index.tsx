import BackgroundGradient from "../Components/common/BackgroundGradient";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <BackgroundGradient />
      <main className="flex h-screen flex-col items-center gap-8">
        <h1 className="mt-32 text-center text-4xl font-bold text-black">
          Create your link in bio
        </h1>
        <Link
          className="rounded-full bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          href="/auth"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
