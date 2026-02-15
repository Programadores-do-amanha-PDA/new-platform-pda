"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Profile } from "@/features/users/profile/types/profile";

interface MemberSelectionComboboxProps {
    label?: string;
    placeholder?: string;
    users: Profile[];
    selectedUserIds: string[];
    currentUserId: string;
    onChange: (selectedIds: string[]) => void;
    className?: string;
}

export function MemberSelectionCombobox({
    placeholder = "Selecionar membros...",
    label,
    users,
    selectedUserIds,
    currentUserId,
    onChange,
    className,
}: MemberSelectionComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Filter out current user from available options
    const availableUsers = users.filter((user) => user.id !== currentUserId);

    const selectedUsers = availableUsers.filter((user) => selectedUserIds.includes(user.id));

    const handleSelect = (userId: string) => {
        const newSelectedIds = selectedUserIds.includes(userId)
            ? selectedUserIds.filter((id) => id !== userId)
            : [...selectedUserIds, userId];

        onChange(newSelectedIds);
    };

    const handleRemoveMember = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedUserIds.filter((id) => id !== userId));
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Filter users based on search input
    const filteredUsers = availableUsers.filter((user) => {
        if (!inputValue || !user) return true;
        const userEmail = user?.email || "";
        const searchLower = inputValue.toLowerCase();
        return user.full_name.toLowerCase().includes(searchLower) || userEmail.toLowerCase().includes(searchLower);
    });

    return (
        <div className={cn("flex items-start w-full gap4", className)}>
            <div className="space-y-2 w-full">
                {label && <Label className="font-medium text-sm">{label}</Label>}
                <Popover open={open} onOpenChange={setOpen} modal={true}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full">
                            {selectedUsers.length === 0
                                ? placeholder
                                : `${selectedUsers.length} membro${
                                      selectedUsers.length > 1 ? "s" : ""
                                  } selecionado${selectedUsers.length > 1 ? "s" : ""}`}
                            <ChevronDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Buscar por nome ou email..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="py-6 text-muted-foreground text-sm text-center">
                                        Nenhum membro encontrado
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredUsers.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id}
                                            onSelect={() => handleSelect(user.id)}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <Avatar className="relative w-8 h-8">
                                                {selectedUserIds.includes(user.id) && (
                                                    <div className="z-10 absolute flex justify-center items-center bg-primary/70 size-full">
                                                        <Check className="w-4 h-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                                <div></div>
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback className="text-muted-foreground text-xs">
                                                    {getInitials(user.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.full_name}</span>
                                                <span className="text-muted-foreground text-sm">{user.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Selected Members Display */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-col space-y-2 w-full">
                    <p className="font-medium text-sm">({selectedUsers.length}) Membros selecionados:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <Badge key={user.id} variant="outline" className="flex items-center gap-2 p-0! h-10">
                                <Avatar className="ml-2 size-7">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback className="text-muted-foreground text-xs">
                                        {getInitials(user.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{user.full_name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="group hover:bg-destructive/10 rounded-l-none h-full hover:text-destructive-foreground cursor-pointer"
                                    onClick={(e) => handleRemoveMember(user.id, e)}
                                >
                                    <X className="stroke-2 stroke-destructive size-4" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
