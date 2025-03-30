import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ParticipantData } from "@/types/coodesh/attempts";

import { AttemptScoreRadialChart } from "./attempt-score-radial-chart";
import AttemptIntegrityCard from "./attempt-integrity-card";
import AttemptActionPlanCard from "./attempt-action-plan-card";
import { SquareArrowOutUpRight } from "lucide-react";

const AttemptDialog = ({
  open,
  onClose,
  attempt,
}: {
  open: boolean;
  onClose: (open: boolean) => void;
  attempt: ParticipantData;
}) => {
  // "challenge_start", "fullscreen_enter", "idle", "active", "viewed_question", "challenge_finish", "tab_exit", "back_to_challenges_page", "copy_content"
  console.log(attempt.integrityEvents);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-full !max-w-[700px] !max-h-[90vh] overflow-hidden px-0">
        <DialogHeader className="w-full h-full overflow-hidden px-4">
          <DialogTitle>{attempt.name}</DialogTitle>
          <DialogDescription>{attempt.email}</DialogDescription>
        </DialogHeader>
        <div className="w-full !max-h-[70vh] flex flex-col gap-8 mt-4 overflow-y-auto px-4">
          <header className="w-full flex justify-between gap-4">
            <div className="border rounded-md size-40">
              <AttemptScoreRadialChart
                chartData={[
                  {
                    label: "Pontuação",
                    value: 90,
                    fill: "var(--color-primary)",
                  },
                ]}
              />
            </div>
            <div className="border rounded-md size-40">
              <AttemptIntegrityCard integrityEvents={attempt.integrityEvents} />
            </div>
            <div className="border rounded-md size-40">
              <AttemptActionPlanCard actionPlans={attempt.actionPlans} />
            </div>
          </header>

          <Tabs defaultValue="generalInformation" className="w-full">
            <TabsList>
              <TabsTrigger value="generalInformation">
                Informações Gerais
              </TabsTrigger>
              <TabsTrigger value="questions">Questões</TabsTrigger>
              <TabsTrigger value="integrity">Integridade</TabsTrigger>
              <TabsTrigger value="action-plan">Planos de Ações</TabsTrigger>
            </TabsList>
            <TabsContent value="generalInformation" className="w-full gap-1 bg-muted rounded-xl p-2">
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">Dispositivo usado:</p>
              <p className="font-semibold capitalize">
                {
                  new Set(
                    attempt.integrityEvents.map((event) => event.deviceType)
                  )
                }
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">Navegador:</p>
              <p className="font-semibold capitalize">
                {new Set(attempt.integrityEvents.map((event) => event.browser))}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">Local:</p>
              <p className="font-semibold capitalize">
                {
                  new Set(
                    attempt.integrityEvents
                      .filter((event) => event.location !== "N/A")
                      .map((e) => e.location)
                  )
                }
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">Saiu do modo tela cheia?</p>
              {attempt.integrityEvents.filter(
                (event) => event.eventType === "fullscreen_leave"
              ).length > 0 ? (
                <p className="font-semibold uppercase text-red-400">sim</p>
              ) : (
                <p className="font-semibold uppercase text-green-400">não</p>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">
                Saiu da guia de navegação?
              </p>
              {attempt.integrityEvents.filter(
                (event) => event.eventType === "tab_exit"
              ).length > 0 ? (
                <p className="font-semibold uppercase text-red-400">sim</p>
              ) : (
                <p className="font-semibold uppercase text-green-400">não</p>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">
                Utilizou mais de um único endereço de IP?
              </p>
              {new Set(
                attempt.integrityEvents
                  .filter((e) => e.ipAddress !== undefined)
                  .map((event) => event.ipAddress)
              ).size > 0 ? (
                <p className="font-semibold uppercase text-red-400">sim</p>
              ) : (
                <p className="font-semibold uppercase text-green-400">não</p>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              <p className="text-muted-foreground">Copiar/Colar detectado?</p>
              {attempt.integrityEvents.filter(
                (event) =>
                  event.eventType === "copy_content" ||
                  event.eventType === "paste_content"
              ).length > 0 ? (
                <p className="font-semibold uppercase text-red-400">sim</p>
              ) : (
                <p className="font-semibold uppercase text-green-400">não</p>
              )}
            </div>
            </TabsContent>
            <TabsContent value="questions" className="bg-muted p-1 rounded-xl">
              <div className="bg-background rounded-xl">
                <Table className="max-h-40 overflow-y-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Questão</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Finalizado em</TableHead>
                      <TableHead className="text-right">Pontuação</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempt.results.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          {question.challenge}
                        </TableCell>
                        <TableCell>
                          {question?.challengeDurationMinutes}min
                        </TableCell>
                        <TableCell>
                          {question?.challengeStatus === "finished"
                            ? "Finalizado"
                            : "Não Finalizado"}
                        </TableCell>
                        <TableCell>
                          {question.challengeSubmittedAt
                            ? new Date(
                                question.challengeSubmittedAt
                              ).toLocaleString("pt-BR", {
                                hour12: false,
                                timeZone: "America/Sao_Paulo",
                                dateStyle: "short",
                              })
                            : ""}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {question.challengeScore
                            ? question.challengeScore.toFixed(0)
                            : "0"}
                          %
                        </TableCell>

                        {question.challengeLink && (
                          <TableCell
                            className="text-right cursor-pointer group"
                            onClick={() => window.open(question.challengeLink)}
                          >
                            <SquareArrowOutUpRight className="size-4 stroke-muted-foreground ml-auto group-hover:stroke-primary" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="integrity">
              <div className="bg-background rounded-xl !max-h-40 overflow-y-auto">
                <div className=""></div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttemptDialog;
