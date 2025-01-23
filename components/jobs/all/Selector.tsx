import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectRoles";

export function Selector({
  placeholder,
  label,
  excludeItens,
  itens,
  value,
  onChange,
}: {
  placeholder?: string;
  label: string;
  value?: string;
  excludeItens?: string[];
  itens: { value: string; label: string }[];
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
          {itens
            .filter((item) => !excludeItens?.includes(item.value))
            .map((item, i) => (
              <SelectItem key={i} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
