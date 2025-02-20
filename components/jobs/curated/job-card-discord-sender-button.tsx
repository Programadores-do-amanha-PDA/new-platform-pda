"use client";

import { Button } from "@/components/ui/button";
import { JobType } from "@/types/jobs";
import { connectUseAPI, SendMessageOnDiscord } from "@/utils/utils_api";
import { Check, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const JobCardDiscordSenderButton = ({
  job,
  handleJobIsOnDiscord,
}: {
  job: JobType;
  handleJobIsOnDiscord: (jobId: string) => Promise<boolean>;
}) => {
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  const NEXT_PUBLIC_JOBS_CHANNEL_ID = process.env.NEXT_PUBLIC_JOBS_CHANNEL_ID;

  const handleSendJobOnDiscord = async (selectedJob: JobType) => {
    setIsSendingMessage(true);

    toast.info("Estabelecendo a conexão coma  API...");
    const isUtilsAPIOn = await connectUseAPI();

    if (!isUtilsAPIOn) {
      toast.error("Erro ao reconectar a API! Tente novamente mais tarde!");
      setIsSendingMessage(false);
      return;
    }
    toast.success("Conexão estabelecida com sucesso!");

    if (!selectedJob.id || !NEXT_PUBLIC_JOBS_CHANNEL_ID) {
      toast.error(
        "Erro ao enviar vaga no Discord! Tente novamente mais tarde!"
      );
      setIsSendingMessage(false);
      return;
    }

    toast.info("Publicando vaga no Discord...");
    const response = await SendMessageOnDiscord({
      message: `🏢  Empresa:  ${selectedJob.company}\n🌟  Vaga:  ${
        selectedJob.title
      }\n🏙  Local:  ${
        selectedJob?.details?.locale[0]
      }\n💼  Detalhes: ${selectedJob?.details?.workplace_type?.join(
        " - "
      )}\n🔗  [Mais informações / Inscrição](${selectedJob.link})`,
      channel: NEXT_PUBLIC_JOBS_CHANNEL_ID,
    });

    if (!response.status) {
      toast.error(
        "Ocorreu um erro ao enviar a Vaga no Discord! Tente novamente mais tarde!"
      );
      return false;
    }

    const isStatusUpdated = await handleJobIsOnDiscord(job.id);

    if (!isStatusUpdated) {
      toast.error("Ocorreu um erro ao atualizar o status da vaga!");
    }

    setIsSendingMessage(false);
    toast.success("Vaga publicada no Discord com sucesso!");
    return;
  };

  if (job.is_on_discord) {
    return (
      <Button
        variant="ghost"
        className="!px-2 w-max h-max items-start justify-start text-start !bg-background cursor-default"
        title="Vaga publicada no Discord!"
      >
        <Check className="size-4 text-blue-600" />
      </Button>
    );
  }

  return (
    <Button
      onClick={async () => await handleSendJobOnDiscord(job)}
      variant="outline"
      className="!px-2 w-max h-max items-start justify-start text-start !bg-blue-200/80"
      title="Publicar no Discord"
    >
      {isSendingMessage ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Send className="size-4" />
      )}
    </Button>
  );
};
export default JobCardDiscordSenderButton;
