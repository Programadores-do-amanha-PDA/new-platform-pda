"use client";
import { useAuth } from "@/context/auth-context";
import pathLabels from "@/utils/path-labels";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

const AppMap = () => {
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

  return (
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
  );
};

export default AppMap;
