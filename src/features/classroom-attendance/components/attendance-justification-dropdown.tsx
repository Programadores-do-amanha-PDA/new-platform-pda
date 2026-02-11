"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useZoomMeetingStore } from "@/features/classroom-zoom/stores/meetings";
import { useZoomMeetingPastInstanceStore } from "@/features/classroom-zoom/stores/past-instances";
import { ZoomMeeting } from "@/features/classroom-zoom/types/meetings";
import { ZoomMeetingPastInstance } from "@/features/classroom-zoom/types/past-instances";
import { Loader, Pen, Trash } from "lucide-react";
import { useState } from "react";


export function AttendanceJustificationDropdown({
  currentMeeting,
  currentUserEmail,
  type,
}: {
  currentMeeting: ZoomMeeting | ZoomMeetingPastInstance;
  currentUserEmail: string;
  type: "meeting" | "pastInstance";
}) {
  const { updateMeeting } = useZoomMeetingStore();
  const { updatePastInstanceById } = useZoomMeetingPastInstanceStore();

  const currentJustification = currentMeeting.justifications?.find(
    (j) => j.user_email === currentUserEmail
  );

  const [justification, setJustification] = useState<string>(
    currentJustification?.message || ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const handleAddJustification = async () => {
    setLoading(true);
    if (currentMeeting.id && type === "meeting") {
      await updateMeeting(currentMeeting.id, {
        justifications: [
          {
            user_email: currentUserEmail,
            message: justification,
          },
        ],
      });
      setLoading(false);
      return;
    } else if (currentMeeting.id && type === "pastInstance") {
      await updatePastInstanceById(currentMeeting.id, {
        justifications: [
          ...(currentMeeting.justifications || []),
          {
            user_email: currentUserEmail,
            message: justification,
          },
        ],
      });
      setLoading(false);
      return;
    }
  };

  const handleDeleteJustification = async () => {
    setDeleteLoading(true);
    if (currentMeeting.id && type === "meeting") {
      await updateMeeting(currentMeeting.id, {
        justifications:
          currentMeeting?.justifications?.filter(
            (j) => j.user_email !== currentUserEmail
          ) || [],
      });
      setDeleteLoading(false);
      return;
    } else if (currentMeeting.id && type === "pastInstance") {
      await updatePastInstanceById(currentMeeting.id, {
        justifications:
          currentMeeting?.justifications?.filter(
            (j) => j.user_email !== currentUserEmail
          ) || [],
      });
      setDeleteLoading(false);
      return;
    }
    setJustification("");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {}}
          className="ml-auto"
        >
          <Pen className="stroke-muted-foreground size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Justificar Falta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 p-2 w-full max-w-72 max-h-56">
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Qual a justificativa?"
            className="w-full h-full resize-none"
          />
          <div className="flex flex-row justify-between items-center gap-2 w-full">
            {currentJustification && (
              <Button
                disabled={loading || deleteLoading}
                onClick={handleDeleteJustification}
                size="icon"
                variant="destructive"
                className="!min-w-9"
              >
                {!deleteLoading ? (
                  <Trash className="size-3" />
                ) : (
                  <Loader className="size-5 animate-spin" />
                )}
              </Button>
            )}

            <Button
              disabled={
                loading ||
                deleteLoading ||
                (currentJustification &&
                  currentJustification.message === justification)
              }
              onClick={handleAddJustification}
              className="ml-auto w-1/2"
            >
              {loading && <Loader className="size-5 animate-spin" />}
              {!loading
                ? !currentJustification
                  ? "Salvar"
                  : "Editar"
                : "Salvando..."}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
