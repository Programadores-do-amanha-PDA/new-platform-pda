"use client";
import { UsersStackProvider } from "@/context/users-stack-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UsersStackProvider>{children}</UsersStackProvider>;
}
