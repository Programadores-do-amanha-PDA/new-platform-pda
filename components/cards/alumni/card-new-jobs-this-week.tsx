import { Button } from "@/components/ui/button";
import { JobType } from "@/types/jobs";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { useRouter } from "next/navigation";

function getUTCWeekRange(date: Date): { start: Date; end: Date } {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = utcDate.getUTCDay();

  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(utcDate);
  start.setUTCDate(utcDate.getUTCDate() + diff);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

function getNewJobsThisWeek(jobs: JobType[]): number {
  const now = new Date();
  const currentWeek = getUTCWeekRange(now);

  return jobs.filter((job) => {
    if (!job.created_at) return false;
    const createdAt = new Date(job.created_at);

    return createdAt >= currentWeek.start && createdAt <= currentWeek.end;
  }).length;
}

const CardShowNewJobsThisWeek = ({ jobs }: { jobs: JobType[] }) => {
  const router = useRouter();
  const newJobsCount = getNewJobsThisWeek(jobs);

  return (
    <div className="w-full md:max-w-64 h-max bg-card border shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <BriefcaseBusiness className="size-10 text-card-foreground" />
      <div className="flex flex-col gap-1 items-center justify-center">
        <h1 className="text-lg font-bold text-center text-card-foreground">
          {newJobsCount} vagas adicionada esta semana!
        </h1>
        {newJobsCount === 0 ? (
          <p className="text-sm text-muted-foreground text-center">
            Ainda não adicionamos vagas esta semana. Mas não se esqueça de
            verificar periodicamente a nossa página para novas oportunidades!
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Temos curadorias de vagas todas as semanas, fique sempre ligado,
            para não perder nenhuma oportunidade!
          </p>
        )}
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

export default CardShowNewJobsThisWeek;
