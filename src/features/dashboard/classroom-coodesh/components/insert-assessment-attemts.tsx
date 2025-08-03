"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ClassroomCoodeshAssessmentT, ParticipantDataT } from "@/types";
import { formatParticipantsData } from "../utils/format-participant-data";

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

  const [participantData, setParticipantData] = useState<ParticipantDataT[]>();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: (value: string | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setState(event.target.result as string);
        }
      };
      reader.readAsText(file);
      toast.success("Arquivo carregado com sucesso.");
      return;
    } else {
      toast.error("Selecione um arquivo válido.");
    }
  };

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setResultsCsv(null);
      setIntegrityCsv(null);
      setActionPlansCsv(null);
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
      <DialogContent className="max-w-[85vw]! w-max! overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
            <div className="flex flex-col gap-4">
              <Label className="font-semibold" htmlFor="resultsFile">
                Respostas
              </Label>
              <Input
                id="resultsFile"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, setResultsCsv)}
                placeholder="Selecione um arquivo CSV"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label className="font-semibold" htmlFor="integrityFile">
                Integridade
              </Label>
              <Input
                id="integrityFile"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, setIntegrityCsv)}
                placeholder="Selecione um arquivo CSV"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Label className="font-semibold" htmlFor="actionPlanFile">
                Plano de ação
              </Label>
              <Input
                id="actionPlanFile"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, setActionPlansCsv)}
                placeholder="Selecione um arquivo CSV"
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-h-96 flex overflow-y-auto my-4 border rounded-lg">
            <Table className="w-full h-full">
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="max-w-56 w-56 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-start items-center border-r">
                      Nome
                    </div>
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-start items-center border-r">
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="max-w-32 w-32 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-center items-center border-r">
                      Respostas
                    </div>
                  </TableHead>
                  <TableHead className="max-w-32 w-32 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-center items-center border-r">
                      Integridade
                    </div>
                  </TableHead>
                  <TableHead className="max-w-32 w-32 truncate font-semibold p-0!">
                    <div className="w-full h-full p-2 flex justify-center items-center">
                      Planos de ação
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantData &&
                  participantData
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((participant) => (
                      <TableRow key={participant.email}>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-start items-center border-r p-2 max-w-56 w-56">
                            {participant.name}
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-start items-center border-r p-2 max-w-56 w-56">
                            {participant.email}
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-32 w-32">
                            <span className="font-semibold">
                              {participant.results.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center border-r p-2 max-w-32 w-32">
                            <span className="font-semibold">
                              {participant.integrityEvents.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-0!">
                          <div className="h-14! flex justify-center items-center p-2 max-w-32 w-32">
                            <span className="font-semibold">
                              {participant.actionPlans.length}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="!flex flex-row! justify-end gap-2">
          {stage === 0 && (
            <>
              <DialogClose>
                <Button
                  variant="outline"
                  className="font-semibold text-muted-foreground"
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button
                onClick={handleExtractParticipantData}
                disabled={
                  stage === 0 &&
                  (!resultsCsv || !integrityCsv || !actionPlansCsv)
                }
                className="font-semibold"
              >
                Extrair dados
              </Button>
            </>
          )}
          {stage === 1 && (
            <>
              <Button
                onClick={() => {
                  setParticipantData([]);
                  setStage(0);
                  return;
                }}
                variant="outline"
                className="font-semibold text-muted-foreground"
              >
                Trocar arquivos CSV
              </Button>
              {participantData && participantData.length > 0 && (
                <Button
                  onClick={() => (!loading ? handleSubmit() : null)}
                  className="font-semibold"
                  disabled={loading}
                >
                  {loading && <LoaderCircle className="size-5 animate-spin" />}
                  Inserir {participantData.length} dados
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsertAssessmentAttempts;
