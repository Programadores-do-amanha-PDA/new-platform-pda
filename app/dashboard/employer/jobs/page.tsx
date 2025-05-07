"use client";
import { useRouter } from "next/navigation";

import { useEmployerStack } from "@/context/employer/stack-context";

import { Button } from "@/components/ui/button";
import { RadialShapeChart } from "@/components/common/jobs/RadialShapeChart";
import { useEffect } from "react";
import LoadingComponent from "@/components/common/loading-component";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const router = useRouter();
  const {
    jobsStack: { jobs, jobsLoading, handleGetAllJobs },
  } = useEmployerStack();
  const { userRole } = useAuth();

  useEffect(() => {
    if (!jobs.length) {
      handleGetAllJobs();
    }
  }, []);

  if (jobsLoading) {
    return <LoadingComponent />;
  }

  const curatedChartData = [
    {
      label: "curated",
      value: jobs.filter((job) => job.curated === true).length,
      fill: "var(--color-curated)",
    },
  ];

  const notCuratedChartData = [
    {
      label: "notCurated",
      value: jobs.filter((job) => job.curated === false).length,
      fill: "var(--color-notCurated)",
    },
  ];

  const chartConfig = {
    label: {
      label: "Vagas",
    },
    curated: {
      label: "Vagas curadas",
      color: "hsl(var(--chart-1))",
    },
    notCurated: {
      label: "Vagas não curadas",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <main className="relative w-full flex flex-col p-4 gap-8">
      <div className="flex items-center justify-start gap-4">
        <div className="w-max h-max bg-card flex gap-20 items-center justify-between rounded-lg shadow border p-6 relative">
          <div className="h-full flex flex-col gap-6 justify-between items-center">
            <div className="w-52 overflow-hidden flex items-center justify-center">
              <RadialShapeChart
                chartData={curatedChartData}
                chartConfig={chartConfig}
                chartLabel="Vagas curadas"
              />
            </div>
            <Button
              className="font-semibold"
              onClick={() => router.push(`/dashboard/${userRole}/jobs/curated`)}
            >
              Gerenciar vagas curadas
            </Button>
          </div>
        </div>

        <div className="w-max h-max bg-card flex gap-20 items-center justify-between rounded-lg shadow border p-6 relative">
          <div className="h-full flex flex-col gap-6 justify-between items-center">
            <div className="w-52 overflow-hidden flex items-center justify-center">
              <RadialShapeChart
                chartData={notCuratedChartData}
                chartConfig={chartConfig}
                chartLabel="Vagas não curadas"
              />
            </div>
            <Button
              className="font-semibold"
              onClick={() =>
                router.push(`/dashboard/${userRole}/jobs/curation`)
              }
            >
              Gerenciar vagas não curadas
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
