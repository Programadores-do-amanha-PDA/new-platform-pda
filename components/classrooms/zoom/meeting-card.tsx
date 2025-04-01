import { useState } from "react";
import {
  CalendarMinus,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { ZoomMeetingType } from "@/types/zoom/meettings";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ZoomMeetingCard = ({ meeting }: { meeting: ZoomMeetingType }) => {
  const path = usePathname();
  const [loading, setLoading] = useState(false);

  const [isVisibleOnSchedule, setIsVisibleOnSchedule] =
    useState<boolean>(false);

  return (
    <li className="p-4 border rounded-lg max-w-xs w-80 h-max flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`${path}/${meeting.id}`}
          className="font-semibold truncate hover:underline cursor-pointer"
          title={meeting.topic}
        >
          {meeting.topic}
        </Link>
        <p className="text-sm h-5 text-gray-500 flex gap-1">
          Início em:
          <p className="font-bold">
            {new Date(meeting.start_time).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
        </p>
        <p className="text-sm h-5 text-gray-500 flex gap-1">
          Termino prev em:
          <p className="font-bold">
            {new Date(
              new Date(meeting.start_time).getTime() + meeting.duration * 60000
            ).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
        </p>
        <p className="text-sm h-4 text-gray-500 flex gap-1">
          Duração:
          <p className="font-bold">{meeting.duration} minutos</p>
        </p>
        <p className="text-sm h-4 text-gray-500 flex gap-1">
          Meeting ID: <p className="font-bold">{meeting.id}</p>
        </p>
        <a
          href={meeting.join_url}
          className="text-sm font-semibold text-primary-foreground underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar na reunião
        </a>
      </div>

      {new Date(meeting.start_time).getTime() >= new Date().getTime() ? (
        !isVisibleOnSchedule ? (
          <Button className="font-semibold" disabled={loading}>
            <CalendarPlus className="size-5" />
            Adicionar ao calendário
          </Button>
        ) : (
          <Button className="font-semibold" disabled={loading}>
            <CalendarMinus className="size-5" />
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            Remover do calendário
          </Button>
        )
      ) : (
        <div className="w-full flex justify-between items-center">
          {meeting?.participants && meeting?.participants?.length > 0 ? (
            <p className="text-sm h-4 text-gray-500 flex gap-1">
              Participantes:
              <p className="font-bold">{meeting?.participants?.length}</p>
            </p>
          ) : (
            <p className="text-sm h-4 text-gray-500 flex gap-1">
              Nenhum participante encontrado.
            </p>
          )}

          <Button size="icon" disabled={loading} title="Atualizar">
            <RefreshCw className={cn("size-5", loading && "animate-spin")} />
            <p className="sr-only">Atualizar</p>
          </Button>
        </div>
      )}
    </li>
  );
};
export default ZoomMeetingCard;
