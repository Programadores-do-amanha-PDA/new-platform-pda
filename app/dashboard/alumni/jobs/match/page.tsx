"use client";
import JobCard from "@/components/common/jobs/Match/job-card";
import { JobMatchChart } from "@/components/common/jobs/Match/JobMatchChart";
import { Button } from "@/components/ui/button";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { useAuth } from "@/context/auth-context";
import { JobT } from "@/types/jobs";
import { calculateMatchPercentage } from "@/utils/job-x-curriculum-match";
import { Flag } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const {
    jobsStack: { jobs },
    resumeStack: { resumes },
    jobApplicationStack: { jobApplications, handleCreateJobApplication },
  } = useAlumniStack();
  const currentResume = resumes.sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  )[0];

  const jobsMatch = jobs
    .map((job) => {
      const matchStatistics = calculateMatchPercentage(currentResume, job);
      return {
        job,
        matchStatistics,
      };
    })
    .filter((jm) => jm.matchStatistics.total > 35);

  const handleApplyToJob = async (job: JobT) => {
    if (!user) return toast.error("Erro ao aplicar para vaga");

    await handleCreateJobApplication(
      { job_id: job.id, status: "applied" },
      user
    );
  };

  return (
    <main className="relative w-full flex flex-col p-4 gap-8 h-full overflow-y-auto">
      <div className="w-full min-w-0 flex flex-col gap-10 rounded-lg">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold">Estatísticas do Match</p>
            </div>
          </div>
          <div className="max-w-[400px]">
            <JobMatchChart jobsMatch={jobsMatch} />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold">Vagas que deram Match com seu perfil</p>
              <p className="text-muted-foreground">
                Estas são vagas curadas pela equipe da PdA e são as que melhor
                se encaixam com o seu currículo, lembre-se sempre de manter seu
                currículo atualizado!
              </p>
            </div>
          </div>

          <ul className="list-none flex gap-8 justify-start flex-wrap pb-4 pl-0">
            {jobsMatch
              .sort((a, b) => b.matchStatistics.total - a.matchStatistics.total)
              .map((jobM) => {
                const JobApplicationTExists = jobApplications.find(
                  (apply) => apply.job_id === jobM.job.id
                );
                return (
                  <JobCard
                    key={jobM.job.id}
                    job={jobM.job}
                    matchStatistics={jobM.matchStatistics}
                    cardFooter={
                      !JobApplicationTExists ? (
                        <>
                          <Button
                            className="font-semibold"
                            onClick={() => handleApplyToJob(jobM.job)}
                          >
                            Já me candidatei!
                          </Button>
                          <Button className="font-semibold" variant="ghost">
                            <Flag className="size-5" />
                          </Button>
                        </>
                      ) : (
                        <p className="font-semibold text-sm py-2 px-4 gap-2 h-9">
                          Candidatura declarada!
                        </p>
                      )
                    }
                  />
                );
              })}
          </ul>
        </div>
      </div>
    </main>
  );
}
