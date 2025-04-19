import { Button } from "@/components/ui/button";
import { Selector } from "./Selector";
import { FileCheck, FileQuestion, FileUp, FileX, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { JobApplication, JobType } from "@/types/jobs";
import { toast } from "sonner";

const status = [
  { value: "applied", label: "Candidatura enviada" },
  { value: "rejected", label: "Candidatura rejeitada" },
  { value: "accepted", label: "Candidatura aceita" },
];

const applicationsStatusIcons = {
  applied: FileUp,
  accepted: FileCheck,
  rejected: FileX,
};

const applicationStatusIcon = (status: string | undefined) => {
  switch (status) {
    case "applied":
      return <applicationsStatusIcons.applied className="size-6 min-w-6" />;
    case "accepted":
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

const JobApplicationCard = ({
  jobApplication,
  job,
  handleDeleteJobApplication,
  handleUpdateJobApplicationStatus,
}: {
  jobApplication: JobApplication;
  job: JobType;
  handleDeleteJobApplication: (applicationId: number) => Promise<boolean>;
  handleUpdateJobApplicationStatus: (
    applicationId: number,
    status: "applied" | "rejected" | "accepted"
  ) => Promise<boolean>;
}) => {
  const [jobApplicationStatus, setJobApplicationStatus] = useState<
    "applied" | "rejected" | "accepted"
  >("applied");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJobApplicationStatus(jobApplication.status);
  }, [jobApplication]);

  const handleSubmit = async (
    currentJobApplication: JobApplication,
    newValue: "applied" | "rejected" | "accepted"
  ) => {
    try {
      setLoading(true);

      if (newValue === currentJobApplication?.status)
        throw new Error("state is not change");

      if (!currentJobApplication?.id) {
        throw new Error("no currentJobApplication available");
      }
      const response = await handleUpdateJobApplicationStatus(
        currentJobApplication?.id,
        newValue
      );

      if (!response) throw new Error("no job application adding response");
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case "state is not change":
            toast.error("Estado não alterado!");
            break;

          case "no currentJobApplication available":
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
      return false;
    }
  };

  const handleSetItemSelector = async (
    newValue: string,
    state: JobApplication,
    setState: Dispatch<SetStateAction<"applied" | "rejected" | "accepted">>
  ) => {
    if (
      newValue === "applied" ||
      newValue === "rejected" ||
      newValue === "accepted"
    ) {
      if (await handleSubmit(state, newValue)) {
        setState(newValue);
      }
    }
  };

  return (
    <li className="w-full h-max rounded-2xl border flex flex-col gap-4 lg:flex-row justify-between lg:items-center p-2 px-4">
      <div className="flex gap-4 items-center max-w-96 w-full">
        {applicationStatusIcon(jobApplication?.status)}

        <span className="w-full flex flex-col truncate">
          <p
            className="font-bold text-sm text-card-foreground truncate"
            title={job?.title}
          >
            {job?.title}
          </p>
          <p className="text-sm text-card-foreground truncate">
            {job?.company}
          </p>
        </span>
      </div>
      <div className="w-full lg:w-max flex gap-4 lg:gap-10 justify-between items-center flex-wrap">
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm text-muted-foreground">Status:</p>

          <Selector
            value={jobApplicationStatus}
            itens={status}
            label="Candidatura"
            onChange={(e) =>
              handleSetItemSelector(e, jobApplication, setJobApplicationStatus)
            }
          />
        </div>
        <span className="lg:ml-0 ">
          <p className="text-sm text-muted-foreground">Atualizada em</p>
          <p className="text-sm text-muted-foreground">
            {jobApplication?.updated_at
              ? formatDate(jobApplication?.updated_at)
              : formatDate(jobApplication?.created_at)}
          </p>
        </span>
      </div>
      <Button
        onClick={() =>
          !loading ? handleDeleteJobApplication(jobApplication.id) : () => null
        }
        variant="destructive"
        className="w-max h-full items-start justify-start text-start lg:!bg-transparent lg:shadow-none"
        title="Excluir candidatura"
      >
        <Trash className="size-5 lg:stroke-destructive" />
        <p className="lg:hidden">Excluir candidatura</p>
      </Button>
    </li>
  );
};

export default JobApplicationCard;
