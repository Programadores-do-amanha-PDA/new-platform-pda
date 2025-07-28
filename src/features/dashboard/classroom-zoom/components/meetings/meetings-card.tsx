"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CalendarMinus,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ZoomMeetingT } from "@/types/zoom/meetings";
import { cn } from "@/lib/utils";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { useZoomMeetingStore } from "@/stores/modules/classrooms/zoom/meetings";
import { useZoomMeetingPastInstanceStore } from "@/stores/modules/classrooms/zoom/past-instances";

const meetingTypes = {
  1: "Reunião instantânea",
  2: "Reunião agendada",
  3: "Reunião recorrente sem horário fixo",
  8: "Reunião recorrente com horário fixo",
};

export default function ZoomMeetingsCard({
  meeting,
  allMeetingLoading,
  setAllMeetingLoading,
  expansive,
}: {
  meeting: ZoomMeetingT;
  allMeetingLoading: boolean;
  setAllMeetingLoading: (v: boolean) => void;
  expansive: boolean;
}) {
  const { classroom_id } = useParams();
  const [loading, setLoading] = useState(false);

  const { accounts } = useZoomAccountStore();
  const { refreshAndUpdateMeeting } = useZoomMeetingStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();

  const meetingPastInstances = pastInstances.filter(
    (instance) => instance.meeting_id === meeting.id
  );

  const handleRefreshMeeting = async () => {
    setAllMeetingLoading(true);
    setLoading(true);

    const account = accounts.find(
      (account) => account.id === meeting.account_id
    );
    if (!account) return;

    await refreshAndUpdateMeeting(meeting, account);

    setAllMeetingLoading(false);
    setLoading(false);
  };

  if (meeting.type === 8 || meeting.type === 3) {
    return (
      <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href={`/dashboard/classrooms/${classroom_id}/zoom/meetings/${meeting.id}`}
            className="font-semibold truncate hover:underline cursor-pointer"
            title={meeting.topic}
          >
            {meeting.topic}
          </Link>
          <p className="text-sm font-semibold text-muted-foreground truncate">
            {meetingTypes[meeting.type as keyof typeof meetingTypes] ||
              "Sem tipo"}
          </p>

          <p className="text-sm h-4 text-muted-foreground flex gap-1">
            Duração:
            <p className="font-bold">{meeting.duration} minutos</p>
          </p>
          {meeting.start_time &&
            new Date(meeting.start_time).getTime() >= Date.now() && (
              <>
                <p className="text-sm h-4 text-muted-foreground flex gap-1">
                  ID da Reunião: <p className="font-bold">{meeting.id}</p>
                </p>
                <p className="text-sm h-4 text-muted-foreground flex gap-1">
                  Senha: <p className="font-bold">{meeting.password}</p>
                </p>
              </>
            )}
        </div>

        {expansive && (
          <>
            <Separator />
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col gap-2">
                {meeting?.synchronized_at && (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Ultima (re)sincronização:
                    <p className="font-bold">
                      {new Date(meeting?.synchronized_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </p>
                )}
                {meetingPastInstances && meetingPastInstances?.length > 0 ? (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Reuniões finalizadas:
                    <p className="font-bold">{meetingPastInstances?.length}</p>
                  </p>
                ) : (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Nenhum participante encontrado.
                  </p>
                )}

                {meeting?.occurrences &&
                meeting?.occurrences?.filter(
                  (o) => new Date(o.start_time).getTime() >= Date.now()
                ).length > 0 ? (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Próximas reuniões:
                    <p className="font-bold">
                      {
                        meeting?.occurrences?.filter(
                          (o) => new Date(o.start_time).getTime() >= Date.now()
                        ).length
                      }
                    </p>
                  </p>
                ) : (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Sem próximas reuniões.
                  </p>
                )}
              </div>

              <Button
                size="icon"
                disabled={loading || allMeetingLoading}
                onClick={handleRefreshMeeting}
                title="Atualizar"
              >
                <RefreshCw
                  className={cn("size-5", loading && "animate-spin")}
                />
                <p className="sr-only">Atualizar</p>
              </Button>
            </div>
          </>
        )}
      </li>
    );
  }

  return (
    <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/zoom/${classroom_id}/meetings/${meeting.id}`}
          className="font-semibold truncate hover:underline cursor-pointer"
          title={meeting.topic}
        >
          {meeting.topic}
        </Link>
        <p className="text-sm font-semibold text-muted-foreground truncate">
          {meetingTypes[meeting.type as keyof typeof meetingTypes] ||
            "Sem tipo"}
        </p>
        {meeting.start_time && (
          <p className="text-sm h-5 text-muted-foreground flex gap-1">
            {meeting.start_time &&
            new Date(meeting.start_time).getTime() >= Date.now()
              ? "Início em:"
              : "Realizada em:"}

            <p className="font-bold">
              {new Date(meeting.start_time).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </p>
        )}

        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          Duração:
          <p className="font-bold">{meeting.duration} minutos</p>
        </p>
        {meeting.start_time &&
          new Date(meeting.start_time).getTime() >= Date.now() && (
            <>
              <p className="text-sm h-4 text-muted-foreground flex gap-1">
                ID da Reunião: <p className="font-bold">{meeting.id}</p>
              </p>
              <p className="text-sm h-4 text-muted-foreground flex gap-1">
                Senha: <p className="font-bold">{meeting.password}</p>
              </p>
            </>
          )}
        {meeting.start_time &&
          new Date(meeting.start_time).getTime() >= Date.now() && (
            <a
              href={meeting.join_url}
              className="text-sm font-semibold text-primary-foreground underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Entrar na reunião
            </a>
          )}
      </div>
      {expansive && (
        <>
          {meeting.start_time &&
          new Date(meeting.start_time).getTime() >= new Date().getTime() ? (
            !meeting.is_visible_on_schedule ? (
              <Button className="font-semibold" disabled={loading}>
                <CalendarPlus className="size-5" />
                Adicionar ao calendário
              </Button>
            ) : (
              <Button className="font-semibold" disabled={loading}>
                <CalendarMinus className="size-5" />
                {loading && <LoaderCircle className="size-5 animate-spin" />}
                Ocultar do calendário
              </Button>
            )
          ) : (
            <>
              <Separator />

              <div className="w-full flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  {meeting?.synchronized_at && (
                    <p className="text-sm h-4 text-muted-foreground flex gap-1">
                      Ultima (re)sincronização:
                      <p className="font-bold">
                        {new Date(meeting?.synchronized_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </p>
                  )}
                  {meeting?.participants &&
                  meeting?.participants?.length > 0 ? (
                    <p className="text-sm h-4 text-muted-foreground flex gap-1">
                      Participantes:
                      <p className="font-bold">
                        {meeting?.participants?.length}
                      </p>
                    </p>
                  ) : (
                    <p className="text-sm h-4 text-muted-foreground flex gap-1">
                      Nenhum participante encontrado.
                    </p>
                  )}

                  {meeting?.poll_results &&
                  meeting?.poll_results?.length > 0 ? (
                    <p className="text-sm h-4 text-muted-foreground flex gap-1">
                      Respostas:
                      <p className="font-bold">
                        {meeting?.poll_results?.length}
                      </p>
                    </p>
                  ) : (
                    <p className="text-sm h-4 text-muted-foreground flex gap-1">
                      Nenhuma resposta encontrada.
                    </p>
                  )}
                </div>

                <Button
                  size="icon"
                  disabled={loading || allMeetingLoading}
                  onClick={handleRefreshMeeting}
                  title="Atualizar"
                >
                  <RefreshCw
                    className={cn("size-5", loading && "animate-spin")}
                  />
                  <p className="sr-only">Atualizar</p>
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </li>
  );
}
