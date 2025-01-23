"use client";
import JobCard from "@/components/jobs/Match/JobCard";
import { JobMatchChart } from "@/components/jobs/Match/JobMatchChart";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(
    "Obtendo os dados do currículo..."
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      setLoadingText("Obtendo os dados do currículo...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setLoadingText("Obtendo vagas curadas pela PdA...");
      try {
        const res = await axios.get("/api/jobs");
        setJobs(res.data.results);
      } catch (error) {
        console.error("Error:", error);
      }

      setLoadingText("Realizando o match entre vagas e currículo...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setLoadingText("Finalizando match...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

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
    <main className="relative p-6 lg:gap-10 lg:p-8 xl:grid xl:grid-cols-[1fr_300px] grid-rows-[24px_1fr]">
      <div className="flex h-6 items-center space-x-1 text-sm leading-none col-span-2 row-span-1">
        <SidebarTrigger />
        <Separator orientation="vertical" className="!mx-3" />
        <div className="truncate text-muted-foreground">Inicio</div>
        <ChevronRight className="h-3.5 w-3.5" />
        <div className=" text-muted-foreground">Vagas</div>
        <ChevronRight className="h-3.5 w-3.5" />
        <div className="text-foreground">Realizar Match</div>
      </div>

      <div className="w-full min-w-0 h-max flex flex-col gap-10 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="space-y-2 flex flex-col gap-1">
            <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
              Vagas que combinam com seu perfil
            </h1>
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
