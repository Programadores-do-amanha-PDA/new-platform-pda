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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UsersCredentialsValuesT } from "@/features/api/emails/user-credentials/type";
import axios from "axios";
import { useEnrollmentsManagementStore, Enrollment } from "@/features/enrollments";
import { getFirstLastInitials } from "@/utils";
import { Profile } from "../../profile/types/profile";

interface UserWithStatus extends Profile {
  status?: "success" | "error" | "skipped";
}

interface BulkUsersCredentialsButtonProps {
  selectedUsers: Profile[];
  onComplete?: () => void;
}

export default function BulkUsersCredentialsButton({
  selectedUsers,
  onComplete,
}: BulkUsersCredentialsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [stage, setStage] = useState<0 | 1>(0);
  const { enrollmentsByUserId } = useEnrollmentsManagementStore();

  const handleSend = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Nenhum usuário selecionado");
      return;
    }

    const subject = "[Plataforma] Credenciais";
    setIsLoading(true);
    setStage(1);

    // Initialize users with status
    const usersWithStatus: UserWithStatus[] = selectedUsers.map((user) => ({
      ...user,
    }));
    setUsers(usersWithStatus);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < usersWithStatus.length; i++) {
      const user = usersWithStatus[i];
      if (!user.email) continue;

      try {
        // Skip if user has no classroom short_ids
        const userEnrollments: Enrollment[] = enrollmentsByUserId[user.id] || [];
        const shortIds = userEnrollments.map((e: Enrollment) => e.short_id);
        if (shortIds.length === 0) {
          setUsers((prev) =>
            prev.map((u, index) =>
              index === i ? { ...u, status: "skipped" } : u
            )
          );
          skippedCount++;
          continue;
        }

        const data = {
          email: user.email,
          subject,
          values: {
            to_name: user.full_name.split(" ")[0] || "Usuário",
            to_email: user.email,
            short_ids: shortIds,
          } as UsersCredentialsValuesT,
        };

        const result = await axios.post("/api/emails/user-credentials", data);

        if (result.status === 200 && result.data.status) {
          setUsers((prev) =>
            prev.map((u, index) =>
              index === i ? { ...u, status: "success" } : u
            )
          );
          successCount++;
        } else {
          throw new Error("Failed to send email");
        }
      } catch (error) {
        console.error("Error sending email to user:", user.email, error);
        setUsers((prev) =>
          prev.map((u, index) => (index === i ? { ...u, status: "error" } : u))
        );
        errorCount++;
      }
    }

    setIsLoading(false);

    // Show summary notification
    if (successCount > 0) {
      toast.success(`${successCount} email(s) enviado(s) com sucesso!`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} email(s) falharam ao enviar.`);
    }
    if (skippedCount > 0) {
      toast.warning(`${skippedCount} usuário(s) pulado(s) (sem turmas).`);
    }

    onComplete?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUsers([]);
      setStage(0);
      setIsLoading(false);
    }
    setIsOpen(open);
  };

  const selectedCount = selectedUsers.length;
  const validEmails = selectedUsers.filter(
    (user) => user.email
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Enviar Credenciais ({selectedCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-max max-w-[85vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Enviar Credenciais por Email</DialogTitle>
          <DialogDescription>
            {stage === 0 && (
              <>
                Você está prestes a enviar emails com credenciais para{" "}
                <strong>{validEmails}</strong> usuário(s) selecionado(s).
                {validEmails !== selectedCount && (
                  <span className="block mt-2 text-yellow-600">
                    ⚠️ {selectedCount - validEmails} usuário(s) não possuem
                    email válido e serão ignorados.
                  </span>
                )}
              </>
            )}
            {stage === 1 && "Resultados do envio de credenciais"}
          </DialogDescription>
        </DialogHeader>

        {stage === 0 ? (
          <div className="py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">
                Usuários que receberão o email:
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedUsers
                  .filter((user) => user.email)
                  .map((user, index) => (
                    <div key={index} className="text-muted-foreground text-sm">
                      • {user.full_name} ({user.email})
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex my-4 border rounded-lg w-full max-h-96 overflow-y-auto">
            <Table className="w-full h-full">
              <TableHeader className="top-0 z-10 sticky bg-background shadow-sm">
                <TableRow>
                  <TableHead className="font-semibold">Perfil</TableHead>
                  <TableHead className="font-semibold">
                    Turmas (Short IDs)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      user.status === "success" && "bg-green-100",
                      user.status === "error" && "bg-red-100",
                      user.status === "skipped" && "bg-yellow-100"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={user.avatar_url || ""}
                            alt={user.full_name}
                          />
                          <AvatarFallback>
                            {getFirstLastInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.full_name || "Nome não informado"}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {enrollmentsByUserId[user.id]?.length > 0 ? (
                          enrollmentsByUserId[user.id].map((enrollment: Enrollment, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {enrollment.short_id}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Nenhuma turma
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          {stage === 0 ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || validEmails === 0}
                className="gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar Emails
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)} className="gap-2">
              Finalizar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
