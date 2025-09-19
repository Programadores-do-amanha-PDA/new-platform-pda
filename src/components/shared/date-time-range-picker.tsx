"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { DateTimePicker } from "./date-time-picker";
import { Label } from "@/components/ui/label";

export interface DateTimeRangePickerProps {
  /** The selected date range with times */
  value?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Label for the range picker */
  label?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
}

export function DateTimeRangePicker({
  value,
  onChange,
  label = "Schedule Date Range",
  disabled = false,
  className = "",
}: DateTimeRangePickerProps) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(value?.to);

  // Update internal state when value prop changes
  React.useEffect(() => {
    setFromDate(value?.from);
    setToDate(value?.to);
  }, [value]);

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);

    if (onChange) {
      onChange({
        from: date,
        to: toDate,
      });
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);

    if (onChange) {
      onChange({
        from: fromDate,
        to: date,
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className="space-y-4">
        <div>
          <DateTimePicker
            value={fromDate}
            onChange={handleFromDateChange}
            dateLabel="Data de inicio"
            timeLabel="Hora de inicio"
            datePlaceholder="Selecione um data"
            defaultTime="23:00:00"
            disabled={disabled}
          />
        </div>

        <div>
          <DateTimePicker
            value={toDate}
            onChange={handleToDateChange}
            dateLabel="Data final"
            timeLabel="Hora final"
            datePlaceholder="Selecione uma data"
            defaultTime="23:00:00"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
