"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";

const pathLabels: { [key: string]: string } = {
  users: "Usuários",
  companies: "Empresas",
  jobs: "Vagas",
  curated: "Vagas curadas",
  curation: "Curadoria de Vagas",
  dashboard: "Dashboard",
  all_users: "Todos os usuários",
  alumni: "Alumni",
  all_alumni: "Todos os Alumni",
  all_companies: "Todos as empresas",
  all_jobs: "Todas as vagas",
  all_applications: "Todas as aplicações",
  admin: "Administração",
  settings: "Configurações",
  profile: "Perfil",
  match: "Match de vagas",
  curriculum: "Meu currículo",
  applications: "Minhas candidaturas",
};

export function AppBar() {
  const path = usePathname();
  const segments = path.split("/").filter(Boolean);
  const role = segments[1] || "";
  const parts = segments.slice(2);
  const { user } = useAuth();

  const breadcrumbItems = parts.reduce(
    (acc, part, index) => {
      const href = `/dashboard/${role}/${parts.slice(0, index + 1).join("/")}`;
      let label = "";
      if (part === "all") {
        label = pathLabels[part.concat("_", parts[index - 1])] || part;
      } else if (part !== "all") {
        label = pathLabels[part] || part;
      }
      acc.push({ label, href, title: "" });
      return acc;
    },
    [
      {
        label: "Inicio",
        title: `Olá ${user?.profile?.full_name} 👋🏿`,
        href: `/dashboard/${role}`,
      },
    ]
  );

  const title = breadcrumbItems[breadcrumbItems.length - 1]?.title
    ? breadcrumbItems[breadcrumbItems.length - 1]?.title
    : breadcrumbItems[breadcrumbItems.length - 1]?.label;

  return (
    <div className="flex flex-col gap-2 sticky top-0 left-0 bg-background py-2 z-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2 flex flex-col gap-1">
          <h1
            className={cn(
              "scroll-m-20 text-xl md:text-3xl font-bold tracking-tight"
            )}
          >
            {title}
          </h1>
        </div>
      </div>

      <div className="flex h-5 items-center space-x-1 text-sm leading-none">
        <SidebarTrigger className="!p-0 w-max justify-start" />
        <Separator orientation="vertical" className="!mx-3" />
        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.href}>
            {index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.href}
                className="truncate text-muted-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <div className="text-foreground">{item.label}</div>
            )}
            {index < breadcrumbItems.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
