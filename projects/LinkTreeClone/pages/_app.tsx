import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import {
  createBrowserSupabaseClient,
  Session,
} from "@supabase/auth-helpers-nextjs";
import { Database } from "../types/supabase";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
