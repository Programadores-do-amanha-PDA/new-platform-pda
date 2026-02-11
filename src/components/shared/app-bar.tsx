"use client";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";


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
import { useUserProfileStore } from "@/features/users/profile/store";

interface AppBarProps {
  pathLabels: { [key: string]: string };
}

const AppBar: React.FC<AppBarProps> = ({ pathLabels }) => {
  const path = usePathname();
  const segments = path.split("/").filter(Boolean);

  const parts = segments.slice(1);
  const { profile } = useUserProfileStore();

  const breadcrumbItems = parts.reduce(
    (acc, part, index) => {
      const href = `/dashboard/${parts.slice(0, index + 1).join("/")}`;
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
        title: `Olá ${profile?.full_name?.split(" ", 1)[0] || "usuário"} 👋🏿`,
        href: `/dashboard`,
      },
    ]
  );

  const title = breadcrumbItems[breadcrumbItems.length - 1]?.title
    ? breadcrumbItems[breadcrumbItems.length - 1]?.title
    : breadcrumbItems[breadcrumbItems.length - 1]?.label;

  return (
    <div className="top-0 left-0 z-50 sticky flex flex-col justify-between items-start gap-1 border-b !rounded-t-lg w-full min-h-[100px] max-h-28 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-2">
        <SidebarTrigger className="flex justify-center items-center border rounded-lg w-max size-10 cursor-pointer" />

        <div className="flex flex-col gap-1 space-y-2 ml-2">
          <h1
            className={cn(
              "font-bold text-xl md:text-3xl tracking-tight scroll-m-20"
            )}
          >
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center px-4 py-2 border-t w-full h-12">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.href}>
                <BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="hover:underline">
                        {item.label}
                      </Link>
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
