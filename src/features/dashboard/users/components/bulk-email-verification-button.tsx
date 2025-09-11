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
import { sendEmailVerificationToMultipleUsers } from "@/app/actions";
import { AuthUserWithProfileT } from "@/types/auth";
import { MailCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BulkEmailVerificationButtonProps {
  selectedUsers: AuthUserWithProfileT[];
  onComplete?: () => void;
}

export default function BulkEmailVerificationButton({
  selectedUsers,
  onComplete,
}: BulkEmailVerificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmailVerification = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Nenhum usuário selecionado");
      return;
    }

    setIsLoading(true);

    try {
      const emails = selectedUsers
        .map((user) => user.profile?.email)
        .filter(Boolean) as string[];

      if (emails.length === 0) {
        toast.error("Nenhum email válido encontrado nos usuários selecionados");
        return;
      }

      const result = await sendEmailVerificationToMultipleUsers(emails);
      if (!result || !result.results) {
        throw new Error("Failed to send email verification emails");
      }

      const { successful, failed, total } = result.results;

      if (failed === 0) {
        toast.success(
          `Email de verificação enviado para ${successful} usuário(s) com sucesso!`
        );
      } else {
        toast.warning(
          `${successful} emails enviados com sucesso, ${failed} falharam de ${total} total`
        );
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
  const validEmails = selectedUsers.filter(
    (user) => user.profile?.email
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <MailCheck className="h-4 w-4" />
          Verificar Email ({selectedCount})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Email de Verificação</DialogTitle>
          <DialogDescription>
            Você está prestes a enviar emails de verificação para{" "}
            <strong>{validEmails}</strong> usuário(s) selecionado(s).
            {validEmails !== selectedCount && (
              <span className="text-yellow-600 block mt-2">
                ⚠️ {selectedCount - validEmails} usuário(s) não possuem email
                válido e serão ignorados.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Usuários que receberão o email:
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedUsers
                .filter((user) => user.profile?.email)
                .map((user, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {user.profile?.full_name} ({user.profile?.email})
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendEmailVerification}
            disabled={isLoading || validEmails === 0}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar Emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}