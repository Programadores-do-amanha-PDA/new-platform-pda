"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { ClassroomCoodeshAssessmentT, ParticipantDataT } from "@/types";
import { formatParticipantsData } from "../utils/format-participant-data";
import FileUploadStage from "./file-upload-stage";
import DataReviewStage from "./data-review-stage";

const InsertAssessmentAttempts = ({
  assessment,
  updateAssessment,
}: {
  assessment: ClassroomCoodeshAssessmentT | undefined;
  updateAssessment: (
    assessment: ClassroomCoodeshAssessmentT,
    assessmentData: Partial<ClassroomCoodeshAssessmentT>
  ) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);

  const [resultsCsv, setResultsCsv] = useState<string | null>(null);
  const [integrityCsv, setIntegrityCsv] = useState<string | null>(null);
  const [actionPlansCsv, setActionPlansCsv] = useState<string | null>(null);

  const [participantData, setParticipantData] = useState<ParticipantDataT[]>(
    []
  );

  const handleExtractParticipantData = () => {
    if (!resultsCsv || !integrityCsv || !actionPlansCsv) {
      toast.error("Selecione todos os arquivos necessários.");
      setStage(0);

      return;
    }

    const formattedParticipantsData = formatParticipantsData(
      resultsCsv,
      integrityCsv,
      actionPlansCsv
    );
    setParticipantData(formattedParticipantsData);
    toast.success("Dados dos participantes extraídos com sucesso.");
    setStage(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!assessment?.id) throw new Error("Assessment ID is missing.");
      if (!participantData) throw new Error("Participant data is missing.");

      // Get the existing participant data from the assessment
      const existingParticipants = assessment.participants_data || [];

      // Merge the existing data with the new data
      const mergedParticipants = participantData.map((newParticipant) => {
        const existingParticipant = existingParticipants.find(
          (existing) => existing.email === newParticipant.email
        );

        // If the participant already exists, merge the data
        if (existingParticipant) {
          return {
            ...existingParticipant,
            results: [
              ...existingParticipant.results,
              ...newParticipant.results,
            ],
            integrityEvents: [
              ...existingParticipant.integrityEvents,
              ...newParticipant.integrityEvents,
            ],
            actionPlans: [
              ...existingParticipant.actionPlans,
              ...newParticipant.actionPlans,
            ],
          };
        }

        // If the participant is new, add them to the list
        return newParticipant;
      });

      const finalParticipants = [
        ...mergedParticipants,
        ...existingParticipants.filter(
          (existing) =>
            !participantData.some(
              (newParticipant) => newParticipant.email === existing.email
            )
        ),
      ];

      await updateAssessment(assessment, {
        participants_data: finalParticipants,
      });

      toast.success("Dados dos participantes inseridos com sucesso.");
      setLoading(false);
      handleOpenChange(false);
    } catch {
      toast.error(
        "Erro ao inserir dados dos participantes. Tente novamente mais tarde!"
      );
      setLoading(false);
    }
  };

  const handleBackToFileSelection = () => {
    setParticipantData([]);
    setStage(0);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setResultsCsv(null);
      setIntegrityCsv(null);
      setActionPlansCsv(null);
      setParticipantData([]);
      setStage(0);
      setLoading(false);
    }

    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button>
          <Upload className="size-5" />
          Carregar arquivos de respostas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[65vw]! w-full! overflow-hidden">
        <DialogHeader>
          <DialogTitle>Carregar arquivos de respostas</DialogTitle>
          <DialogDescription>
            {stage === 0 && (
              <>
                Selecione os arquivos CSV para carregar os dados das tentativas
                <p>
                  São necessários os arquivos: <b>Respostas</b>,{" "}
                  <b>Integridade</b> e <b>Plano de ação</b>
                </p>
              </>
            )}
            {stage === 1 &&
              "Revise os dados dos participantes a serem inseridos"}
          </DialogDescription>
        </DialogHeader>

        {stage === 0 ? (
          <FileUploadStage
            resultsCsv={resultsCsv}
            integrityCsv={integrityCsv}
            actionPlansCsv={actionPlansCsv}
            setResultsCsv={setResultsCsv}
            setIntegrityCsv={setIntegrityCsv}
            setActionPlansCsv={setActionPlansCsv}
            onExtractData={handleExtractParticipantData}
          />
        ) : (
          <DataReviewStage
            participantData={participantData}
            loading={loading}
            onSubmit={handleSubmit}
            onBackToFileSelection={handleBackToFileSelection}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InsertAssessmentAttempts;
