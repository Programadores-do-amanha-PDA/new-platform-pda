"use client";
import ZoomAccountCard from "@/components/classrooms/zoom/accounts/account-card";
import ZoomMeetingsCard from "@/components/classrooms/zoom/meetings/meetings-card";
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

      <div className="w-full h-full flex flex-wrap items-start gap-4 px-6 overflow-hidden">
        <header className="w-full flex justify-between gap-4">
          <p className="text-lg font-bold mb-4">Reuniões sincronizadas</p>
          <Link href={`${path}/meetings`}>
            <Button
              variant="link"
              className="text-sm font-bold text-primary-foreground"
            >
              Ver todas as reuniões
              <ArrowRight className="-rotate-6" />
            </Button>
          </Link>
        </header>

        <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto">
          {meetings
            .sort(
              (a, b) =>
                new Date(b.start_time ?? 0).getTime() -
                new Date(a.start_time ?? 0).getTime()
            )
            .filter((_, i) => i < 10)
            .map((meeting, i) => (
              <ZoomMeetingsCard
                key={`meeting-${i}`}
                meeting={meeting}
                allMeetingLoading={false}
                setAllMeetingLoading={() => {}}
                expansive={false}
              />
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ZoomHomePage;
