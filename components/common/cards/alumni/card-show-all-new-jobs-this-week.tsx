import JobCard from "@/components/common/jobs/curated/Job-card";
import { Button } from "@/components/ui/button";
import { JobType } from "@/types/jobs";
import { ArrowRight, Target } from "lucide-react";
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

function getNewJobsThisWeek(jobs: JobType[]) {
  const now = new Date();
  const currentWeek = getUTCWeekRange(now);

  return jobs.filter((job) => {
    if (!job.created_at) return false;
    const createdAt = new Date(job.created_at);

    return createdAt >= currentWeek.start && createdAt <= currentWeek.end;
  });
}

const CardShowAllNewJobsThisWeek = ({ jobs }: { jobs: JobType[] }) => {
  const router = useRouter();
  const newJobsCount = getNewJobsThisWeek(jobs);

  return (
    <div className="w-full bg-card border shadow-card rounded-xl p-4 lg:p-6 flex flex-col items-center justify-between gap-6">
      <div className="w-full flex gap-4 lg:items-center">
        <Target className="size-10 min-w-8 text-card-foreground" />
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold text-card-foreground">
            Vagas da semana
          </h1>
          <p className="text-sm text-muted-foreground lg:text-center">
            Toda semana tem vagas novas, fique ligado!
          </p>
        </div>
      </div>
      <ul className="w-full h-full flex flex-row a overflow-x-auto pb-4 gap-4 items-start">
        {newJobsCount
          .filter((_, i) => i < 3)
          .map((job, i) => {
            return <JobCard key={i} job={job} cardFooter={<></>} />;
          })}
      </ul>
      <Button
        variant="secondary"
        className="text-card-foreground mt-2"
        onClick={() => router.push("/dashboard/alumni/jobs/all")}
      >
        Ver toda as vagas
        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};

export default CardShowAllNewJobsThisWeek;
