"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { RotateCw, Send } from "lucide-react";

// Global imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsersStore } from "@/features/users/management";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClassroomProjectCorrectionsStore } from "../../stores/corrections";

// Local imports
import { ProjectFeedbackInput } from "@/features/api/emails/project-feedback-email/utils/validations";
import { DeliveryMembersDataTable } from "./delivery-members-data-table";
import { useClassroomSettingStore } from "@/features/classrooms/settings";

import { PROJECTS_RULES_FEEDBACKS, projectTypesLabels } from "../../utils/projects";
import { ClassroomProjectCorrection } from "../../types/corrections/corrections";
import { ModalSendCorrectionFeedbackEmailModalPropsT } from "../../types/corrections/modal-send-correction-feedback-email-modal";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";
import { DeliveryMemberT } from "../../types/deliveries/delivery-members-data-table";

export default function SendDeliveriesFeedbackEmailModal({
    open,
    deliveries,
    corrections,
    project,
    setClose,
}: ModalSendCorrectionFeedbackEmailModalPropsT) {
    const [steps, setSteps] = useState(0);
    const [deliveriesSelected, setDeliveriesSelected] = useState<DeliveryMemberT[]>([]);
    const [emailsSent, setEmailsSent] = useState<string[]>([]);
    const [isSendingDeliveries, setIsSendingDeliveries] = useState(false);
    const [deliveryStatuses, setDeliveryStatuses] = useState<Record<string, "pending" | "sending" | "sent" | "error">>({});

    const { users } = useUsersStore();
    const { updateCorrection } = useClassroomProjectCorrectionsStore();
    const { settingsByClassroom } = useClassroomSettingStore();
    const classroomModules = settingsByClassroom[project.classroom_id].modules || [];

    const getDeliveryCorrection = (deliveryId: string): ClassroomProjectCorrection | undefined => {
        return corrections.find((correction) => correction.delivery_id === deliveryId);
    };

    const deliveryData = (delivery: ClassroomProjectDelivery) => {
        const correction = getDeliveryCorrection(delivery.id);
        const correctionTeacherUser = users.find(
            (user) => user.id === correction?.teacher_id || user.email === correction?.teacher_email,
        );
        const correctionTeacher = correctionTeacherUser;

        return {
            id: delivery.id,
            final_note: correction?.final_note,
            final_considerations: correction?.final_considerations,
            teacher_name: correctionTeacher?.full_name || "Professor(a)",
            teacher_email: correctionTeacherUser?.email || correction?.teacher_email,
            rules_selected:
                correction?.rules_selected?.map((r) => {
                    const feedbackMessage = PROJECTS_RULES_FEEDBACKS[project.rule_id]?.[r.ruleL]?.[r.rule];
                    return {
                        label: r.ruleL,
                        text: feedbackMessage,
                    };
                }) || [],
            hits_itens:
                correction?.hits_itens && correction.hits_itens.length > 0
                    ? correction.hits_itens.map((hit: string) => ({
                          emoji: "🥇",
                          text: hit,
                      }))
                    : [],
            improvements_itens:
                correction?.improvements_itens && correction.improvements_itens.length > 0
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
            (d) => d.email === deliveryMember.email && d.deliveryId === deliveryMember.deliveryId,
        );

        if (!isSelected) {
            setDeliveriesSelected((deliveries) => [...deliveries, deliveryMember]);
        } else {
            setDeliveriesSelected(
                deliveriesSelected.filter(
                    (delivery) =>
                        !(delivery.email === deliveryMember.email && delivery.deliveryId === deliveryMember.deliveryId),
                ),
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
        getCorrectedDeliveries().flatMap((delivery: ClassroomProjectDelivery) => {
            // Use members_id (new structure) if available, otherwise fallback to members (old structure)

            if (project.project_type === "mini_project") {
                const authorUser = users.find((user) => user.id === delivery.user_id);
                const author = authorUser;

                return {
                    deliveryId: delivery.id,
                    avatar_url: author?.avatar_url || undefined,
                    email: authorUser?.email || "",
                    name: author?.full_name || authorUser?.email?.split("@")[0] || "",
                    deliveryData: deliveryData(delivery),
                };
            } else if (project.project_type === "end_module_english_project" || project.project_type === "end_module_project") {
                const memberEmailsOrIds =
                    delivery.members_id && delivery.members_id.length > 0 && delivery.user_id.length > 0
                        ? [delivery.user_id, ...delivery.members_id]
                        : delivery.members || [];

                return memberEmailsOrIds.map((memberEmailOrId: string) => {
                    // Find user data by email
                    const userData = users.find((user) => user.email === memberEmailOrId || user.id === memberEmailOrId);

                    return {
                        email: userData?.email || memberEmailOrId || "",
                        name: userData?.full_name || memberEmailOrId.split("@")[0],
                        avatar_url: userData?.avatar_url || undefined,
                        deliveryId: delivery.id,
                        deliveryData: deliveryData(delivery),
                    };
                });
            }

            return [];
        });

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
        setDeliveryStatuses({});
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

        // Initialize all delivery statuses as pending
        const initialStatuses = deliveriesSelected.reduce(
            (acc, member) => {
                acc[`${member.deliveryId}-${member.email}`] = "pending";
                return acc;
            },
            {} as Record<string, "pending" | "sending" | "sent" | "error">,
        );
        setDeliveryStatuses(initialStatuses);

        const successfulDeliveries: string[] = [];
        let hasErrors = false;

        toast.info("Enviando e-mails de feedback...");

        // Process each email individually - errors won't stop the loop
        for (const deliveryMember of deliveriesSelected) {
            const deliveryKey = `${deliveryMember.deliveryId}-${deliveryMember.email}`;

            try {
                // Update status to sending
                setDeliveryStatuses((prev) => ({
                    ...prev,
                    [deliveryKey]: "sending",
                }));

                const emailData: ProjectFeedbackInput = {
                    email: deliveryMember.email,
                    subject: "Seu feedback chegou!",
                    values: {
                        project_type: projectTypesLabels[project.project_type]?.label || project.project_type,
                        project_module:
                            classroomModules.find((module) => module.id === project.module)?.title || `M${project.module}`,
                        teacher_name: deliveryMember.deliveryData.teacher_name ?? "",
                        teacher_email: deliveryMember.deliveryData.teacher_email ?? "",
                        to_name: deliveryMember.name.split(" ")[0],
                        final_note: deliveryMember.deliveryData.final_note ?? "",
                        hits_itens: deliveryMember.deliveryData.hits_itens,
                        improvements_itens: deliveryMember.deliveryData.improvements_itens,
                        rubric_itens: deliveryMember.deliveryData.rules_selected,
                        final_considerations: deliveryMember.deliveryData.final_considerations ?? "",
                        next_itens: deliveryMember.deliveryData.next_itens,
                    },
                };

                const response = await axios.post("/api/emails/project-feedback-email", emailData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.data.status) {
                    throw new Error(`Failed to send email to ${deliveryMember.email}`);
                }

                // Update status to sent
                setDeliveryStatuses((prev) => ({
                    ...prev,
                    [deliveryKey]: "sent",
                }));

                setEmailsSent((prev) => [...prev, deliveryMember.email]);
                successfulDeliveries.push(deliveryMember.deliveryId);

                // Small delay between emails to avoid overwhelming the service
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (emailError) {
                console.error(`Error sending email to ${deliveryMember.email}:`, emailError);
                hasErrors = true;

                // Update status to error
                setDeliveryStatuses((prev) => ({
                    ...prev,
                    [deliveryKey]: "error",
                }));
            }
        }

        // Update corrections for successful deliveries
        try {
            if (successfulDeliveries.length > 0) {
                const uniqueDeliveryIds = Array.from(new Set(successfulDeliveries));

                for (const deliveryId of Array.from(uniqueDeliveryIds)) {
                    const correction = getDeliveryCorrection(deliveryId);
                    if (correction) {
                        try {
                            await updateCorrection(correction.id, { has_feedback_sent: true }, project.classroom_id);
                        } catch (updateError) {
                            console.error(`Error updating correction ${correction.id}:`, updateError);
                            // Don't stop the process if correction update fails
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error updating corrections:", error);
            // Don't stop the process if correction updates fail
        }

        // Show final results
        if (hasErrors && successfulDeliveries.length > 0) {
            toast.warning(
                `${successfulDeliveries.length} e-mails enviados com sucesso. Alguns falharam - verifique os detalhes.`,
            );
        } else if (hasErrors && successfulDeliveries.length === 0) {
            toast.error("Nenhum e-mail pôde ser enviado. Verifique os detalhes e tente novamente.");
        } else {
            toast.success("Todos os e-mails foram enviados com sucesso!");
        }

        setIsSendingDeliveries(false);
        setSteps(2);
    };

    return (
        <Dialog open={open} onOpenChange={isSendingDeliveries ? undefined : handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh]">
                <DialogHeader className="flex flex-row items-center gap-6">
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="stroke-primary-foreground w-5 h-5" />
                        {steps === 0 ? "Selecione os estudantes para o envio" : "Enviar e-mails"}
                    </DialogTitle>
                    <Badge variant="outline">Etapa: {steps === 0 ? "1 de 2" : "2 de 2"}</Badge>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {steps === 0 ? (
                        <div className="space-y-4">
                            <DeliveryMembersDataTable
                                members={allMembers().map((member) => ({
                                    ...member,
                                    status: deliveryStatuses[`${member.deliveryId}-${member.email}`] || "pending",
                                }))}
                                selectedMembers={deliveriesSelected}
                                onMemberSelect={handleSelectMember}
                                onSelectAll={handleSelectAllDeliveries}
                                emailsSent={emailsSent}
                                showStatus={false}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm">Resumo do Envio</h3>
                            <DeliveryMembersDataTable
                                members={deliveriesSelected.map((member) => ({
                                    ...member,
                                    status: deliveryStatuses[`${member.deliveryId}-${member.email}`] || "pending",
                                }))}
                                selectedMembers={deliveriesSelected}
                                onMemberSelect={() => {}} // Disabled in summary view
                                onSelectAll={() => {}} // Disabled in summary view
                                emailsSent={emailsSent}
                                showStatus={true}
                                disableSelection={true}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between gap-2">
                    {steps === 0 && (
                        <>
                            <Button type="button" onClick={handleClose} variant="outline">
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleContinue} disabled={deliveriesSelected.length === 0}>
                                Continuar
                            </Button>
                        </>
                    )}

                    {steps === 1 && (
                        <>
                            {!isSendingDeliveries && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setSteps(0);
                                        setDeliveriesSelected([]);
                                        setDeliveryStatuses({});
                                        setEmailsSent([]);
                                        setIsSendingDeliveries(false);
                                    }}
                                >
                                    Voltar
                                </Button>
                            )}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSendingDeliveries}
                                type="button"
                                className={cn("cursor-pointer", isSendingDeliveries && "animate-pulse")}
                            >
                                {isSendingDeliveries ? (
                                    <>
                                        <RotateCw className="mr-2 w-4 h-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 w-4 h-4" />
                                        Enviar e-mails
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                    {steps === 2 && (
                        <>
                            {!isSendingDeliveries && (
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setSteps(0);
                                        setDeliveriesSelected([]);
                                        setDeliveryStatuses({});
                                        setEmailsSent([]);
                                        setIsSendingDeliveries(false);
                                    }}
                                >
                                    Enviar mais e-mails
                                </Button>
                            )}
                            <Button onClick={handleClose} type="button" className={"cursor-pointer"}>
                                Finalizar
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
