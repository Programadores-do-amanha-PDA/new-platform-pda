"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/auth-context";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { cn } from "@/lib/utils";

interface AppBarProps {
  pathLabels: { [key: string]: string };
}

const AppBar: React.FC<AppBarProps> = ({ pathLabels }) => {
  const path = usePathname();
  const segments = path.split("/").filter(Boolean);
  // const lastSegment = segments[segments.length - 1] || "Inicio";

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
        title: `Olá ${user?.profile?.full_name.split(" ", 1)[0]} 👋🏿`,
        href: `/dashboard/${role}`,
      },
    ]
  );

  const title = breadcrumbItems[breadcrumbItems.length - 1]?.title
    ? breadcrumbItems[breadcrumbItems.length - 1]?.title
    : breadcrumbItems[breadcrumbItems.length - 1]?.label;

  return (
    <div className="w-full flex flex-col gap-1 sticky top-0 left-0 bg-sidebar z-50 border-b">
      <div className="flex gap-4 items-center px-4 py-2">
        <SidebarTrigger className="w-max border size-10 flex items-center justify-center rounded-sm bg-sidebar-accent" />

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
      <div className="px-4 border-t py-2 bg-sidebar">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.href}>
                <BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 ? (
                    <BreadcrumbLink
                      href={item.href}
                      className="hover:underline"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default AppBar;
