"use client";
import { AppBar } from "@/components/app-bar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeAdmin() {
  const router = useRouter();
  const {
    jobApplicationStack: { jobApplications },
    jobsStack: { jobs },
  } = useAlumniStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="flex gap-4">
        <div className="w-max max-h-64 bg-primary/75 flex flex-col gap-10 items-center justify-between rounded-lg shadow-sm border p-6 relative">
          <div className="flex gap-4">
            <div className="max-w-52 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Suas Aplicações
              </p>
              <p className="text-3xl font-semibold text-primary-foreground">
                {jobApplications.length}
              </p>
              <span className="text-sm text-muted-foreground text-center">
                Você aplicou 100% a mais do que na semana passada!
              </span>
            </div>
            <Separator orientation="vertical" />
            <div className="max-w-52 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Vagas dessa semana
              </p>
              <p className="text-3xl font-semibold text-primary-foreground">
                {jobs.length}
              </p>
              <span className="text-sm text-muted-foreground text-center">
                Você aplicou 100% a mais do que na semana passada!
              </span>
            </div>
          </div>
          <Button
            className="underline"
            variant={"ghost"}
            onClick={() => router.push("/dashboard/alumni/jobs/all")}
          >
            <p>Ver vagas</p>
            <ArrowRight className="size-5 -rotate-6" />
          </Button>
        </div>
      </div>
    </main>
  );
}
