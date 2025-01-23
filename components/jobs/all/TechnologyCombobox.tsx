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
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

export function TechnologyCombobox({
  placeholder,
  itens,
  excludeItens,
  value,
  onChange,
}: {
  placeholder?: string;
  itens: { value: string; label: string }[];
  excludeItens?: string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-max px-2"
        >
          <Plus className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            onValueChange={(value) => setInputValue(value)}
            value={inputValue}
          />
          <CommandList>
            <CommandEmpty
              onClick={() => {
                onChange(inputValue);
                setInputValue("");
                setOpen(false);
              }}
              className="p-1 text-foreground"
            >
              {inputValue.length > 0 ? (
                <Button
                  variant={"ghost"}
                  className="relative w-full flex cursor-default gap-2 select-none items-center justify-start rounded-sm px-2 py-1.5 text-sm outline-none font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  {inputValue}
                </Button>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Digite uma tecnologia para adiciona-la!
                </p>
              )}
            </CommandEmpty>

            <CommandGroup>
              {itens
                .filter((item) => !excludeItens?.includes(item.value))
                .map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {framework.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
