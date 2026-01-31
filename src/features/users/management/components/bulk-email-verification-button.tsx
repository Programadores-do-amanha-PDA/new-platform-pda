"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { resendEmailSignupConfirmationToMultipleUsers } from "@/features/auth/shared/actions";
import { MailCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Profile } from "../../profile";

interface BulkEmailVerificationButtonProps {
    selectedUsers: Profile[];
    onComplete?: () => void;
}

export default function BulkEmailVerificationButton({ selectedUsers, onComplete }: BulkEmailVerificationButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmailVerification = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Nenhum usuário selecionado");
            return;
        }

        setIsLoading(true);

        try {
            const emails = selectedUsers.map((user) => user.email).filter(Boolean) as string[];

            if (emails.length === 0) {
                toast.error("Nenhum email válido encontrado nos usuários selecionados");
                return;
            }

            const { error, results } = await resendEmailSignupConfirmationToMultipleUsers({ emails });
            if (!results || error) {
                throw new Error("Failed to send email verification emails");
            }

            const { successful, failed, total } = results;

            if (failed.length === 0) {
                toast.success(`Email de verificação enviado para ${successful} usuário(s) com sucesso!`);
            } else {
                toast.warning(`${successful} emails enviados com sucesso, ${failed} falharam de ${total} total`);
            }

            setIsOpen(false);
            onComplete?.();
        } catch (error) {
            console.error("Error sending email verification emails:", error);
            toast.error("Erro inesperado ao enviar emails de verificação");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCount = selectedUsers.length;
    const validEmails = selectedUsers.filter((user) => user.email).length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={selectedCount === 0} className="gap-2">
                    <MailCheck className="w-4 h-4" />
                    Verificar Email ({selectedCount})
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Email de Verificação</DialogTitle>
                    <DialogDescription>
                        Você está prestes a enviar emails de verificação para <strong>{validEmails}</strong> usuário(s)
                        selecionado(s).
                        {validEmails !== selectedCount && (
                            <span className="block mt-2 text-yellow-600">
                                ⚠️ {selectedCount - validEmails} usuário(s) não possuem email válido e serão ignorados.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Usuários que receberão o email:</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedUsers
                                .filter((user) => user.email)
                                .map((user, index) => (
                                    <div key={index} className="text-muted-foreground text-sm">
                                        • {user?.full_name} ({user.email})
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSendEmailVerification} disabled={isLoading || validEmails === 0} className="gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enviar Emails
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
