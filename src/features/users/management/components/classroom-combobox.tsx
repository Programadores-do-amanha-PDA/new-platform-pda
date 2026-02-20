import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

const EMPTY_VALUE: string[] = [];

export function ClassroomCombobox({
    placeholder = "Buscar turma...",
    itens,
    value = EMPTY_VALUE,
    onChange,
}: {
    placeholder?: string;
    itens: { value: string; label: string }[];
    value?: string[];
    onChange: (value: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState("");

    const customFilter = (commandValue: string, search: string) => {
        const classroom = itens.find((item) => item.value === commandValue);
        return classroom?.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
    };

    return (
        <Popover modal={true}>
            <PopoverTrigger asChild>
                {value.length > 0 ? (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="w-max! flex items-center justify-center py-1! h-max! px-2!"
                    >
                        <span key={value[0]} className="font-semibold flex gap-1 text-xs">
                            {itens.find((item) => item.value === value[0])?.label}
                            <span className="font-semibold text-muted-foreground">{value.length > 1 && ` +${value.length - 1}`}</span>
                        </span>

                        <ChevronDown className="size-3.5! text-muted-foreground" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="flex items-center justify-center py-1! h-max! w-10!"
                    >
                        <Plus className="size-3! text-muted-foreground" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command filter={customFilter}>
                    <CommandInput placeholder={placeholder} value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>
                            <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma turma encontrada</div>
                        </CommandEmpty>

                        <CommandGroup>
                            {itens.map((classroom) => (
                                <CommandItem
                                    key={classroom.value}
                                    value={classroom.value}
                                    onSelect={(currentValue) => {
                                        const newValue = [...value];
                                        const index = newValue.indexOf(currentValue);
                                        if (index === -1) {
                                            newValue.push(currentValue);
                                        } else {
                                            newValue.splice(index, 1);
                                        }
                                        onChange(newValue);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(classroom.value) ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                    {classroom.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
