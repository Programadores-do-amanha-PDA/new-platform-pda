"use client";
import { useRouter } from "next/navigation";
import { EllipsisVertical, LogOut, Pencil } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/utils";
import { TooltipWrapper } from "../tooltip-wrapper";

const NavUser = () => {
    const router = useRouter();
    const { handleSignOut, user, userRole } = useAuth();
    const { isMobile } = useSidebar();

    if (!user) return null;

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
                                <AvatarFallback className="bg-zinc-200 rounded-lg font-bold text-foreground">
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
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg space-y-3 z-50 p-0! pb-2! border-2 border-sidebar overflow-hidden"
                        side={isMobile ? "bottom" : "top"}
                        align={isMobile ? "center" : "start"}
                        sideOffset={4}
                    >
                        <DropdownMenuGroup className="p-0 w-full font-normal">
                            <div className="flex flex-col items-center gap-2 bg-sidebar rounded-b-lg w-full overflow-hidden">
                                <figure className="relative flex flex-col bg-primary w-full h-28 overflow-hidden">
                                    <section className="bottom-0 absolute bg-linear-to-b from-50% from-transparent to-50% to-sidebar px-2 w-full">
                                        <Avatar className="flex flex-col bg-sidebar p-0! border-4 border-sidebar rounded-full size-16">
                                            <AvatarImage src={user.profile?.avatar_url || ""} alt="" />
                                            <AvatarFallback className="bg-zinc-300 font-bold text-foreground">
                                                {user?.profile?.full_name
                                                    ?.split(" ")
                                                    .slice(0, 3)
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </section>
                                </figure>
                                <div className="flex flex-col p-2 px-4 pt-0 w-full text-sm text-left leading-tight bg-sidebar">
                                    <span className="w-full font-black text-base truncate">{user?.profile?.full_name}</span>
                                    <TooltipWrapper title={user?.email || ""}>
                                        <p className="w-full text-xs truncate">{user?.email}</p>
                                    </TooltipWrapper>
                                </div>
                            </div>
                        </DropdownMenuGroup>
                        <DropdownMenuItem
                            className="font-medium mx-2 p-2 bg-sidebar cursor-pointer hover:bg-zinc-100"
                            onClick={() => router.push(`/dashboard/profile`)}
                        >
                            <Pencil className="stroke-foreground" />
                            Editar perfil
                        </DropdownMenuItem>
                        <DropdownMenuGroup className="bg-sidebar mx-2 py-1 rounded-lg! overflow-hidden">
                            <DropdownMenuLabel className="font-semibold text-muted-foreground text-xs">Cargo</DropdownMenuLabel>
                            <DropdownMenuItem className="font-medium flex flex-wrap gap-1 bg-sidebar cursor-default hover:bg-sidebar">
                                <Badge variant="outline" className="bg-transparent font-semibold">
                                    {rolesLabelsOptions.find((role) => role.value === userRole)?.label}
                                </Badge>
                                {user.profile.enrollments &&
                                    user.profile.enrollments.length > 0 &&
                                    user.profile.enrollments.map((enrollment) => (
                                        <Badge
                                            key={enrollment.short_id}
                                            variant="outline"
                                            className="bg-transparent font-semibold"
                                        >
                                            {enrollment.short_id}
                                        </Badge>
                                    ))}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="bg-red-50 hover:bg-red-100 cursor-pointer mx-2 p-2 rounded-lg! overflow-hidden font-medium"
                        >
                            <LogOut className="stroke-foreground" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default NavUser;
