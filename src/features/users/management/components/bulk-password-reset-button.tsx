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
import { sendPasswordResetToMultipleUsers } from "@/features/auth/shared/actions";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { Profile } from "../../profile/types/profile";
import { logger } from "@/lib/logger";

interface BulkPasswordResetButtonProps {
    selectedUsers: Profile[];
    onComplete?: () => void;
}

const log = logger.child({ module: "BulkPasswordResetButton" });

export default function BulkPasswordResetButton({ selectedUsers, onComplete }: BulkPasswordResetButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendPasswordReset = async () => {
        if (selectedUsers.length === 0) {
            toast.error({
                title: "Nenhum usuário selecionado",
                description: "Por favor, selecione pelo menos um usuário para enviar o email de redefinição de senha.",
            });
            return;
        }

        setIsLoading(true);

        try {
            const emails = selectedUsers.map((user) => user.email).filter(Boolean) as string[];

            if (emails.length === 0) {
                toast.error({
                    title: "Nenhum email válido encontrado",
                    description: "Nenhum email válido encontrado nos usuários selecionados",
                });
                return;
            }

            const { error, results } = await sendPasswordResetToMultipleUsers({ emails });
            if (!results || error) {
                throw new Error("Failed to send password reset emails");
            }

            const { successful, failed, total } = results;

            if (failed.length === 0) {
                toast.success({
                    title: "Email de redefinição enviado",
                    description: `Email de redefinição enviado para ${successful} usuário(s) com sucesso!`,
                });
            } else {
                toast.info({
                    title: "Erro ao enviar emails de redefinição",
                    description: `${successful} emails enviados com sucesso, ${failed} falharam de ${total} total`,
                });
            }

            setIsOpen(false);
            onComplete?.();
        } catch (error) {
            log.error({ err: error, operation: "sendPasswordResetToMultipleUsers" }, "Error sending password reset emails");
            toast.error({
                title: "Erro inesperado",
                description: "Erro inesperado ao enviar emails de redefinição",
            });
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
                    <Mail className="w-4 h-4" />
                    Redefinir Senha ({selectedCount})
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Email de Redefinição de Senha</DialogTitle>
                    <DialogDescription>
                        Você está prestes a enviar emails de redefinição de senha para <strong>{validEmails}</strong> usuário(s)
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
                                .map((user) => (
                                    <div key={user.id} className="text-muted-foreground text-sm">
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
                    <Button onClick={handleSendPasswordReset} disabled={isLoading || validEmails === 0} className="gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enviar Emails
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
