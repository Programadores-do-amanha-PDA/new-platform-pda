import Link from "next/link";
import {
  CalendarMinus,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZoomMeetingT } from "@/types/classroom-zoom/meetings";
import { cn } from "@/lib/utils";
import {
  RECURRING_MEETING_TYPES,
  isFutureMeeting,
  formatDateTime,
  formatDate,
  getMeetingType,
} from "../../utils/meeting-utils";

interface MeetingHeaderProps {
  meeting: ZoomMeetingT;
  classroomId: string;
}

interface MeetingInfoProps {
  meeting: ZoomMeetingT;
}

interface MeetingStatsProps {
  meeting: ZoomMeetingT;
  pastInstancesCount?: number;
  upcomingOccurrencesCount?: number;
}

interface RefreshButtonProps {
  loading: boolean;
  allMeetingLoading: boolean;
  onRefresh: () => void;
}

interface CalendarButtonProps {
  meeting: ZoomMeetingT;
  loading: boolean;
}

export const MeetingHeader = ({ meeting, classroomId }: MeetingHeaderProps) => (
  <div className="flex flex-col gap-1">
    <Link
      href={`/dashboard/classrooms/${classroomId}/zoom/meetings/${meeting.id}`}
      className="font-semibold truncate hover:underline cursor-pointer"
      title={meeting.topic}
    >
      {meeting.topic}
    </Link>
    <p className="text-sm font-semibold text-muted-foreground truncate">
      {getMeetingType(meeting.type)}
    </p>
  </div>
);

export const MeetingInfo = ({ meeting }: MeetingInfoProps) => (
  <>
    {meeting.start_time && (
      <p className="text-sm h-5 text-muted-foreground flex gap-1">
        {isFutureMeeting(meeting.start_time) ? "Início em:" : "Realizada em:"}
        <span className="font-bold">
          {formatDateTime(meeting.start_time)}
        </span>
      </p>
    )}
    
    <p className="text-sm h-4 text-muted-foreground flex gap-1">
      Duração:
      <span className="font-bold">{meeting.duration} minutos</span>
    </p>
    
    {isFutureMeeting(meeting.start_time) && (
      <>
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          ID da Reunião: <span className="font-bold">{meeting.meeting_id}</span>
        </p>
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          Senha: <span className="font-bold">{meeting.password}</span>
        </p>
        <a
          href={meeting.join_url}
          className="text-sm font-semibold text-primary-foreground underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar na reunião
        </a>
      </>
    )}
  </>
);

export const MeetingStats = ({ 
  meeting, 
  pastInstancesCount, 
  upcomingOccurrencesCount 
}: MeetingStatsProps) => (
  <div className="flex flex-col gap-2">
    {meeting.synchronized_at && (
      <p className="text-sm h-4 text-muted-foreground flex gap-1">
        Ultima (re)sincronização:
        <span className="font-bold">
          {formatDate(meeting.synchronized_at)}
        </span>
      </p>
    )}
    
    {RECURRING_MEETING_TYPES.includes(meeting.type as 3 | 8) ? (
      <>
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          {pastInstancesCount && pastInstancesCount > 0 ? (
            <>
              Reuniões finalizadas:
              <span className="font-bold">{pastInstancesCount}</span>
            </>
          ) : (
            "Nenhum participante encontrado."
          )}
        </p>
        
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          {upcomingOccurrencesCount && upcomingOccurrencesCount > 0 ? (
            <>
              Próximas reuniões:
              <span className="font-bold">{upcomingOccurrencesCount}</span>
            </>
          ) : (
            "Sem próximas reuniões."
          )}
        </p>
      </>
    ) : (
      <>
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          {meeting.participants && meeting.participants.length > 0 ? (
            <>
              Participantes:
              <span className="font-bold">{meeting.participants.length}</span>
            </>
          ) : (
            "Nenhum participante encontrado."
          )}
        </p>
        
        <p className="text-sm h-4 text-muted-foreground flex gap-1">
          {meeting.poll_results && meeting.poll_results.length > 0 ? (
            <>
              Respostas:
              <span className="font-bold">{meeting.poll_results.length}</span>
            </>
          ) : (
            "Nenhuma resposta encontrada."
          )}
        </p>
      </>
    )}
  </div>
);

export const RefreshButton = ({ loading, allMeetingLoading, onRefresh }: RefreshButtonProps) => (
  <Button
    size="icon"
    disabled={loading || allMeetingLoading}
    onClick={onRefresh}
    title="Atualizar"
    className="cursor-pointer"
  >
    <RefreshCw className={cn("size-5", loading && "animate-spin")} />
    <span className="sr-only">Atualizar</span>
  </Button>
);

export const CalendarButton = ({ meeting, loading }: CalendarButtonProps) => {
  if (!isFutureMeeting(meeting.start_time)) return null;
  
  return !meeting.is_visible_on_schedule ? (
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
  );
};