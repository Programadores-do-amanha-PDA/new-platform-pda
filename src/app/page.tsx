"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/use-auth";

export default function RootPage() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, []);
  return;
}
