import { Button } from "@/components/ui/button";
import { JobApplication, JobType } from "@/types/jobs";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { useRouter } from "next/navigation";

const AllAvailableJobsCard = ({
  jobs,
  jobApplications,
}: {
  jobs: JobType[];
  jobApplications: JobApplication[];
}) => {
  const router = useRouter();

  const availableJobs = jobs.filter(
    (job) =>
      !jobApplications.some((application) => application.job_id === job.id)
  );

  return (
    <div className="w-full md:max-w-64 max-h-72 bg-card border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col justify-start gap-4 items-center">
        <BriefcaseBusiness className="size-10 text-card-foreground" />
        <div className="flex flex-col gap-1 items-center justify-center">
          <h1 className="text-lg font-bold text-center text-card-foreground">
            {availableJobs.length} vagas disponíveis!
          </h1>
          {availableJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No momento não temos vagas disponíveis. Mas não se esqueça de
              verificar periodicamente a nossa página para novas oportunidades!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Separe um tempo para avaliar as vagas disponíveis, quem sabe uma
              delas não é a sua!
            </p>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        className="text-card-foreground mt-2"
        onClick={() => router.push("/dashboard/alumni/jobs/all")}
      >
        Ver todas as vagas
        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};

export default AllAvailableJobsCard;
