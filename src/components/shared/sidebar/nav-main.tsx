"use client";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import { SidebarNavItemT } from "@/types/sidebar";

export default function NavMain({
  items,
  title,
}: {
  items: SidebarNavItemT[];
  title: string;
}) {
  const router = useRouter();
  const path = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={
              path.split("/").includes(item?.ref || "") ? true : false
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && (
                    <item.icon
                      className="size-5"
                      onClick={() => router.push(item.url)}
                    />
                  )}
                  <span
                    onClick={() => router.push(item.url)}
                    className="font-semibold"
                  >
                    {item.title}
                  </span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubButton key={subItem.title}>
                      <Link href={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
