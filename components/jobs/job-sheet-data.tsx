import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TechnologyCombobox } from "./curated/TechnologyCombobox";
import { Textarea } from "@/components/ui/textarea";

import { LoaderCircle, X } from "lucide-react";
import { Selector } from "./curated/Selector";
import { JobType } from "@/types/jobs";

const technologies = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c#", label: "C#" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "lua", label: "Lua" },
];

const workingHoursTypes = [
  { value: "Tempo integral", label: "Tempo Integral" },
  { value: "Meio período", label: "Meio Período" },
  { value: "Contrato", label: "Contrato" },
];

const workloadsTypes = [
  { value: "Presencial", label: "Presencial" },
  { value: "Hibrido", label: "Hibrido" },
  { value: "Remoto", label: "Remoto" },
];

const experiencieLevelTypes = [
  { value: "Estagio", label: "Estagio" },
  { value: "Junior", label: "Junior" },
  { value: "Pleno", label: "Pleno" },
  { value: "Senior", label: "Senior" },
  { value: "Expert", label: "Expert" },
  { value: "Diretor", label: "Diretor" },
];

const JobSheetData = ({
  handleUpdateJobs,
  currentJob,
  mode,
}: {
  handleUpdateJobs: (newJob: JobType) => void;
  currentJob?: JobType;
  mode: "edit" | "new";
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [locale, setLocale] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");
  const [applications, setApplications] = useState("");

  const [workingHours, setWorkingHours] = useState<string[]>([]);
  const [workload, setWorkload] = useState<string[]>([]);
  const [experiencieLevel, setExperiencieLevel] = useState<string[]>([]);
  const [jobLanguages, setJobLanguages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    console.log(open);
    if (mode === "edit" && currentJob) {
      setTitle(currentJob?.title);
      setCompany(currentJob?.company);
      setDescription(currentJob?.description || "");
      setLink(currentJob?.link);
      setLocale(currentJob?.details?.locale[0] || "");
      setAnnouncementDate(currentJob?.details?.locale[1] || "");
      setApplications(currentJob?.details?.locale[2] || "");
      setWorkload(
        currentJob?.details?.workplace_type[0] &&
          currentJob?.details?.workplace_type[0].length > 0
          ? [currentJob?.details?.workplace_type[0]]
          : []
      );
      setWorkingHours(
        currentJob?.details?.workplace_type[1] &&
          currentJob?.details?.workplace_type[1].length > 0
          ? [currentJob?.details?.workplace_type[1]]
          : []
      );
      setExperiencieLevel(
        currentJob?.details?.workplace_type[2] &&
          currentJob?.details?.workplace_type[2].length > 0
          ? [currentJob?.details?.workplace_type[2]]
          : []
      );
      setJobLanguages(currentJob?.details?.languages || []);
    } else if (mode === "new") {
      setTitle("");
      setCompany("");
      setDescription("");
      setLink("");
      setLocale("");
      setAnnouncementDate("");
      setApplications("");
      setWorkingHours([]);
      setWorkload([]);
      setExperiencieLevel([]);
      setJobLanguages([]);
    }

    setIsOpen(open);
  };

  const handleSetJobLanguages = (newJobLanguage: string) => {
    if (!jobLanguages.includes(newJobLanguage)) {
      setJobLanguages([...jobLanguages, newJobLanguage]);
    } else if (jobLanguages.includes(newJobLanguage)) {
      setJobLanguages(
        jobLanguages.filter((jobLanguage) => jobLanguage !== newJobLanguage)
      );
    }
  };

  const handleSetItemSelector = (
    newValue: string,
    state: string[],
    setState: (v: string[]) => void
  ) => {
    if (!state.includes(newValue)) {
      setState([newValue]);
    } else if (state.includes(newValue)) {
      setState(state.filter((value) => value !== newValue));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (
        !title ||
        !company ||
        !description ||
        !link ||
        !locale ||
        !announcementDate ||
        jobLanguages.length < 1 ||
        workload.length < 1 ||
        workingHours.length < 1 ||
        experiencieLevel.length < 1
      )
        throw new Error("fill the fields");

      if (mode === "edit" && !currentJob?.id) {
        throw new Error("no jobId available");
      }

      const data = {
        title: title,
        company: company,
        description: description,
        link: link,
        details: {
          languages: jobLanguages,
          locale: [locale, announcementDate, applications],
          workplace_type: [workload, workingHours, experiencieLevel],
        },
      };

      if (mode === "new") {
        const response = await axios.post("/api/jobs", data);

        if (response.status !== 201) throw "no job adding response";

        handleUpdateJobs(response.data.new_job);
        toast.success("Sucesso ao criar a vaga!");

        handleOpenChange(false);
      } else if (mode === "edit") {
        const response = await axios.put("/api/jobs", {
          jobId: currentJob?.id,
          updates: data,
        });

        if (response.status !== 200) throw "no job editing response";

        handleUpdateJobs(response.data.edited_job);
        toast.success("Sucesso ao editar a vaga!");
        handleOpenChange(false);
      }

      setLoading(false);
    } catch (error) {
      switch (error.message) {
        case "fill the fields":
          toast.error("Por favor preencha todos os campos obrigatórios!");
          break;

        case "no job adding response":
          toast.error("Erro ao criar vaga! Tente novamente mais tarde.");
          break;

        case "no job editing response":
          toast.error("Erro ao editar vaga! Tente novamente mais tarde.");
          break;

        case "no jobId available":
          toast.error(
            "Vaga a ser editada não existe. Tente recarregar a pagina."
          );

          handleOpenChange(false);
          break;

        default:
          toast.error(
            mode === "new"
              ? "Erro ao criar vaga! Tente novamente mais tarde."
              : "Erro ao editar vaga! Tente novamente mais tarde."
          );
          break;
      }
      setLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          variant={mode === "new" ? "default" : "ghost"}
          className={
            mode === "new"
              ? "!px-4 w-max items-start justify-start font-semibold"
              : "!px-2 w-max h-max items-start justify-start text-start"
          }
        >
          {mode === "new" ? "Adicionar Vaga" : "Editar Vaga"}
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-x-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "new" ? "Criar Nova Vaga" : "Editar Vaga"}
          </SheetTitle>
          <SheetDescription>
            {mode === "new"
              ? "Insira os dados da vaga"
              : "Altere os dados da vaga"}
          </SheetDescription>
        </SheetHeader>

        <form className="grid gap-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              *Titulo
            </Label>
            <Input
              id="name"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-row-2"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="company" className="text-left">
              *Empresa
            </Label>
            <Input
              id="company"
              type="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="row-span-2"
            />
          </div>

          <div className="grid grid-row-2 items-center gap-4">
            <Label htmlFor="description" className="text-left">
              *Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="row-span-2"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="link" className="text-left">
              *Link
            </Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="row-span-2"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="locale" className="text-left">
              *Localização
            </Label>
            <Input
              id="locale"
              type="text"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="row-span-2"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="announcementDate" className="text-left">
              *Data do anuncio
            </Label>
            <Input
              id="announcementDate"
              type="date"
              value={announcementDate}
              onChange={(e) => setAnnouncementDate(e.target.value)}
              className="row-span-2"
            />
          </div>

          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="applications" className="text-left">
              (opcional) Candidaturas ja realizadas
            </Label>
            <Input
              id="applications"
              type="number"
              value={applications}
              onChange={(e) => setApplications(e.target.value)}
              className="row-span-2"
            />
          </div>
          <Separator className="my-4" />
          <div className="grid grid-rows-2 grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left col-span-3">
              *Jornada de trabalho
            </p>

            <div className="row-span-2 col-span-1 flex gap-1 ">
              {workingHours.map((w, i) => (
                <Badge variant="outline" key={i}>
                  {w}
                  <X
                    onClick={() =>
                      handleSetItemSelector(w, workingHours, setWorkingHours)
                    }
                    className="size-3 ml-1 cursor-pointer"
                  />
                </Badge>
              ))}
              {workingHours.length < 1 && (
                <Selector
                  itens={workingHoursTypes}
                  excludeItens={workingHours}
                  label="Jornada de trabalho"
                  value=""
                  onChange={(e) =>
                    handleSetItemSelector(e, workingHours, setWorkingHours)
                  }
                />
              )}
            </div>

            <div className="row-span-2 col-span-1 flex gap-1">
              {workload.map((w, i) => (
                <Badge variant="outline" key={i}>
                  {w}
                  <X
                    onClick={() =>
                      handleSetItemSelector(w, workload, setWorkload)
                    }
                    className="size-3 ml-1 cursor-pointer"
                  />
                </Badge>
              ))}
              {workload.length < 1 && (
                <Selector
                  itens={workloadsTypes}
                  label="Carga horaria"
                  excludeItens={workload}
                  value=""
                  onChange={(e) =>
                    handleSetItemSelector(e, workload, setWorkload)
                  }
                />
              )}
            </div>

            <div className="row-span-2 col-span-1 flex gap-1">
              {experiencieLevel.map((e, i) => (
                <Badge variant="outline" key={i}>
                  {e}
                  <X
                    onClick={() =>
                      handleSetItemSelector(
                        e,
                        experiencieLevel,
                        setExperiencieLevel
                      )
                    }
                    className="size-3 ml-1 cursor-pointer"
                  />
                </Badge>
              ))}
              {experiencieLevel.length < 1 && (
                <Selector
                  itens={experiencieLevelTypes}
                  label="Nível de experiencia"
                  value=""
                  onChange={(e) =>
                    handleSetItemSelector(
                      e,
                      experiencieLevel,
                      setExperiencieLevel
                    )
                  }
                />
              )}
            </div>
          </div>

          <Separator className="my-4" />
          <div className="grid grid-rows-2 items-center gap-4">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
              *Tecnologias
            </p>

            <div className="row-span-2 flex gap-1">
              {jobLanguages.map((r, i) => (
                <Badge variant="outline" key={i}>
                  {r}
                  <X
                    onClick={() => handleSetJobLanguages(r)}
                    className="size-3 ml-1 cursor-pointer"
                  />
                </Badge>
              ))}
              {technologies.filter(
                (technology) => !jobLanguages.includes(technology.value)
              ).length > 0 && (
                <TechnologyCombobox
                  itens={technologies}
                  excludeItens={jobLanguages}
                  value="0"
                  onChange={handleSetJobLanguages}
                />
              )}
            </div>
          </div>
        </form>

        <SheetFooter>
          <Button
            type="button"
            onClick={() => (!loading ? handleSubmit() : null)}
            className="gap-2 flex font-semibold"
          >
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            {mode === "new" ? "Adicionar Vaga" : "Editar Vaga"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JobSheetData;
