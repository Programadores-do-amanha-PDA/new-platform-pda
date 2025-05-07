import { Button } from "@/components/ui/button";
import { JobApplicationT, JobT } from "@/types/jobs";
import { ArrowRight, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const JobsMatchCard = ({
  jobs,
  jobApplications,
}: {
  jobs: JobT[];
  jobApplications: JobApplicationT[];
}) => {
  const router = useRouter();

  const availableJobs = jobs.filter(
    (job) =>
      !jobApplications.some((application) => application.job_id === job.id)
  );

  return (
    <div className="w-full md:max-w-64 max-h-72 bg-amber-100 border-primary border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col gap-4 items-center justify-start">
        <WandSparkles className="size-10 text-primary-foreground" />
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-lg font-bold text-center text-primary-foreground">
            Faça o Match de vagas!
          </h1>
          {availableJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No momento não temos vagas disponíveis para que você possa fazer o
              match.
            </p>
          ) : (
            <p className="text-sm text-primary-foreground/85 text-center">
              Aproveite as vagas disponíveis e realize o match para encontrar as
              oportunidades que melhor se encaixam com o seu currículo!
            </p>
          )}
        </div>
      </div>
      <Button
        className="mt-2 font-semibold text-primary-foreground"
        variant="default"
        onClick={() => router.push("/dashboard/alumni/jobs/match")}
      >
        Realizar Match
        <ArrowRight className="size-4 -rotate-12" />
      </Button>
    </div>
  );
};

export default JobsMatchCard;
