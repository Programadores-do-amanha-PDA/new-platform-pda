"use client";
import { JobsStackProvider } from "@/context/jobs-stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <JobsStackProvider>{children}</JobsStackProvider>;
}
