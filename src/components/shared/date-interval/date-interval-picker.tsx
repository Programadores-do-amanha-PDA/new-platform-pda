"use client";

// Global imports
import * as React from "react";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

// Local imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateIntervalPickerProps } from "./types";
import { formatDateRange } from "./utils/date-formatting";

/**
 * A date interval picker component that allows users to select a date range
 * @param props - The component props
 * @returns JSX element for the date interval picker
 */
const DateIntervalPicker: React.FC<DateIntervalPickerProps> = ({
  date,
  setDate,
  className,
  buttonClassName,
  error = false,
  ...props
}) => {
  const handleDateChange = (newDate: DateRange | undefined): void => {
    setDate(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            data-slot="popover-trigger"
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive",
              buttonClassName
            )}
            aria-label="Selecionar intervalo de datas"
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{formatDateRange(date)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            locale={ptBR}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            aria-label="Calendário para seleção de intervalo de datas"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateIntervalPicker;
