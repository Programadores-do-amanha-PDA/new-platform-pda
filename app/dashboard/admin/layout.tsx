"use client";

import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdminStackProvider } from "@/context/admin/stack-context";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user, userRole } = useAuth();

  if (!user || !userRole || userRole !== "admin") {
    return (
      <div className="relative p-6 lg:gap-10 lg:p-8 w-screen h-screen">
        <div className="w-full h-full flex flex-col gap-8 items-center justify-center space-y-2">
          <Image
            src={"/assets/images/empty/no-access.png"}
            alt=""
            width={400}
            height={400}
            className="w-1/3"
          />
          <h1
            className={cn(
              "scroll-m-20 text-3xl font-bold tracking-tight text-primary-foreground"
            )}
          >
            Você não tem acesso a este conteúdo!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <AdminStackProvider user={user} userRole={userRole}>
      {children}
    </AdminStackProvider>
  );
};

export default AdminLayout;
