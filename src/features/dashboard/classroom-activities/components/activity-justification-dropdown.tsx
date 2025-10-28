"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader, Pen, Trash, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ClassroomActivityT } from "../types";
import { useClassroomActivityStore } from "../store";

export function ActivityJustificationDropdown({
  currentActivity,
  currentUserEmail,
}: {
  currentActivity: ClassroomActivityT;
  currentUserEmail: string;
}) {
  const [justification, setJustification] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [participationLoading, setParticipationLoading] =
    useState<boolean>(false);

  const { updateActivityById } = useClassroomActivityStore();

  const currentJustification = currentActivity.justifications?.find(
    (j) => j.user_email === currentUserEmail
  );

  const hasParticipated =
    currentActivity.participants_email?.includes(currentUserEmail);

  useEffect(() => {
    if (currentJustification) {
      setJustification(currentJustification.message || "");
    }
  }, [currentActivity, currentJustification]);

  const handleAddJustification = async () => {
    setLoading(true);
    try {
      const existingJustifications = currentActivity.justifications || [];
      const updatedJustifications = currentJustification
        ? existingJustifications.map((j) =>
            j.user_email === currentUserEmail
              ? { ...j, message: justification }
              : j
          )
        : [
            ...existingJustifications,
            {
              user_email: currentUserEmail,
              message: justification,
            },
          ];

      await updateActivityById(currentActivity.id, {
        justifications: updatedJustifications,
      });

      toast.success("Justificativa salva com sucesso!");
    } catch {
      toast.error("Erro ao salvar justificativa!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJustification = async () => {
    setDeleteLoading(true);
    try {
      await updateActivityById(currentActivity.id, {
        justifications:
          currentActivity?.justifications?.filter(
            (j) => j.user_email !== currentUserEmail
          ) || [],
      });
      setJustification("");
      toast.success("Justificativa removida com sucesso!");
    } catch {
      toast.error("Erro ao remover justificativa!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleParticipation = async () => {
    setParticipationLoading(true);
    try {
      const currentParticipants = currentActivity.participants_email || [];
      const updatedParticipants = hasParticipated
        ? currentParticipants.filter((email) => email !== currentUserEmail)
        : [...currentParticipants, currentUserEmail];

      await updateActivityById(currentActivity.id, {
        participants_email: updatedParticipants,
      });

      toast.success(
        hasParticipated
          ? "Participação removida com sucesso!"
          : "Participação adicionada com sucesso!"
      );
    } catch {
      toast.error("Erro ao atualizar participação!");
    } finally {
      setParticipationLoading(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="ml-auto">
          <Pen className="size-3 stroke-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>Gerenciar Atividade</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="w-full flex flex-col p-2 gap-3">
          {/* Participation Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Participação:</span>
            <Button
              disabled={participationLoading}
              onClick={handleToggleParticipation}
              size="sm"
              variant={hasParticipated ? "default" : "outline"}
              className="gap-2"
            >
              {participationLoading ? (
                <Loader className="size-4 animate-spin" />
              ) : hasParticipated ? (
                <UserCheck className="size-4" />
              ) : (
                <UserX className="size-4" />
              )}
              {hasParticipated ? "Participou" : "Não Participou"}
            </Button>
          </div>

          <DropdownMenuSeparator />

          {/* Justification Section */}
          <div className="w-full flex flex-col gap-2">
            <span className="text-sm font-medium">Justificativa:</span>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Adicione uma justificativa (opcional)"
              className="resize-none w-full h-20"
            />

            <div className="w-full flex flex-row gap-2 items-center justify-end">
              {currentJustification && (
                <Button
                  disabled={loading || deleteLoading}
                  onClick={handleDeleteJustification}
                  size="icon"
                  variant="destructive"
                  className="!min-w-9 cursor-pointer"
                >
                  {!deleteLoading ? (
                    <Trash className="size-4" />
                  ) : (
                    <Loader className="size-4 animate-spin" />
                  )}
                </Button>
              )}

              <Button
                disabled={
                  loading ||
                  deleteLoading ||
                  !justification.trim() ||
                  (currentJustification &&
                    currentJustification.message === justification)
                }
                onClick={handleAddJustification}
                className="px-8! cursor-pointer"
              >
                {loading && <Loader className="size-4 animate-spin" />}
                {!loading
                  ? !currentJustification
                    ? "Salvar"
                    : "Editar"
                  : "Salvando..."}
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
