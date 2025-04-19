"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AppBar } from "@/components/common/app-bar";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/common/users/DonutChart";
import { useEmployerStack } from "@/context/employer/stack-context";

export default function UserHomeDashboard() {
  const router = useRouter();
  const {
    alumniStack: { alumni },
  } = useEmployerStack();

  console.log(alumni)

  const chartData = [
    {
      label: "alumni",
      value: alumni.filter(
        (u) =>
          u.profile &&
          u.profile.user_roles &&
          u.profile.user_roles.map((ur) => ur.role).includes("alumni")
      ).length,
      fill: "var(--color-alumni)",
    },
  ];

  const chartConfig = {
    label: {
      label: "Alumni",
    },
    alumni: {
      label: "Alumni",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8">
      <AppBar />

      <div className="space-y-2">
        <div className="w-max h-72 bg-card flex gap-20 items-center justify-between rounded-lg shadow border p-6 relative">
          <div className="h-full flex flex-col gap-6 justify-between items-center">
            <div className="w-52 overflow-hidden flex items-center justify-center">
              <DonutChart
                chartData={chartData}
                chartConfig={chartConfig}
                totalLabel="Alumni"
              />
            </div>

            <Button
              className="font-semibold"
              onClick={() => router.push("/dashboard/employer/alumni/all")}
            >
              Gerenciar Alumni
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
      </div>
    </main>
  );
}
