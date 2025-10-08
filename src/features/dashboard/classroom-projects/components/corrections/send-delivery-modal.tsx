"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RotateCw, Send } from "lucide-react";

// Global imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Local imports
import {
  ClassroomProjectDeliveryT,
  ClassroomProjectT,
  ClassroomProjectCorrectionT,
} from "../../types";

export type MessagesTemplatesType = {
  [key: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
};

interface DeliveryMemberT {
  email: string;
  name: string;
  deliveryId: string;
  deliveryData: {
    id: string;
    final_note?: string;
    final_considerations?: string;
    teacher_name: string;
    teacher_email?: string;
    rules_selected: { label: string; text: string }[];
    hits_itens: { emoji: string; text: string }[];
    improvements_itens: { emoji: string; text: string }[];
    next_itens: { emoji: string; text: string }[];
  };
}

interface SendDeliveriesFeedbackEmailModalProps {
  open: boolean;
  deliveries: ClassroomProjectDeliveryT[];
  corrections: ClassroomProjectCorrectionT[];
  project: ClassroomProjectT;
  setClose: () => void;
  setRefreshDeliveries: () => void;
}

export default function SendDeliveriesFeedbackEmailModal({
  open,
  deliveries,
  corrections,
  project,
  setClose,
  setRefreshDeliveries,
}: SendDeliveriesFeedbackEmailModalProps) {
  const [steps, setSteps] = useState(0);
  const [deliveriesSelected, setDeliveriesSelected] = useState<
    DeliveryMemberT[]
  >([]);
  const [emailsSent, setEmailsSent] = useState<string[]>([]);
  const [isSendingDeliveries, setIsSendingDeliveries] = useState(false);

  const getDeliveryCorrection = (
    deliveryId: string
  ): ClassroomProjectCorrectionT | undefined => {
    return corrections.find(
      (correction) => correction.delivery_id === deliveryId
    );
  };

  const deliveryData = (delivery: ClassroomProjectDeliveryT) => {
    const correction = getDeliveryCorrection(delivery.id);

    return {
      id: delivery.id,
      final_note: correction?.final_note,
      final_considerations: correction?.final_considerations,
      teacher_name: "Professor", // TODO: Get from user context
      teacher_email: correction?.teacher_email,
      rules_selected:
        correction?.rules_selected?.map((rule) => ({
          label: rule.ruleL,
          text: `${rule.rule} (Nota: ${rule.ruleNote})`,
        })) || [],
      hits_itens:
        correction?.hits_itens && correction.hits_itens.length > 0
          ? correction.hits_itens.map((hit: string) => ({
              emoji: "🥇",
              text: hit,
            }))
          : [],
      improvements_itens:
        correction?.improvements_itens &&
        correction.improvements_itens.length > 0
          ? correction.improvements_itens.map((improvement: string) => ({
              emoji: "🗡️",
              text: improvement,
            }))
          : [],
      next_itens:
        correction?.next_itens && correction.next_itens.length > 0
          ? correction.next_itens.map((next: string) => ({
              emoji: "👨‍🚀",
              text: next,
            }))
          : [],
    };
  };

  const handleSelectMember = (deliveryMember: DeliveryMemberT) => {
    const isSelected = deliveriesSelected.some(
      (d) =>
        d.email === deliveryMember.email &&
        d.deliveryId === deliveryMember.deliveryId
    );

    if (!isSelected) {
      setDeliveriesSelected((deliveries) => [...deliveries, deliveryMember]);
    } else {
      setDeliveriesSelected(
        deliveriesSelected.filter(
          (delivery) =>
            !(
              delivery.email === deliveryMember.email &&
              delivery.deliveryId === deliveryMember.deliveryId
            )
        )
      );
    }
  };

  const getCorrectedDeliveries = () => {
    return deliveries.filter((delivery) => {
      const correction = getDeliveryCorrection(delivery.id);
      return correction && correction.final_note;
    });
  };

  const allMembers = (): DeliveryMemberT[] =>
    getCorrectedDeliveries().flatMap((delivery: ClassroomProjectDeliveryT) =>
      delivery.members.map((memberEmail: string) => ({
        email: memberEmail,
        name: memberEmail.split("@")[0], // TODO: Get actual name from user data
        deliveryId: delivery.id,
        deliveryData: deliveryData(delivery),
      }))
    );

  const handleSelectAllDeliveries = () => {
    if (deliveriesSelected.length === allMembers().length) {
      setDeliveriesSelected([]);
    } else {
      setDeliveriesSelected(allMembers());
    }
  };

  const handleClose = () => {
    setSteps(0);
    setDeliveriesSelected([]);
    setEmailsSent([]);
    setIsSendingDeliveries(false);
    setClose();
  };

  const handleContinue = () => {
    if (deliveriesSelected.length <= 0) {
      toast.error("Selecione pelo menos um estudante!");
      setSteps(0);
      return;
    }

    if (deliveriesSelected.length > 0) {
      setSteps(1);
      return;
    }
  };

  const handleSubmit = async () => {
    setIsSendingDeliveries(true);

    if (deliveriesSelected.length <= 0) {
      toast.error("Selecione pelo menos um estudante!");
      setIsSendingDeliveries(false);
      return;
    }

    try {
      toast.info("Enviando e-mails de feedback...");

      for (const deliveryMember of deliveriesSelected) {
        const emailData = {
          email: deliveryMember.email,
          subject: "Seu feedback chegou!",
          project_type: project.project_type,
          project_module: String(project.module),
          teacher_name: deliveryMember.deliveryData.teacher_name ?? "",
          teacher_email: deliveryMember.deliveryData.teacher_email ?? "",
          to_name: deliveryMember.name,
          final_note: deliveryMember.deliveryData.final_note ?? "",
          hits_itens: deliveryMember.deliveryData.hits_itens,
          improvements_itens: deliveryMember.deliveryData.improvements_itens,
          rubric_itens: deliveryMember.deliveryData.rules_selected,
          final_considerations:
            deliveryMember.deliveryData.final_considerations ?? "",
          next_itens: deliveryMember.deliveryData.next_itens,
        };

        const response = await fetch("/api/emails/project-feedback-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error(`Failed to send email to ${deliveryMember.email}`);
        }

        setEmailsSent((prev) => [...prev, deliveryMember.email]);
      }

      toast.success("Todos os e-mails foram enviados com sucesso!");
      setRefreshDeliveries();
      handleClose();
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Erro ao enviar e-mails. Tente novamente.");
    } finally {
      setIsSendingDeliveries(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSendingDeliveries ? undefined : handleClose}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            {steps === 0
              ? "1/2 - Selecione os Estudantes"
              : "2/2 - Enviar e-mails"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {steps === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Entregas Corrigidas</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllDeliveries}
                >
                  {deliveriesSelected.length === allMembers().length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allMembers().map((member, index) => (
                  <div
                    key={`${member.deliveryId}-${member.email}-${index}`}
                    className="flex items-center space-x-2 p-2 border rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={deliveriesSelected.some(
                        (d) =>
                          d.email === member.email &&
                          d.deliveryId === member.deliveryId
                      )}
                      onChange={() => handleSelectMember(member)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nota: {member.deliveryData.final_note || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {allMembers().length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma entrega corrigida encontrada.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Resumo do Envio</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {deliveriesSelected.map((delivery, index) => (
                  <div
                    key={`${delivery.deliveryId}-${delivery.email}-${index}`}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium">{delivery.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {emailsSent.includes(delivery.email) ? (
                        <span className="text-xs text-green-600">
                          ✓ Enviado
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2">
          {steps === 0 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleContinue}>Continuar</Button>
            </>
          )}

          {steps === 1 && (
            <>
              {!isSendingDeliveries && (
                <Button variant="outline" onClick={() => setSteps(0)}>
                  Voltar
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={isSendingDeliveries}>
                {isSendingDeliveries ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar e-mails
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
