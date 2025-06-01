import { Dispatch, SetStateAction, useState } from "react";

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

import { LoaderCircle } from "lucide-react";
import { JobApplicationWithJobT } from "@/types/jobs";
import { Selector } from "./Selector";
import { toast } from "sonner";

const status = [
  { value: "applied", label: "Candidatura enviada" },
  { value: "rejected", label: "Candidatura rejeitada" },
  { value: "accepted", label: "Candidatura aceita" },
];

type JobApplicationTStatus = "applied" | "rejected" | "accepted";

const JobApplicationTSheetData = ({
  handleUpdateJobApplicationT,
  currentJobApplicationT,
}: {
  handleUpdateJobApplicationT: (
    applicationId: number,
    status: "applied" | "rejected" | "accepted"
  ) => Promise<boolean>;
  currentJobApplicationT?: JobApplicationWithJobT;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [JobApplicationTStatus, setJobApplicationTStatus] = useState<
    "applied" | "rejected" | "accepted"
  >("applied");

  const [loading, setLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    console.log(open);
    if (currentJobApplicationT) {
      setJobApplicationTStatus(currentJobApplicationT?.status);
    }
    setIsOpen(open);
  };

  const handleSetItemSelector = (
    newValue: string,
    setState: Dispatch<SetStateAction<JobApplicationTStatus>>
  ) => {
    // Ensure the newValue is one of the allowed statuses
    if (
      newValue === "applied" ||
      newValue === "rejected" ||
      newValue === "accepted"
    ) {
      setState(newValue);
    } else {
      console.error("Invalid status value:", newValue);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (JobApplicationTStatus === currentJobApplicationT?.status)
        throw new Error("state is not change");

      if (!currentJobApplicationT?.id) {
        throw new Error("no currentJobApplicationT available");
      }
      const response = await handleUpdateJobApplicationT(
        currentJobApplicationT?.id,
        JobApplicationTStatus
      );

      if (!response) throw new Error("no job application adding response");

      toast.success("Sucesso ao criar a vaga!");

      handleOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "state is not change":
            toast.error("Estado não alterado!");
            break;

          case "no currentJobApplicationT available":
            toast.error("Não há ID de vaga disponível!");
            break;

          default:
            toast.error(
              "Erro ao editar a candidatura! Tente novamente mais tarde."
            );
            break;
        }
      }
      setLoading(false);
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={isOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-2! w-max h-max items-start justify-start text-start"
        >
          Editar Candidatura
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-x-auto">
        <SheetHeader>
          <SheetTitle>Editar Candidatura</SheetTitle>
          <SheetDescription>Atualize os status da candidatura</SheetDescription>
        </SheetHeader>

        <form className="grid gap-4 my-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-rows-2 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              *Titulo
            </Label>
            <Input
              id="name"
              type="text"
              value={currentJobApplicationT?.jobs?.title}
              readOnly
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
              value={currentJobApplicationT?.jobs?.company}
              readOnly
              className="row-span-2"
            />
          </div>

          <Separator className="my-4" />
          <div className="grid grid-rows-2 grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left col-span-3">
              *Status da candidatura
            </p>

            <div className="row-span-2 col-span-1 flex gap-1 ">
              <Selector
                value={JobApplicationTStatus}
                itens={status}
                label="Candidatura"
                onChange={(e) =>
                  handleSetItemSelector(e, setJobApplicationTStatus)
                }
              />
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
            Aplicar mudanças
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default JobApplicationTSheetData;
