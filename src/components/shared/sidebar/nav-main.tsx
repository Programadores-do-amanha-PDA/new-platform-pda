"use client";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

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
import { DynamicLucideIcon } from "../icons/dynamic-lucide-icon";

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
        {items.map((item, i) =>
          item.items && item.items?.length > 0 ? (
            <Collapsible
              key={`sidebar-item-${i}`}
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
                      <div onClick={() => router.push(item.url)}>
                        <DynamicLucideIcon
                          name={item.icon}
                          className="size-4 cursor-pointer"
                        />
                      </div>
                    )}
                    <p
                      onClick={() => router.push(item.url)}
                      className="font-semibold cursor-pointer hover:underline"
                    >
                      {item.title}
                    </p>

                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubButton
                        key={subItem.title}
                        onClick={() => router.push(subItem.url)}
                        className="cursor-pointer hover:underline"
                      >
                        {subItem.title}
                      </SidebarMenuSubButton>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={`sidebar-item-${i}`}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => router.push(item.url)}
              >
                {item.icon && (
                  <div>
                    <DynamicLucideIcon
                      name={item.icon}
                      className="size-4 cursor-pointer"
                    />
                  </div>
                )}
                <p className="font-semibold cursor-pointer hover:underline">
                  {item.title}
                </p>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
