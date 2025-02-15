"use client";
import { AppBar } from "@/components/app-bar";
import JobCard from "@/components/jobs/Match/job-card";
import { JobMatchChart } from "@/components/jobs/Match/JobMatchChart";
import { Button } from "@/components/ui/button";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { JobType } from "@/types/jobs";
import { calculateMatchPercentage } from "@/utils/job-x-curriculum-match";
import { Flag } from "lucide-react";

export default function Home() {
  const {
    jobsStack: { jobs },
    curriculumStack: { curriculum },
    jobApplicationStack: { jobApplications, handleCreateJobApplication },
  } = useAlumniStack();
  // const [loading, setLoading] = useState(true);

  const jobsMatch = jobs.map((job) => {
    const matchPercentage = calculateMatchPercentage(curriculum, job);
    return {
      job,
      matchPercentage,
    };
  });

  const handleApplyToJob = async (job: JobType) => {
    await handleCreateJobApplication({ job_id: job.id, status: "applied" });
  };

  // if (loading) {
  //   return (
  //     <div className="relative p-6 lg:gap-10 lg:p-8 w-full h-full">
  //       <div className="w-full h-full flex items-center justify-center space-y-2 bg-primary/75 rounded-lg">
  //         <h1
  //           className={cn(
  //             "scroll-m-20 text-3xl font-bold tracking-tight animate-pulse text-primary-foreground"
  //           )}
  //         >
  //           {loadingText}
  //         </h1>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <main className="relative w-full flex flex-col p-6 gap-4 xl:p-8">
      <AppBar />

      <div className="w-full min-w-0 h-max flex flex-col gap-10 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="space-y-2 flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              Estas são vagas curadas pela equipe da PdA e são as que melhor se
              encaixam com o seu currículo, para entender melhor visualize o
              gráfico interativo e lembre-se sempre de manter seu currículo
              atualizado!
            </p>
          </div>

          {/* <Button variant={"ghost"}>
            <p>Atualizar currículo</p>
            <ArrowRight />
          </Button> */}
        </div>

        <ul className="list-none flex gap-8 justify-start flex-wrap pb-4 pl-0">
          {jobsMatch
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .map((jobM) => {
              const jobApplicationExists = jobApplications.find(
                (apply) => apply.job_id === jobM.job.id
              );
              return (
                <JobCard
                  key={jobM.job.id}
                  job={jobM.job}
                  matchPercentage={jobM.matchPercentage}
                  cardFooter={
                    !jobApplicationExists ? (
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
      <JobMatchChart />
    </main>
  );
}
