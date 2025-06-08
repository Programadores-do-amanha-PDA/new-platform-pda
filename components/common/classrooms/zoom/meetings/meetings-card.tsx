import { useState } from "react";
import {
  CalendarMinus,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { Separator } from "@/components/ui/separator";

const meetingTypes = {
  1: "Reunião instantânea",
  2: "Reunião agendada",
  3: "Reunião recorrente sem horário fixo",
  8: "Reunião recorrente com horário fixo",
};

const ZoomMeetingsCard = ({
  meeting,
  pastInstances,
  allMeetingLoading,
  setAllMeetingLoading,
  expansive,
}: {
  meeting: ZoomMeetingType;
  pastInstances: ZoomMeetingPastInstancesType[];
  allMeetingLoading: boolean;
  setAllMeetingLoading: (v: boolean) => void;
  expansive: boolean;
}) => {
  const path = usePathname();
  const [loading, setLoading] = useState(false);

  const {
    classroomsStack: {
      zoom: {
        accounts: { accounts },
        meetings: { handleRefreshAndUpdateZoomMeeting },
      },
    },
  } = useAdminStackContext();

  const handleRefreshMeeting = async () => {
    setAllMeetingLoading(true);
    setLoading(true);

    const account = accounts.find(
      (account) => account.id === meeting.account_id
    );
    if (!account) return;

    await handleRefreshAndUpdateZoomMeeting(meeting.id, account);

    setAllMeetingLoading(false);
    setLoading(false);
  };

  if (meeting.type === 8 || meeting.type === 3) {
    return (
      <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href={
              expansive
                ? `${path}/${meeting.id}`
                : `${path}/meetings/${meeting.id}`
            }
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
                  ID da Reunião:{" "}
                  <p className="font-bold">{meeting.meeting_id}</p>
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
                {pastInstances && pastInstances?.length > 0 ? (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Reuniões finalizadas:
                    <p className="font-bold">{pastInstances?.length}</p>
                  </p>
                ) : (
                  <p className="text-sm h-4 text-muted-foreground flex gap-1">
                    Nenhuma reunião finalizada.
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
          href={
            expansive
              ? `${path}/${meeting.id}`
              : `${path}/meetings/${meeting.id}`
          }
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
                ID da Reunião: <p className="font-bold">{meeting.meeting_id}</p>
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
                  ) : null}
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
};
export default ZoomMeetingsCard;
