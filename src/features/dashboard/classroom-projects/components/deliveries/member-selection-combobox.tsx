"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProfileT } from "@/types/auth/user";

interface MemberSelectionComboboxProps {
  placeholder?: string;
  users: ProfileT[];
  selectedUserIds: string[];
  currentUserId: string;
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function MemberSelectionCombobox({
  placeholder = "Selecionar membros...",
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

  const selectedUsers = availableUsers.filter((user) =>
    selectedUserIds.includes(user.id)
  );

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
    if (!inputValue) return true;
    const searchLower = inputValue.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className={cn("space-y-4", className)}>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUsers.length === 0
              ? placeholder
              : `${selectedUsers.length} membro${
                  selectedUsers.length > 1 ? "s" : ""
                } selecionado${selectedUsers.length > 1 ? "s" : ""}`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nome ou email..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-muted-foreground">
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
                    <Avatar className="h-8 w-8 relative">
                      {selectedUserIds.includes(user.id) && (
                        <div className="size-full flex items-center justify-center absolute z-10 bg-primary/70">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div></div>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs text-muted-foreground">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Members Display */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Membros selecionados ({selectedUsers.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="flex items-center gap-2 pr-1 pl-2 py-1"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-xs text-muted-foreground">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{user.full_name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleRemoveMember(user.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
