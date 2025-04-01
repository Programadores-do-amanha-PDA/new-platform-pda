"use client";
import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ZoomMeetingType } from "@/types/zoom/meettings";

const MeetingsSheetData = ({ classroom_id }: { classroom_id: string }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [meetingsSearch, setMeetingsSearch] = useState<string>("");

  const {
    classroomsStack: {
      zoom: {
        meetings,
        handleCreateZoomMeeting,
        api: { meetingsByAPI, handleGetAllZoomMeetingsByAPI },
      },
    },
  } = useAdminStackContext();

  const handleOpen = async (open: boolean) => {
    setOpenModal(open);
    if (open === true && meetingsByAPI.length === 0) {
      setLoading(true);
      await handleGetAllZoomMeetingsByAPI();
      setLoading(false);
    }
  };

  const filteredMeetings = meetingsByAPI.filter((meeting) => {
    if (meetingsSearch) {
      if (!meetings?.length) {
        return meeting.topic
          .toLowerCase()
          .includes(meetingsSearch.toLowerCase());
      } else if (meetings.length) {
        return (
          !meetings.map((att) => att.id).includes(meeting.id) &&
          meeting.topic.toLowerCase().includes(meetingsSearch.toLowerCase())
        );
      }
    } else {
      if (!meetings?.length) {
        return meeting;
      } else if (meetings) {
        return !meetings.map((att) => att.id).includes(meeting.id);
      }
    }
  });

  return (
    <Sheet onOpenChange={handleOpen} open={openModal}>
      <SheetTrigger asChild>
        <Button className="!px-4 w-max items-start justify-start font-semibold">
          Adicionar Reunião
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Adicionar Reunião do Zoom</SheetTitle>
          <SheetDescription>
            Adicione abaixo as reuniões do Zoom que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="h-full flex flex-col gap-4 xl:gap-6 py-2">
          <div>
            <Input
              placeholder="Procurando por algo?"
              onChange={(e) => setMeetingsSearch(e.target.value)}
              value={meetingsSearch}
            />
          </div>
          {!loading ? (
            <ul className="p-2 h-full flex flex-col gap-4 xl:gap-6 py-2 overflow-y-auto">
              {filteredMeetings.map((meeting: ZoomMeetingType) => (
                <li key={meeting.id} className="p-2 border rounded-lg">
                  <div className="flex items-center gap-4 justify-between">
                    <div className="flex flex-col gap-1 truncate">
                      <h2
                        className="font-semibold text-sm truncate"
                        title={meeting.topic}
                      >
                        {meeting.topic}
                      </h2>
                      <p className="text-xs text-gray-500 truncate">
                        {meeting.agenda || "Sem descrição"}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        handleCreateZoomMeeting({
                          ...meeting,
                          classroom_id: classroom_id,
                        })
                      }
                      className="font-semibold min-w-9 min-h-9"
                      size={"icon"}
                    >
                      <Plus />
                    </Button>
                  </div>
                </li>
              ))}
              {meetingsByAPI.filter(
                (m) =>
                  !(meetings && meetings.map((att) => att.id).includes(m.id))
              ).length === 0 && (
                <div className="flex flex-col gap-2 h-full items-center justify-center">
                  <h2 className="text-sm font-bold text-gray-800">
                    Não há reuniões disponíveis
                  </h2>
                  <i className="text-xs text-muted-foreground px-2 text-center">
                    (Reuniões que já estão associadas a esta turma não aparecem
                    aqui.)
                  </i>
                </div>
              )}
              {filteredMeetings.filter(
                (m) =>
                  !(meetings && meetings.map((att) => att.id).includes(m.id))
              ).length === 0 &&
                meetingsSearch && (
                  <div className="flex flex-col gap-2 h-full items-center justify-center">
                    <h2 className="text-sm font-bold text-gray-800">
                      Não há reuniões com esse título
                    </h2>
                    <i className="text-xs text-muted-foreground px-2 text-center">
                      (Reuniões que já estão associadas a esta turma não
                      aparecem aqui.)
                    </i>
                  </div>
                )}
            </ul>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <LoaderCircle className="size-6 stroke-primary animate-spin" />
            </div>
          )}
        </main>
        <SheetFooter>
          <SheetClose asChild>
            <Button className="font-semibold">Finalizar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MeetingsSheetData;
