import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectRoles";
import { UserRoleType } from "@/types/auth";

export function RoleSelector({
  placeholder,
  label,
  itens,
  value,
  onChange,
}: {
  placeholder?: string;
  label: string;
  itens: UserRoleType[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="!inline-flex !items-center !rounded-md !border !px-2.5 !py-0.5 !text-xs !font-semibold !transition-colors focus:!outline-none focus:!ring-2 focus:!ring-ring focus:!ring-offset-2 !text-foreground">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {itens.map((item, i) => (
            <SelectItem key={i} value={String(item.id)}>
              {item.role}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
