"use client";
import { useRouter } from "next/navigation";
import { EllipsisVertical, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

import { useAuth } from "@/features/shared/auth";
import { AuthUserWithProfile } from "@/features/dashboard/shared/profile";

export default function NavUser({ user }: { user: AuthUserWithProfile }) {
    const router = useRouter();
    const { handleSignOut } = useAuth();
    const { isMobile } = useSidebar();

    return (
        <SidebarMenu className="flex w-full h-max">
            <SidebarMenuItem className="flex w-full h-max">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent rounded-lg data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                        >
                            <Avatar className="rounded-lg w-8 h-8">
                                <AvatarImage src={user?.profile?.avatar_url || ""} alt="" />
                                <AvatarFallback className="rounded-lg">
                                    {user?.profile?.full_name
                                        ?.split(" ")
                                        .slice(0, 3)
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 grid text-sm text-left leading-tight">
                                <span className="font-semibold truncate">{user?.profile?.full_name}</span>
                                <span className="text-xs truncate">{user?.email}</span>
                            </div>
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
                                <Avatar className="rounded-lg w-8 h-8">
                                    <AvatarImage src={user?.profile?.avatar_url || ""} alt="" />
                                    <AvatarFallback>
                                        {user?.profile?.full_name
                                            ?.split(" ")
                                            .slice(0, 3)
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 grid text-sm text-left leading-tight">
                                    <span className="font-semibold truncate">{user?.profile?.full_name}</span>
                                    <span className="text-xs truncate">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/profile`)}>
                                <User />
                                Perfil
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut />
                            Desconectar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
