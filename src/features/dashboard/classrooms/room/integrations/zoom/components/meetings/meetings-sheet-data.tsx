/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpLeft, LoaderCircle, Search } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import EmptyState from "@/components/shared/empty-states/empty-state";

import {
  useZoomAccountStore,
  useZoomMeetingStore,
  useZoomAPIStore,
} from "../../stores";
import MeetingsSheetDataItem from "./meetings-sheet-data-item";
import { ZoomAccountT, ZoomMeeting } from "../../types";

const MeetingsSheetData = ({ classroomId }: { classroomId: string }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meetingsSearch, setMeetingsSearch] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string | "all">("all");
  const [isAddingMeeting, setIsAddingMeeting] = useState<string | null>(null);
  const [classroomZoomAccounts, setClassroomZoomAccounts] = useState<
    ZoomAccountT[]
  >([]);

  const { accounts } = useZoomAccountStore();
  const { meetings, createMeeting } = useZoomMeetingStore();
  const { meetingsByAPI, getAllMeetingsByAPI } = useZoomAPIStore();

  useEffect(() => {
    const loadMeetings = async () => {
      if (openModal) {
        setIsLoading(true);

        const filteredAccounts = accounts.filter(
          (account) => account.classroom_id === classroomId
        );
        setClassroomZoomAccounts(filteredAccounts);

        for (const account of filteredAccounts) {
          await getAllMeetingsByAPI(account);
        }

        setIsLoading(false);
      } else {
        setIsLoading(false);
        setMeetingsSearch("");
        setSelectedAccount("all");
        setIsAddingMeeting(null);
        setClassroomZoomAccounts([]);
      }
    };

    loadMeetings();
  }, [openModal, classroomId]);

  // Memorizing IDs
  const existingMeetingIds = new Set(meetings.map((m) => m.meeting_id));
  const existingIds = new Set(meetings.map((m) => m.id));

  // Calculate classroom meetings from API data
  const accountIds = classroomZoomAccounts.map((a) => a.id);
  const classroomMeetingsByAPI = meetingsByAPI.filter((meeting) =>
    accountIds.includes(meeting.account_id)
  );

  const filteredMeetings = classroomMeetingsByAPI.filter((meeting) => {
    if (existingMeetingIds.has(meeting.meeting_id)) return false;
    if (meetingsSearch) {
      const searchMatch = meeting.topic
        .toLowerCase()
        .includes(meetingsSearch.toLowerCase());

      if (!meetings.length) return searchMatch;

      return searchMatch && !existingIds.has(meeting.id);
    }

    return !existingIds.has(meeting.id);
  });

  const handleAddMeeting = async (meeting: ZoomMeeting) => {
    setIsAddingMeeting(meeting.id);
    const account = classroomZoomAccounts.find(
      (account) => account.id === meeting.account_id
    );
    if (!account) return;
    toast.info("Pegando informações da reunião...");
    await createMeeting(account, meeting);
    setIsAddingMeeting(null);
  };

  return (
    <Sheet onOpenChange={setOpenModal} open={openModal}>
      <SheetTrigger>
        <Button className="justify-start items-start px-4! w-max font-semibold cursor-pointer">
          Adicionar Reunião
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Adicionar Reunião do Zoom</SheetTitle>
          <SheetDescription>
            Adicione abaixo as reuniões do Zoom que fazem parte desta turma
          </SheetDescription>
        </SheetHeader>
        <main className="flex flex-col gap-0 h-full overflow-hidden">
          <header className="flex flex-col items-end gap-4 p-2">
            <InputGroup>
              <InputGroupInput
                placeholder="Procurar reuniões..."
                onChange={(e) => setMeetingsSearch(e.target.value)}
                value={meetingsSearch}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              {meetingsSearch.length > 0 && (
                <InputGroupAddon align="inline-end">
                  {filteredMeetings.length} resultados
                </InputGroupAddon>
              )}
            </InputGroup>
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
                  {classroomZoomAccounts.map((account, i) => (
                    <SelectItem
                      key={`zoom-account-key-${i}`}
                      value={account.id}
                    >
                      {account.me?.display_name || account.me?.email}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </header>

          {filteredMeetings.length > 0 ? (
            <ul className="flex flex-col gap-4 p-2 h-full overflow-y-auto">
              {filteredMeetings.map((meeting: ZoomMeeting) => (
                <MeetingsSheetDataItem
                  key={meeting.uuid}
                  meeting={meeting}
                  isAddingMeeting={isAddingMeeting}
                  handleAddMeeting={handleAddMeeting}
                />
              ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <EmptyState
                icon={<Search className="stroke-primary size-6" />}
                title={
                  meetingsSearch
                    ? "Nenhuma reunião encontrada..."
                    : "Não há reuniões disponíveis"
                }
                description={
                  meetingsSearch
                    ? "Reuniões que já estão associadas não aparecem aqui."
                    : accounts.length > 0
                    ? "Selecione outra conta ou verifique as reuniões existentes."
                    : "Adicione uma conta do Zoom para conseguir ver as reuniões!!"
                }
                action={
                  <SheetClose asChild>
                    <Button variant="link" asChild>
                      <Link
                        href={`/dashboard/classrooms/${classroomId}/zoom/accounts`}
                      >
                        <ArrowUpLeft /> Ir para Zoom Accounts
                      </Link>
                    </Button>
                  </SheetClose>
                }
              />
            </div>
          )}

          {isLoading && (
            <>
              <div className="flex justify-center items-center w-full h-full">
                <LoaderCircle className="stroke-primary size-6 animate-spin" />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button
                    className="font-semibold cursor-pointer"
                    disabled={isAddingMeeting !== null || isLoading}
                  >
                    Finalizar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </main>
      </SheetContent>
    </Sheet>
  );
};

export default MeetingsSheetData;
