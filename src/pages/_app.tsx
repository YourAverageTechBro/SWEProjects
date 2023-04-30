import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
      <Analytics />
    </ClerkProvider>
  );
};

export { reportWebVitals } from "next-axiom";
export default api.withTRPC(MyApp);
