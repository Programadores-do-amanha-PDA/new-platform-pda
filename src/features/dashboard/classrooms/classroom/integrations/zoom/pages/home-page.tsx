"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  useZoomMeetingStore,
  useZoomAccountStore,
  useZoomMeetingPastInstanceStore,
} from "../stores";
import { MeetingsParticipantsChart } from "../components/meetings-participants-chart";
import ZoomAccountCard from "../components/accounts/account-card";
import { ZoomMeetingParticipantT } from "../types";

export default function ZoomHomePage() {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { accounts } = useZoomAccountStore();
  const { meetings } = useZoomMeetingStore();
  const { pastInstances } = useZoomMeetingPastInstanceStore();

  const chartData = () => {
    const pastInstanciesData =
      pastInstances
        ?.filter((p) => p.is_visible_on_schedule)
        .flatMap((instance) => {
          const account = accounts.find(
            (acc) => acc.id === instance.account_id
          );
          const account_label = account?.me?.display_name || "Conta sem nome";
          const participantGroups = new Map<string, ZoomMeetingParticipantT>();

          instance?.participants?.forEach(
            (participant: ZoomMeetingParticipantT) => {
              const existing = participantGroups.get(participant.user_email);
              if (!existing) {
                participantGroups.set(participant.user_email, participant);
              }
            }
          );

          return {
            account_id: instance.account_id,
            account_label: account_label,
            date: instance?.start_time || "",
            participants: Array.from(participantGroups.values()).length || 0,
            poll_results: instance?.poll_results?.length || 0,
          };
        }) || [];

    const pastMeetingsData =
      meetings
        ?.filter(
          (meeting) =>
            meeting.type !== 8 &&
            new Date(meeting.start_time || 0).getTime() < Date.now() &&
            meeting.is_visible_on_schedule
        )
        .flatMap((meeting) => {
          const account = accounts.find((acc) => acc.id === meeting.account_id);
          const account_label = account?.me?.display_name || "Conta sem nome";
          const participantGroups = new Map<string, ZoomMeetingParticipantT>();
          meeting?.participants?.forEach(
            (participant: ZoomMeetingParticipantT) => {
              const existing = participantGroups.get(participant.user_email);
              if (!existing) {
                participantGroups.set(participant.user_email, participant);
              }
            }
          );

          return {
            account_id: meeting.account_id,
            account_label: account_label,
            date: meeting?.start_time || "",
            participants: Array.from(participantGroups.values()).length || 0,
            poll_results: meeting?.poll_results?.length || 0,
          };
        }) || [];

    return [...pastInstanciesData, ...pastMeetingsData]
      .flat()
      .filter(
        (i, index, arr) =>
          arr.findIndex(
            (item) => item.account_id === i.account_id && item.date === i.date
          ) === index
      )
      .sort(
        (a, b) =>
          new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      );
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 overflow-y-auto">
      <div className="w-full flex flex-col gap-4 p-6 rounded-lg bg-primary/10 pb-4">
        <header className="w-full flex justify-between items-center gap-4">
          <p className="text-lg font-bold">Contas sincronizadas</p>
          <Link
            href={`/dashboard/classrooms/${classroom_id}/zoom/accounts`}
            className="w-max h-6 flex gap-2 items-center text-sm font-bold text-primary-foreground hover:underline"
          >
            Gerenciar contas
            <ArrowRight className="-rotate-6 size-4" />
          </Link>
        </header>
        <ul className="w-full h-max flex items-start gap-4 overflow-x-auto pb-5">
          {accounts.map((account) => (
            <ZoomAccountCard
              account={account}
              key={account.id}
              expansive={false}
            />
          ))}
        </ul>
      </div>

      <MeetingsParticipantsChart
        chartData={chartData()}
        classroomId={classroom_id}
      />
    </div>
  );
}
