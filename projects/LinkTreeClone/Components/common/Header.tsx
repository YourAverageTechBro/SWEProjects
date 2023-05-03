import Link from "next/link";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Header() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    } else {
      await router.push("/");
    }
  };

  const navigateToAccountPage = async () => {
    await router.push("/account");
  };

  return (
    <header
      className={
        "flex justify-between items-center p-4 m-8 border-2 border-black rounded-full"
      }
    >
      <Link href="/setup" aria-label="My projects">
        <p className={"text-4xl font-bold"}> LinkTree Clone </p>
      </Link>
      <div className={"flex items-center gap-8"}>
        <button
          className={`rounded-lg p-4 font-semibold hover:bg-red-200`}
          onClick={navigateToAccountPage}
        >
          {" "}
          My Account
        </button>

        <button
          className={`rounded-lg p-4 font-semibold hover:bg-red-200`}
          onClick={handleSignOut}
        >
          {" "}
          Sign Out
        </button>
      </div>
    </header>
  );
}
