"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import useAuth from "@/hooks/use-auth";

export default function RootPage() {
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  }, []);
  return;
}
