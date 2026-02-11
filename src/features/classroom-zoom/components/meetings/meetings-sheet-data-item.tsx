"use client";
import { LoaderCircle, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import { MEETING_TYPES } from "../../utils/meeting-utils";
import { ZoomMeeting } from "../../types/meetings";

export default function MeetingsSheetDataItem({
  meeting,
  isAddingMeeting,
  handleAddMeeting,
}: {
  meeting: ZoomMeeting;
  handleAddMeeting: (meeting_id: ZoomMeeting) => void;
  isAddingMeeting: string | null;
}) {
  return (
    <Item variant="outline" className="hover:bg-muted">
      <ItemMedia variant="icon">
        <Video />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="font-semibold">{meeting.topic}</ItemTitle>
        <ItemDescription>
          {meeting.agenda && <p>{meeting.agenda}</p>}
          {meeting.type && (
            <p>
              {MEETING_TYPES[meeting.type as keyof typeof MEETING_TYPES] ||
                "Sem tipo"}
            </p>
          )}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          onClick={() => handleAddMeeting(meeting)}
          size="sm"
          variant="default"
          disabled={isAddingMeeting !== null}
          className="cursor-pointer"
          title={
            isAddingMeeting !== null
              ? isAddingMeeting === meeting.id
                ? "Adicionando reunião a turma..."
                : "Adicionando uma reunião a turma... Por favor aguarde!"
              : "Adicionar esta reunião a turma"
          }
        >
          {isAddingMeeting === meeting.id ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
        </Button>
      </ItemActions>
    </Item>
  );
}
