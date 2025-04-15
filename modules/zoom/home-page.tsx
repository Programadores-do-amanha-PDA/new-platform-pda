"use client";
import ZoomAccountCard from "@/components/classrooms/zoom/accounts/account-card";
import { MeetingsParticipantsChart } from "@/components/classrooms/zoom/meetings-participants-chart";
import { Button } from "@/components/ui/button";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ZoomHomePage = () => {
  const {
    classroomsStack: {
      zoom: {
        meetings: { meetings },
        accounts: { accounts },
      },
    },
  } = useAdminStackContext();

  const chartData = meetings
    .map((meeting) => {
      const account = accounts.find((acc) => acc.id === meeting.account_id);
      const account_label =
        account?.me?.display_name || meeting.account_id || "Desconhecida";

      return (
        meeting?.past_instances?.map((instance) => ({
          account_id: meeting.account_id || "",
          account_label: account_label,
          date: instance?.start_time,
          participants: instance?.participants?.length || 0,
          poll_results: instance?.poll_results?.length || 0,
          is_visible_on_schedule: instance?.is_visible_on_schedule,
        })) || []
      );
    })
    .flat()
    .filter(
      (i) =>
        i.is_visible_on_schedule === undefined ||
        i.is_visible_on_schedule === true
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const path = usePathname();

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6">
      <div className="w-full flex flex-col gap-4 p-6 rounded-lg bg-primary/10 pb-4">
        <header className="w-full flex justify-between gap-4">
          <p className="text-lg font-bold mb-4">Contas sincronizadas</p>
          <Link href={`${path}/accounts`}>
            <Button
              variant="link"
              className="text-sm font-bold text-primary-foreground"
            >
              Gerenciar contas
              <ArrowRight className="-rotate-6" />
            </Button>
          </Link>
        </header>
        <ul className="w-full h-max flex items-start gap-4 overflow-x-auto">
          {accounts
            .filter((_, i) => i < 5)
            .map((account) => (
              <ZoomAccountCard
                account={account}
                key={account.id}
                expansive={false}
                handleSetCurrentAccount={() => {}}
              />
            ))}
        </ul>
      </div>

      <MeetingsParticipantsChart chartData={chartData} />
    </div>
  );
};

export default ZoomHomePage;
