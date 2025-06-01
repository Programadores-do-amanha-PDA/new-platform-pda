"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/common/users/DonutChart";
import { useAdminStackContext } from "@/context/admin/stack-context";

export default function UserHomeDashboard() {
  const router = useRouter();
  const {
    usersStack: { users },
  } = useAdminStackContext();

  const chartData = [
    {
      label: "admin",
      value: users.filter(
        (u) =>
          u.profile &&
          u.profile.user_roles &&
          u.profile.user_roles.map((ur) => ur.role).includes("admin")
      ).length,
      fill: "var(--color-admin)",
    },
    {
      label: "employer",
      value: users.filter(
        (u) =>
          u.profile &&
          u.profile.user_roles &&
          u.profile.user_roles.map((ur) => ur.role).includes("employer")
      ).length,
      fill: "var(--color-employer)",
    },
    {
      label: "alumni",
      value: users.filter(
        (u) =>
          u.profile &&
          u.profile.user_roles &&
          u.profile.user_roles.map((ur) => ur.role).includes("alumni")
      ).length,
      fill: "var(--color-alumni)",
    },
    {
      label: "student",
      value: users.filter(
        (u) =>
          u.profile &&
          u.profile.user_roles &&
          u.profile.user_roles.map((ur) => ur.role).includes("student")
      ).length,
      fill: "var(--color-student)",
    },
  ];

  const chartConfig = {
    label: {
      label: "Usuários",
    },
    admin: {
      label: "Administrador",
      color: "hsl(var(--chart-1))",
    },
    employer: {
      label: "Empregador",
      color: "hsl(var(--chart-2))",
    },
    alumni: {
      label: "Alumni",
      color: "hsl(var(--chart-3))",
    },
    student: {
      label: "Estudante",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <main className="relative w-full flex flex-col py-6 gap-10">
      <div className="w-max h-72 bg-card flex gap-20 items-center justify-between rounded-lg shadow-sm border p-6 relative">
        <div className="h-full flex flex-col gap-6 justify-between items-center">
          <div className="w-52 overflow-hidden flex items-center justify-center">
            <DonutChart
              chartData={chartData}
              chartConfig={chartConfig}
              totalLabel="Usuários"
            />
          </div>

          <Button
            className="font-semibold"
            onClick={() => router.push("/dashboard/admin/users/all")}
          >
            Gerenciar usuários
          </Button>
        </div>
        <Image
          src={"/assets/images/UsersCardIllustration.svg"}
          width={300}
          height={300}
          alt=""
          className="size-64"
        />
      </div>
    </main>
  );
}
