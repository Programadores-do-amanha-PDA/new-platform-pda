import type { AppProps } from "next/app";
import AuthStoreProvider from "@/providers/auth-store-provider";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthStoreProvider>
        <Component {...pageProps} />
      </AuthStoreProvider>
      <Toaster />
    </>
  );
}
