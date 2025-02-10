"use client";
import { AppBar } from "@/components/app-bar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeAdmin() {
  const router = useRouter();
  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="flex gap-4">
        <div className="w-max h-max bg-card flex flex-col gap-10 items-center justify-between rounded-lg shadow border p-6 relative">
          <Image
            src={"/assets/images/UsersCardIllustration.svg"}
            width={300}
            height={300}
            alt=""
            className="size-64"
          />
          <Button
            className="underline"
            variant={"ghost"}
            onClick={() => router.push("/dashboard/employer/alumni")}
          >
            <p>Gerenciar Alumni</p>
            <ArrowRight className="size-5 -rotate-6" />
          </Button>
        </div>

        <div className="w-max h-max bg-card flex flex-col gap-10 items-center justify-between rounded-lg shadow border p-6 relative">
          <Image
            src={"/assets/images/JobsCardIllustration.svg"}
            width={300}
            height={300}
            alt=""
            className="size-64"
          />
          <Button
            className="underline"
            variant={"ghost"}
            onClick={() => router.push("/dashboard/employer/jobs")}
          >
            <p>Gerenciar Vagas</p>
            <ArrowRight className="size-5 -rotate-6" />
          </Button>
        </div>
      </div>
    </main>
  );
}
