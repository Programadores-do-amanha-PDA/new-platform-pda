import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import { Button } from "@/components/ui/button";

import { ActionPlanRow, ParticipantData } from "@/types/coodesh/attempts";

import { AttemptScoreRadialChart } from "./attempt-score-radial-chart";
import AttemptIntegrityCard from "./attempt-integrity-card";
import AttemptActionPlanCard from "./attempt-action-plan-card";
import { ExternalLink, SquareArrowOutUpRight } from "lucide-react";

const EVENT_TYPE_LABELS: Record<string, string> = {
  challenge_start: "Início do Desafio",
  fullscreen_enter: "Entrou em Tela Cheia",
  fullscreen_leave: "Saiu da Tela Cheia",
  idle: "Inatividade",
  active: "Ativo",
  viewed_question: "Visualizou Questão",
  challenge_finish: "Finalizou Desafio",
  tab_exit: "Saiu da Guia",
  back_to_challenges_page: "Voltou à Página",
  copy_content: "Copiou Conteúdo",
  paste_content: "Colou Conteúdo",
};

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

  const renderTextWithCodeHighlight = (text: string) => {
    if (!text) return "Nenhum plano de ação disponível";

    // Regex para identificar blocos de código como ```sql ... ```
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(codeBlockRegex, (match, language, code, offset) => {
      // Adiciona o texto antes do bloco de código
      if (offset > lastIndex) {
        parts.push(text.substring(lastIndex, offset));
      }

      // Adiciona o bloco de código com highlight
      parts.push(
        <SyntaxHighlighter
          key={offset}
          language={language || "sql"} // Padrão para SQL se não especificado
          style={atomDark}
          customStyle={{
            padding: "1rem",
            borderRadius: "16px",
            backgroundColor: "#161616",
            margin: "0rem",
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      );

      lastIndex = offset + match.length;
      return match;
    });

    // Adiciona o restante do texto após o último bloco de código
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length ? parts : text;
  };

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
            <TabsContent
              value="generalInformation"
              className="w-full gap-1 bg-muted rounded-xl p-2"
            >
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
                  {
                    new Set(
                      attempt.integrityEvents.map((event) => event.browser)
                    )
                  }
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
                <p className="text-muted-foreground">
                  Saiu do modo tela cheia?
                </p>
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
              <div className="bg-background rounded-xl max-h-80 overflow-y-auto">
                <Table>
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
            <TabsContent value="integrity" className="bg-muted p-1 rounded-xl">
              <div className="bg-background rounded-xl max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Data/Hora</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Localização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempt.integrityEvents.map((event, index) => (
                      <TableRow key={"event-" + index}>
                        <TableCell className="text-left">
                          {event.created
                            ? new Date(event.created).toLocaleString("pt-BR", {
                                hour12: false,
                                timeZone: "America/Sao_Paulo",
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell className="font-medium capitalize truncate">
                          {EVENT_TYPE_LABELS[event.eventType] ||
                            event.eventType.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {event.eventType === "tab_exit" ||
                          event.eventType === "fullscreen_leave" ||
                          event.eventType === "copy_content" ||
                          event.eventType === "paste_content" ? (
                            <span className="text-red-400 font-semibold">
                              Suspeito
                            </span>
                          ) : (
                            <span className="text-green-400 font-semibold">
                              Normal
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {event.deviceType || "N/A"}
                        </TableCell>
                        <TableCell>{event.location || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent
              value="action-plan"
              className="bg-muted p-1 rounded-xl"
            >
              <div className="bg-background rounded-xl max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Desafio</TableHead>
                      <TableHead>Questão</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempt.actionPlans.map((plan: ActionPlanRow) => (
                      <TableRow key={`plan-${plan.id}`}>
                        <TableCell className="font-medium truncate">
                          {plan.challenge}
                        </TableCell>
                        <TableCell>
                          {plan.question.split(",")[0] || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-left hover:bg-muted w-full justify-start"
                                disabled={!plan.actionPlanText}
                              >
                                {plan.actionPlanText ? (
                                  <ExternalLink className="size-5" />
                                ) : (
                                  "N/A"
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Plano de Ação</DialogTitle>
                              </DialogHeader>
                              <div className="whitespace-pre-wrap p-4 bg-muted rounded-lg">
                                {plan.actionPlanText
                                  ? renderTextWithCodeHighlight(
                                      plan.actionPlanText
                                    )
                                  : "Nenhum plano de ação disponível"}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttemptDialog;
