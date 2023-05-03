import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      const userEmail = session?.user.email;
      const userId = session?.user.id;
      if (event === "SIGNED_IN" && userId && userEmail) {
        await router.push(`/setup`);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabaseClient.auth]);

  return (
    <div className="flex h-screen flex-col justify-center">
      <h1 className="flex w-full h-full justify-center">
        <div className="flex-col min-h-full items-center justify-center py-12 w-96">
          <p> Welcome to LinkTree Clone. </p>
          <Auth
            supabaseClient={supabaseClient}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      </h1>
    </div>
  );
}
