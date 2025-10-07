"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarMinus,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useZoomAccountStore } from "../../../stores/accounts";
import { ZoomMeetingT } from "../../../types";

const ZoomMeetingCard = ({ meeting }: { meeting: ZoomMeetingT }) => {
  const path = usePathname();
  const [loading, setLoading] = useState(false);

  const { accounts } = useZoomAccountStore();

  const handleRefresh = async () => {
    setLoading(true);

    const account = accounts.find(
      (account) => account.id === meeting.account_id
    );
    if (!account) return;

    setLoading(false);
  };

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
        {meeting.start_time && (
          <p className="text-sm h-5 text-gray-500 flex gap-1">
            Início em:
            <p className="font-bold">
              {new Date(meeting.start_time).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </p>
        )}

        <p className="text-sm h-4 text-gray-500 flex gap-1">
          Duração:
          <p className="font-bold">{meeting.duration} minutos</p>
        </p>
        {meeting.start_time &&
          new Date(meeting.start_time).getTime() >= Date.now() && (
            <>
              <p className="text-sm h-4 text-gray-500 flex gap-1">
                ID da Reunião: <p className="font-bold">{meeting.id}</p>
              </p>
              <p className="text-sm h-4 text-gray-500 flex gap-1">
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
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-2">
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

            {meeting?.poll_results && meeting?.poll_results?.length > 0 ? (
              <p className="text-sm h-4 text-gray-500 flex gap-1">
                Respostas:
                <p className="font-bold">{meeting?.poll_results?.length}</p>
              </p>
            ) : (
              <p className="text-sm h-4 text-gray-500 flex gap-1">
                Nenhuma resposta encontrada.
              </p>
            )}
          </div>

          <Button
            size="icon"
            disabled={loading}
            onClick={handleRefresh}
            title="Atualizar"
          >
            <RefreshCw className={cn("size-5", loading && "animate-spin")} />
            <p className="sr-only">Atualizar</p>
          </Button>
        </div>
      )}
    </li>
  );
};
export default ZoomMeetingCard;
