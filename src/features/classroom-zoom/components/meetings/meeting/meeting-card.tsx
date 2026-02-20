"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarMinus, CalendarPlus, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useZoomAccountStore } from "../../../stores/accounts";
import { ZoomMeeting } from "@/features/classroom-zoom/types/meetings";

const ZoomMeetingCard = ({ meeting }: { meeting: ZoomMeeting }) => {
    const path = usePathname();
    const [loading, setLoading] = useState(false);

    const { accounts } = useZoomAccountStore();

    /**
     * Determines if the meeting is upcoming (not yet started).
     * Computed once and memoized to avoid calling impure `Date.now()` during render.
     */
    const isUpcomingMeeting = useMemo(() => {
        if (!meeting.start_time) return false;
        return new Date(meeting.start_time).getTime() >= new Date().getTime();
    }, [meeting.start_time]);

    const handleRefresh = async () => {
        setLoading(true);

        const account = accounts.find((account) => account.id === meeting.account_id);
        if (!account) return;

        setLoading(false);
    };

    return (
        <li className="flex flex-col gap-4 p-4 border rounded-lg w-80 max-w-xs h-max">
            <div className="flex flex-col gap-1">
                <Link
                    href={`${path}/${meeting.id}`}
                    className="font-semibold hover:underline truncate cursor-pointer"
                    title={meeting.topic}
                >
                    {meeting.topic}
                </Link>
                {meeting.start_time && (
                    <p className="flex gap-1 h-5 text-gray-500 text-sm">
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

                <p className="flex gap-1 h-4 text-gray-500 text-sm">
                    Duração:
                    <p className="font-bold">{meeting.duration} minutos</p>
                </p>
                {isUpcomingMeeting && (
                    <>
                        <p className="flex gap-1 h-4 text-gray-500 text-sm">
                            ID da Reunião: <p className="font-bold">{meeting.id}</p>
                        </p>
                        <p className="flex gap-1 h-4 text-gray-500 text-sm">
                            Senha: <p className="font-bold">{meeting.password}</p>
                        </p>
                    </>
                )}
                {isUpcomingMeeting && (
                    <a
                        href={meeting.join_url}
                        className="font-semibold text-primary-foreground text-sm underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Entrar na reunião
                    </a>
                )}
            </div>

            {isUpcomingMeeting ? (
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
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col gap-2">
                        {meeting?.participants && meeting?.participants?.length > 0 ? (
                            <p className="flex gap-1 h-4 text-gray-500 text-sm">
                                Participantes:
                                <p className="font-bold">{meeting?.participants?.length}</p>
                            </p>
                        ) : (
                            <p className="flex gap-1 h-4 text-gray-500 text-sm">Nenhum participante encontrado.</p>
                        )}

                        {meeting?.poll_results && meeting?.poll_results?.length > 0 ? (
                            <p className="flex gap-1 h-4 text-gray-500 text-sm">
                                Respostas:
                                <p className="font-bold">{meeting?.poll_results?.length}</p>
                            </p>
                        ) : (
                            <p className="flex gap-1 h-4 text-gray-500 text-sm">Nenhuma resposta encontrada.</p>
                        )}
                    </div>

                    <Button size="icon" disabled={loading} onClick={handleRefresh} title="Atualizar">
                        <RefreshCw className={cn("size-5", loading && "animate-spin")} />
                        <p className="sr-only">Atualizar</p>
                    </Button>
                </div>
            )}
        </li>
    );
};
export default ZoomMeetingCard;
