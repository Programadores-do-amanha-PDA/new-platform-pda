"use client";
import { useState } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Upload } from "lucide-react";
import { formatParticipantsData } from "@/utils/coodesh/format-participant-data";

import { ParticipantData } from "@/types/coodesh/attempts";

const InsertAssessmentAttempts = ({
  assessment,
  handleUpdateCoodeshAssessment,
}: {
  assessment: ClassroomCoodeshAssessment | undefined;
  handleUpdateCoodeshAssessment: (
    assessment: ClassroomCoodeshAssessment,
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);

  const [resultsCsv, setResultsCsv] = useState<string | null>(null);
  const [integrityCsv, setIntegrityCsv] = useState<string | null>(null);
  const [actionPlansCsv, setActionPlansCsv] = useState<string | null>(null);

  const [participantData, setParticipantData] = useState<ParticipantData[]>();

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

      await handleUpdateCoodeshAssessment(assessment, {
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
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger>
        <Button>
          <Upload className="size-5" />
          Carregar arquivos de respostas
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {stage === 0 && "Cargar arquivos de respostas"}
            {stage === 1 && "Revisar e salvar os dados de respostas"}
          </DrawerTitle>
        </DrawerHeader>

        {stage === 0 ? (
          <div className="flex gap-6 p-4">
            <div className="flex flex-col gap-4 max-w-xs">
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
            <div className="flex flex-col gap-4 max-w-xs">
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
            <div className="flex flex-col gap-4 max-w-xs">
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
          <div className="w-full max-h-96 overflow-y-auto px-4 my-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-56 w-56 truncate">Nome</TableHead>
                  <TableHead className="max-w-56 w-56 truncate">
                    Email
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate">
                    Respostas
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate">
                    Registros de Integridade
                  </TableHead>
                  <TableHead className="max-w-56 w-56 truncate">
                    Planos de ação
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
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.results.length}</TableCell>
                        <TableCell>
                          {participant.integrityEvents.length}
                        </TableCell>
                        <TableCell>{participant.actionPlans.length}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DrawerFooter className="!flex flex-row! justify-end gap-8">
          {stage === 0 && (
            <>
              <DrawerClose>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>

              <Button
                onClick={handleExtractParticipantData}
                disabled={
                  stage === 0 &&
                  (!resultsCsv || !integrityCsv || !actionPlansCsv)
                }
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
              >
                Trocar arquivos csv
              </Button>
              {participantData && participantData.length > 0 && (
                <Button onClick={() => (!loading ? handleSubmit() : null)}>
                  {loading && <LoaderCircle className="size-5 animate-spin" />}
                  Inserir {participantData.length} dados
                </Button>
              )}
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default InsertAssessmentAttempts;
