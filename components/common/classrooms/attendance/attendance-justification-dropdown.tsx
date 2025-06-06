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
import { useAdminStackContext } from "@/context/admin/stack-context";
import {
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { Loader, Pen, Trash } from "lucide-react";
import { useEffect, useState } from "react";

export function AttendanceJustificationDropdown({
  currentMeeting,
  currentUserEmail,
  type,
}: {
  currentMeeting: ZoomMeetingPastInstancesType | ZoomMeetingType;
  currentUserEmail: string;
  type: "meeting" | "pastInstance";
}) {
  const [justification, setJustification] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const {
    classroomsStack: {
      zoom: {
        meetings: {
          handleUpdateZoomMeeting,
          pastInstances: { handleUpdateZoomPastInstance },
        },
      },
    },
  } = useAdminStackContext();

  const currentJustification = currentMeeting.justifications?.find(
    (j) => j.user_email === currentUserEmail
  );

  useEffect(() => {
    if (currentJustification) {
      setJustification(currentJustification.message || "");
    }
  }, [currentMeeting]);

  const handleAddJustification = async () => {
    setLoading(true);
    if (currentMeeting.id && type === "meeting") {
      await handleUpdateZoomMeeting(currentMeeting.id, {
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
      await handleUpdateZoomPastInstance(currentMeeting.id, {
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
      await handleUpdateZoomMeeting(currentMeeting.id, {
        justifications:
          currentMeeting?.justifications?.filter(
            (j) => j.user_email !== currentUserEmail
          ) || [],
      });
      setDeleteLoading(false);
      return;
    } else if (currentMeeting.id && type === "pastInstance") {
      await handleUpdateZoomPastInstance(currentMeeting.id, {
        justifications:
          currentMeeting?.justifications?.filter(
            (j) => j.user_email !== currentUserEmail
          ) || [],
      });
      setDeleteLoading(false);
      return;
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {}}
          className="ml-auto"
        >
          <Pen className="size-3 stroke-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Justificar Falta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="w-full max-w-72 max-h-56 flex flex-col p-2 gap-2">
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Qual a justificativa?"
            className="resize-none w-full h-full"
          />
          <div className="w-full flex flex-row gap-2 items-center justify-center">
            {currentJustification && (
              <Button
                disabled={loading || deleteLoading}
                onClick={handleDeleteJustification}
                size="icon"
                variant="destructive"
                className="!min-w-9"
              >
                {!deleteLoading ? (
                  <Trash className="size-3 " />
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
              className="w-full"
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
