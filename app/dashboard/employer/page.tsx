"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeAdmin() {
  const router = useRouter();
  const { userRole } = useAuth();

  return (
    <main className="relative w-full flex p-6 gap-4 xl:p-8">
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
          onClick={() => router.push(`/dashboard/${userRole}/alumni`)}
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
          onClick={() => router.push(`/dashboard/${userRole}/jobs`)}
        >
          <p>Gerenciar Vagas</p>
          <ArrowRight className="size-5 -rotate-6" />
        </Button>
      </div>
    </main>
  );
}
