"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateTimePickerProps {
  value?: Date;
  /** Callback when date/time changes */
  onChange?: (date: Date | undefined) => void;
  /** Label for the date picker */
  dateLabel?: string;
  /** Label for the time picker */
  timeLabel?: string;
  /** Placeholder text for date button */
  datePlaceholder?: string;
  /** Default time value */
  defaultTime?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  dateLabel = "Date",
  timeLabel = "Time",
  datePlaceholder = "Select date",
  defaultTime = "10:30:00",
  disabled = false,
  className = "",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? value.toTimeString().slice(0, 8) : defaultTime
  );

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTimeValue(value.toTimeString().slice(0, 8));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setOpen(false);

    if (date && onChange) {
      // Combine date with current time
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, seconds);
      onChange(newDateTime);
    } else if (!date && onChange) {
      onChange(undefined);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setTimeValue(newTime);

    if (selectedDate && onChange) {
      // Combine current date with new time
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, seconds || 0);
      onChange(newDateTime);
    }
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          {dateLabel}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button
              type="button"
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
              disabled={disabled}
            >
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : datePlaceholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          {timeLabel}
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
