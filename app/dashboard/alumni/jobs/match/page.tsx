"use client";
import { AppBar } from "@/components/app-bar";
import JobCard from "@/components/jobs/Match/JobCard";
import { JobMatchChart } from "@/components/jobs/Match/JobMatchChart";
import { useAlumniStack } from "@/context/alumni/stack-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    jobsStack: { jobs },
  } = useAlumniStack();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(
    "Obtendo os dados do currículo..."
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      setLoadingText("Obtendo os dados do currículo...");

      setLoadingText("Realizando o match entre vagas e currículo...");

      setLoadingText("Finalizando match...");

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative p-6 lg:gap-10 lg:p-8 w-full h-full">
        <div className="w-full h-full flex items-center justify-center space-y-2 bg-primary/75 rounded-lg">
          <h1
            className={cn(
              "scroll-m-20 text-3xl font-bold tracking-tight animate-pulse text-primary-foreground"
            )}
          >
            {loadingText}
          </h1>
        </div>
      </div>
    );
  }

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
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              link={job.link}
              icon={"/assets/linkedin.png"}
            />
          ))}
        </ul>
      </div>
      <JobMatchChart />
    </main>
  );
}
