import { Button } from "@/components/ui/button";
import { JobApplication, JobType } from "@/types/jobs";
import {
  ArrowRight,
  FileCheck,
  FileQuestion,
  FileUp,
  FileX,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";

const applicationsStatusLabels = {
  applied: "Aguardando resposta...",
  accepted: "Aceito",
  rejected: "Rejeitado",
};

const applicationsStatusIcons = {
  applied: FileUp,
  accepted: FileCheck,
  rejected: FileX,
};

const applicationStatusIcon = (status: string | undefined) => {
  switch (status) {
    case "applied":
      return <applicationsStatusIcons.applied className="size-6 min-w-6" />;
    case "pending":
      return <applicationsStatusIcons.accepted className="size-6 min-w-6" />;
    case "rejected":
      return <applicationsStatusIcons.rejected className="size-6 min-w-6" />;
    default:
      return <FileQuestion className="size-6 min-w-6" />;
  }
};

const formatDate = (stringDate: string | undefined) => {
  if (stringDate) {
    const date = new Date(stringDate);
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    return formattedDate;
  } else {
    return "Não disponível";
  }
};

const AlumniAllJobApplicationsCard = ({
  jobs,
  jobApplications,
}: {
  jobs: JobType[];
  jobApplications: JobApplication[];
}) => {
  const router = useRouter();
  return (
    <div className="w-full bg-card border shadow-card rounded-xl p-4 lg:p-6 flex flex-col items-center justify-between gap-6">
      <div className="w-full flex gap-4 lg:items-center">
        <Target className="size-10 min-w-8 text-card-foreground" />
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold text-card-foreground">
            Minhas candidaturas
          </h1>
          <p className="text-sm text-muted-foreground lg:text-center">
            Tem alguma atualização em suas candidaturas? Atualize-as!
          </p>
        </div>
      </div>
      <ul className="w-full h-full flex flex-col gap-4 items-center">
        {jobs
          .filter((job) => jobApplications.some((app) => app.job_id === job.id))
          .filter((_, i) => i < 3)
          .map((job, i) => {
            const jobApplication = jobApplications.find(
              (app) => app.job_id === job.id
            );

            return (
              <li
                key={i}
                className="w-full  lg:max-h-16 rounded-2xl border flex flex-col gap-2 lg:flex-row justify-between lg:items-center p-2 px-4"
              >
                <div className="flex gap-4 items-center">
                  {applicationStatusIcon(jobApplication?.status)}

                  <span className="w-full max-w-96 flex flex-col truncate">
                    <p className="font-bold text-card-foreground truncate">
                      {job.title}
                    </p>
                    <p className="text-sm">
                      {jobApplication?.status
                        ? applicationsStatusLabels[jobApplication.status]
                        : "Não informado"}
                    </p>
                  </span>
                </div>
                <span className="ml-10 lg:ml-0">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(jobApplication?.created_at)}
                  </p>
                </span>
              </li>
            );
          })}
      </ul>
      <Button
        variant="secondary"
        className="text-card-foreground mt-2"
        onClick={() => router.push("/dashboard/alumni/jobs/applications")}
      >
        Ver minhas candidaturas
        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};
export default AlumniAllJobApplicationsCard;
