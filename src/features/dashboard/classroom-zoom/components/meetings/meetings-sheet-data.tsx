"use client";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useZoomAPIStore } from "@/stores/modules/classrooms/zoom/api";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import MeetingsSheetDataItem from "./meetings-sheet-data-item";
import { ZoomMeetingT } from "@/types/zoom";

export default function MeetingsSheetData() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [meetingsSearch, setMeetingsSearch] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string | "all">("all");
  const [isAddingMeeting, setIsAddingMeeting] = useState<string | null>(null);

  const { accounts } = useZoomAccountStore();
  const { meetings, createMeeting } = useZoomMeetingStore();
  const { meetingsByAPI, getAllMeetingsByAPI } = useZoomAPIStore();

  const handleOpen = async (open: boolean) => {
    if (open === true && meetingsByAPI.length === 0) {
      setLoading(true);
      for (const account of accounts) {
        await getAllMeetingsByAPI(account);
      }
      setLoading(false);
    } else if (open === false) {
      setLoading(false);
      setMeetingsSearch("");
      setSelectedAccount("all");
      setIsAddingMeeting(null);
    }

    setOpenModal(open);
  };

  // Memoize IDs para evitar recalcular a cada iteração
  const existingMeetingIds = new Set(meetings.map((m) => m.meeting_id));
  const existingIds = new Set(meetings.map((m) => m.id));

  const filteredMeetings = meetingsByAPI.filter((meeting) => {
    // Remove reuniões já adicionadas
    if (existingMeetingIds.has(meeting.meeting_id)) return false;

    // Filtro por conta específica
    if (selectedAccount !== "all" && meeting.account_id !== selectedAccount) {
      return false;
    }

    // Filtro por busca de texto
    if (meetingsSearch) {
      const searchMatch = meeting.topic
        .toLowerCase()
        .includes(meetingsSearch.toLowerCase());

      // Se não há reuniões existentes, apenas verifica a busca
      if (!meetings.length) return searchMatch;

      // Verifica busca e se não está duplicado
      return searchMatch && !existingIds.has(meeting.id);
    }

    // Sem busca, apenas verifica se não está duplicado
    return !existingIds.has(meeting.id);
  });

  const handleAddMeeting = async (meeting: ZoomMeetingT) => {
    setIsAddingMeeting(meeting.id);
    const account = accounts.find(
      (account) => account.id === meeting.account_id
    );
    if (!account) return;
    toast.info("Pegando informações da reunião...");
    console.log(meeting);
    await createMeeting(account, meeting);
    setIsAddingMeeting(null);
  };

  return (
    <Sheet onOpenChange={handleOpen} open={openModal}>
      <SheetTrigger>
        <Button className="px-4! w-max items-start justify-start font-semibold cursor-pointer">
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
        <main className="h-full flex flex-col gap-4 py-2 overflow-hidden">
          <div className="flex gap-2 p-2">
            <Input
              placeholder="Procurar reuniões..."
              onChange={(e) => setMeetingsSearch(e.target.value)}
              value={meetingsSearch}
            />
            <Select onValueChange={setSelectedAccount} value={selectedAccount}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value="all">
                  Todas as contas
                </SelectItem>
                <SelectGroup>
                  <SelectLabel>Contas Zoom</SelectLabel>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.me?.display_name || account.me?.email}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {!loading ? (
            <ul className="p-2 h-full flex flex-col gap-4 overflow-y-auto">
              {filteredMeetings.map((meeting: ZoomMeetingT) => (
                <MeetingsSheetDataItem
                  key={meeting.uuid}
                  meeting={meeting}
                  isAddingMeeting={isAddingMeeting}
                  handleAddMeeting={handleAddMeeting}
                />
              ))}

              {filteredMeetings.length === 0 && (
                <div className="flex flex-col gap-2 h-full items-center justify-center">
                  <h2 className="text-sm font-bold text-gray-800">
                    {meetingsSearch
                      ? "Não há reuniões com esse título"
                      : "Não há reuniões disponíveis"}
                  </h2>
                  <i className="text-xs text-muted-foreground text-center">
                    {meetingsSearch
                      ? "(Reuniões que já estão associadas não aparecem aqui.)"
                      : "(Selecione outra conta ou verifique as reuniões existentes.)"}
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
            <Button
              className="font-semibold cursor-pointer"
              disabled={isAddingMeeting !== null || loading}
            >
              Finalizar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
