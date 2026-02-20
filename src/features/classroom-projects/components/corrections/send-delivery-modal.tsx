"use client";

import { Send } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { ModalSendCorrectionFeedbackEmailModalPropsT } from "../../types/corrections/modal-send-correction-feedback-email-modal";
import { useSendDeliveryModal } from "./use-send-delivery-modal";
import { SendDeliveryStepContent } from "./send-delivery-step-content";
import { SendDeliveryModalFooter } from "./send-delivery-modal-footer";

/**
 * Multi-step modal for sending project feedback emails to selected students.
 * Delegates all state and business logic to useSendDeliveryModal.
 */
export default function SendDeliveriesFeedbackEmailModal({
    open,
    deliveries,
    corrections,
    project,
    setClose,
}: Readonly<ModalSendCorrectionFeedbackEmailModalPropsT>) {
    const {
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
    } = useSendDeliveryModal({ deliveries, corrections, project, setClose });

    return (
        <Dialog open={open} onOpenChange={isSendingDeliveries ? undefined : handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[80vh]">
                <DialogHeader className="flex flex-row items-center gap-6">
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="stroke-primary-foreground w-5 h-5" />
                        {step === 0 ? "Selecione os estudantes para o envio" : "Enviar e-mails"}
                    </DialogTitle>
                    <Badge variant="outline">Etapa: {step === 0 ? "1 de 2" : "2 de 2"}</Badge>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <SendDeliveryStepContent
                        step={step}
                        allMembers={allMembers()}
                        deliveriesSelected={deliveriesSelected}
                        deliveryStatuses={deliveryStatuses}
                        emailsSent={emailsSent}
                        onMemberSelect={handleSelectMember}
                        onSelectAll={handleSelectAllDeliveries}
                    />
                </div>

                <DialogFooter className="flex justify-between gap-2">
                    <SendDeliveryModalFooter
                        step={step}
                        isSendingDeliveries={isSendingDeliveries}
                        isSelectionEmpty={deliveriesSelected.length === 0}
                        onClose={handleClose}
                        onGoBack={handleGoBack}
                        onContinue={handleContinue}
                        onSubmit={handleSubmit}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
