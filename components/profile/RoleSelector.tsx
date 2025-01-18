import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectRoles";
import { app_role } from "@/utils/supabase/enumeratedTypes/app_role";

export function RoleSelector({
  placeholder,
  label,
  excludeItens,
  value,
  onChange,
}: {
  placeholder?: string;
  label: string;
  value?: string;
  excludeItens?: string[];
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
          {app_role.filter((role) => !excludeItens?.includes(role)).map((item, i) => (
            <SelectItem key={i} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
