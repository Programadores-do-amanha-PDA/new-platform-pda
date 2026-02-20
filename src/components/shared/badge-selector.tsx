import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-roles";

const BadgeSelector = ({
  placeholder,
  label,
  items,
  excludeItens,
  value,
  onChange,
}: {
  placeholder?: string;
  items: { label: string; value: string }[];
  label: string;
  value?: string;
  excludeItens?: string[];
  onChange: (value: string) => void;
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="inline-flex! items-center! rounded-md! border! px-3! py-1! text-xs! font-semibold! transition-colors! focus:outline-hidden! focus:ring-2! focus:ring-ring! focus:ring-offset-2! text-foreground! bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {items
            .filter((role) => !excludeItens?.includes(role.value))
            .map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default BadgeSelector;
