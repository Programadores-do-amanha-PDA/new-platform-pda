import { useReducer } from "react";
import { toast } from "@/lib/toast";
import axios from "axios";

import { useUsersStore } from "@/features/users/management";
import { useClassroomProjectCorrectionsStore } from "../../stores/corrections";
import { useClassroomSettingStore } from "@/features/classrooms/settings";

import { ProjectFeedbackInput } from "@/features/api/emails/project-feedback-email/utils/validations";
import { PROJECTS_RULES_FEEDBACKS, projectTypesLabels } from "../../utils/projects";
import { ClassroomProjectCorrection } from "../../types/corrections/corrections";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";
import { DeliveryMemberT } from "../../types/deliveries/delivery-members-data-table";
import { ModalSendCorrectionFeedbackEmailModalPropsT } from "../../types/corrections/modal-send-correction-feedback-email-modal";

type DeliveryStatus = "pending" | "sending" | "sent" | "error";

interface ModalState {
    readonly step: 0 | 1 | 2;
    readonly deliveriesSelected: DeliveryMemberT[];
    readonly emailsSent: string[];
    readonly isSendingDeliveries: boolean;
    readonly deliveryStatuses: Record<string, DeliveryStatus>;
}

type ModalAction =
    | { type: "GO_TO_STEP"; payload: 0 | 1 | 2 }
    | { type: "SET_DELIVERIES_SELECTED"; payload: DeliveryMemberT[] }
    | { type: "ADD_EMAIL_SENT"; payload: string }
    | { type: "SET_SENDING"; payload: boolean }
    | { type: "INIT_STATUSES"; payload: Record<string, DeliveryStatus> }
    | { type: "UPDATE_STATUS"; payload: { key: string; status: DeliveryStatus } }
    | { type: "RESET" };

