"use client";

import { RotateCw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SendDeliveryModalFooterProps {
    readonly step: 0 | 1 | 2;
    readonly isSendingDeliveries: boolean;
    readonly isSelectionEmpty: boolean;
    readonly onClose: () => void;
    readonly onGoBack: () => void;
    readonly onContinue: () => void;
    readonly onSubmit: () => void;
}

/**
 * Step-conditional footer buttons for the send feedback email modal.
 *
 * - Step 0: Cancel / Continue
 * - Step 1: Back / Send emails
 * - Step 2: Send more emails / Finalize
 */
export function SendDeliveryModalFooter({
    step,
    isSendingDeliveries,
    isSelectionEmpty,
    onClose,
    onGoBack,
    onContinue,
    onSubmit,
}: Readonly<SendDeliveryModalFooterProps>) {
    if (step === 0) {
        return (
            <>
                <Button type="button" onClick={onClose} variant="outline">
                    Cancelar
                </Button>
                <Button type="button" onClick={onContinue} disabled={isSelectionEmpty}>
                    Continuar
                </Button>
            </>
        );
    }

    if (step === 1) {
        return (
            <>
                {!isSendingDeliveries && (
                    <Button variant="outline" type="button" onClick={onGoBack}>
                        Voltar
                    </Button>
                )}
                <Button
                    onClick={onSubmit}
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
        );
    }

    return (
        <>
            {!isSendingDeliveries && (
                <Button variant="outline" type="button" onClick={onGoBack}>
                    Enviar mais e-mails
                </Button>
            )}
            <Button onClick={onClose} type="button" className="cursor-pointer">
                Finalizar
            </Button>
        </>
    );
}