const initialState: ModalState = {
    step: 0,
    deliveriesSelected: [],
    emailsSent: [],
    isSendingDeliveries: false,
    deliveryStatuses: {},
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
    switch (action.type) {
        case "GO_TO_STEP":
            return { ...state, step: action.payload };
        case "SET_DELIVERIES_SELECTED":
            return { ...state, deliveriesSelected: action.payload };
        case "ADD_EMAIL_SENT":
            return { ...state, emailsSent: [...state.emailsSent, action.payload] };
        case "SET_SENDING":
            return { ...state, isSendingDeliveries: action.payload };
        case "INIT_STATUSES":
            return { ...state, deliveryStatuses: action.payload };
        case "UPDATE_STATUS":
            return {
                ...state,
                deliveryStatuses: { ...state.deliveryStatuses, [action.payload.key]: action.payload.status },
            };
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

type UseSendDeliveryModalProps = Omit<ModalSendCorrectionFeedbackEmailModalPropsT, "open">;

/**
 * Manages the multi-step email sending flow for delivery feedback.
 * Encapsulates all state transitions and async email sending logic.
 *
 * @param deliveries - All deliveries for the project.
 * @param corrections - All corrections to derive feedback data from.
 * @param project - The project context.
 * @param setClose - Callback to close the parent modal.
 */
export const useSendDeliveryModal = ({ deliveries, corrections, project, setClose }: UseSendDeliveryModalProps) => {
    const [state, dispatch] = useReducer(modalReducer, initialState);
    const { step, deliveriesSelected, emailsSent, isSendingDeliveries, deliveryStatuses } = state;

    const { users } = useUsersStore();
    const { updateCorrection } = useClassroomProjectCorrectionsStore();
    const { settingsByClassroom } = useClassroomSettingStore();
    const classroomModules = settingsByClassroom[project.classroom_id].modules || [];

    const getDeliveryCorrection = (deliveryId: string): ClassroomProjectCorrection | undefined =>
        corrections.find((correction) => correction.delivery_id === deliveryId);

    const buildDeliveryData = (delivery: ClassroomProjectDelivery) => {
        const correction = getDeliveryCorrection(delivery.id);
        const correctionTeacherUser = users.find(
            (user) => user.id === correction?.teacher_id || user.email === correction?.teacher_email,
        );

        return {
            id: delivery.id,
            final_note: correction?.final_note,
            final_considerations: correction?.final_considerations,
            teacher_name: correctionTeacherUser?.full_name || "Professor(a)",
            teacher_email: correctionTeacherUser?.email || correction?.teacher_email,
            rules_selected:
                correction?.rules_selected?.map((r) => {
                    const feedbackMessage = PROJECTS_RULES_FEEDBACKS[project.rule_id]?.[r.ruleL]?.[r.rule];
                    return { label: r.ruleL, text: feedbackMessage };
                }) || [],
            hits_itens:
                correction?.hits_itens && correction.hits_itens.length > 0
                    ? correction.hits_itens.map((hit: string) => ({ emoji: "🥇", text: hit }))
                    : [],
            improvements_itens:
                correction?.improvements_itens && correction.improvements_itens.length > 0
                    ? correction.improvements_itens.map((improvement: string) => ({ emoji: "🗡️", text: improvement }))
                    : [],
            next_itens:
                correction?.next_itens && correction.next_itens.length > 0
                    ? correction.next_itens.map((next: string) => ({ emoji: "👨‍🚀", text: next }))
                    : [],
        };
    };

    const getCorrectedDeliveries = () =>
        deliveries.filter((delivery) => {
            const correction = getDeliveryCorrection(delivery.id);
            return correction && correction.final_note;
        });

    const allMembers = (): DeliveryMemberT[] =>
        getCorrectedDeliveries().flatMap((delivery: ClassroomProjectDelivery) => {
            if (project.project_type === "mini_project") {
                const authorUser = users.find((user) => user.id === delivery.user_id);
                return {
                    deliveryId: delivery.id,
                    avatar_url: authorUser?.avatar_url || undefined,
                    email: authorUser?.email || "",
                    name: authorUser?.full_name || authorUser?.email?.split("@")[0] || "",
                    deliveryData: buildDeliveryData(delivery),
                };
            }

            if (project.project_type === "end_module_english_project" || project.project_type === "end_module_project") {
                const memberEmailsOrIds =
                    delivery.members_id && delivery.members_id.length > 0 && delivery.user_id.length > 0
                        ? [delivery.user_id, ...delivery.members_id]
                        : delivery.members || [];

                return memberEmailsOrIds.map((memberEmailOrId: string) => {
                    const userData = users.find((user) => user.email === memberEmailOrId || user.id === memberEmailOrId);
                    return {
                        email: userData?.email || memberEmailOrId || "",
                        name: userData?.full_name || memberEmailOrId.split("@")[0],
                        avatar_url: userData?.avatar_url || undefined,
                        deliveryId: delivery.id,
                        deliveryData: buildDeliveryData(delivery),
                    };
                });
            }

            return [];
        });

    const handleSelectMember = (deliveryMember: DeliveryMemberT) => {
        const isSelected = deliveriesSelected.some(
            (d) => d.email === deliveryMember.email && d.deliveryId === deliveryMember.deliveryId,
        );
        const updated = isSelected
            ? deliveriesSelected.filter(
                  (d) => !(d.email === deliveryMember.email && d.deliveryId === deliveryMember.deliveryId),
              )
            : [...deliveriesSelected, deliveryMember];
        dispatch({ type: "SET_DELIVERIES_SELECTED", payload: updated });
    };

    const handleSelectAllDeliveries = () => {
        const members = allMembers();
        dispatch({
            type: "SET_DELIVERIES_SELECTED",
            payload: deliveriesSelected.length === members.length ? [] : members,
        });
    };

    const handleClose = () => {
        dispatch({ type: "RESET" });
        setClose();
    };

    // Resets all state back to step 0 without closing the modal
    const handleGoBack = () => {
        dispatch({ type: "RESET" });
    };

    const handleContinue = () => {
        if (deliveriesSelected.length === 0) {
            toast.error({
                title: "Erro!",
                description: "Selecione pelo menos um estudante!",
            });
            return;
        }
        dispatch({ type: "GO_TO_STEP", payload: 1 });
    };

    const handleSubmit = async () => {
        if (deliveriesSelected.length === 0) {
            toast.error({
                title: "Erro!",
                description: "Selecione pelo menos um estudante!",
            });
            return;
        }

        dispatch({ type: "SET_SENDING", payload: true });

        const initialStatuses = deliveriesSelected.reduce(
            (acc, member) => {
                acc[`${member.deliveryId}-${member.email}`] = "pending";
                return acc;
            },
            {} as Record<string, DeliveryStatus>,
        );
        dispatch({ type: "INIT_STATUSES", payload: initialStatuses });

        const successfulDeliveries: string[] = [];
        let hasErrors = false;

        toast.info({
            title: "Enviando e-mails de feedback...",
        });

        for (const deliveryMember of deliveriesSelected) {
            const deliveryKey = `${deliveryMember.deliveryId}-${deliveryMember.email}`;

            try {
                dispatch({ type: "UPDATE_STATUS", payload: { key: deliveryKey, status: "sending" } });

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
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.data.status) {
                    throw new Error(`Failed to send email to ${deliveryMember.email}`);
                }

                dispatch({ type: "UPDATE_STATUS", payload: { key: deliveryKey, status: "sent" } });
                dispatch({ type: "ADD_EMAIL_SENT", payload: deliveryMember.email });
                successfulDeliveries.push(deliveryMember.deliveryId);

                // Small delay between emails to avoid overwhelming the service
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (emailError) {
                console.error(`Error sending email to ${deliveryMember.email}:`, emailError);
                hasErrors = true;
                dispatch({ type: "UPDATE_STATUS", payload: { key: deliveryKey, status: "error" } });
            }
        }

        // Update corrections for successful deliveries
        try {
            if (successfulDeliveries.length > 0) {
                const uniqueDeliveryIds = Array.from(new Set(successfulDeliveries));
                for (const deliveryId of uniqueDeliveryIds) {
                    const correction = getDeliveryCorrection(deliveryId);
                    if (correction) {
                        try {
                            await updateCorrection(correction.id, { has_feedback_sent: true }, project.classroom_id);
                        } catch (updateError) {
                            console.error(`Error updating correction ${correction.id}:`, updateError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error updating corrections:", error);
        }

        if (hasErrors && successfulDeliveries.length > 0) {
            toast.info({
                title: "Aviso!",
                description: `${successfulDeliveries.length} e-mails enviados com sucesso. Alguns falharam - verifique os detalhes.`,
            });
        } else if (hasErrors && successfulDeliveries.length === 0) {
            toast.error({
                title: "Erro!",
                description: "Nenhum e-mail pôde ser enviado. Verifique os detalhes e tente novamente.",
            });
        } else {
            toast.success({
                title: "Sucesso!",
                description: "Todos os e-mails foram enviados com sucesso!",
            });
        }

        dispatch({ type: "SET_SENDING", payload: false });
        dispatch({ type: "GO_TO_STEP", payload: 2 });
    };

    return {
        step,
        deliveriesSelected,
        emailsSent,
        isSendingDeliveries,
        deliveryStatuses,
        allMembers,
        handleSelectMember,
        handleSelectAllDeliveries,
        handleClose,
        handleGoBack,
        handleContinue,
        handleSubmit,
    } as const;
};
