"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface AttendancePaginationControlProps {
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void;
}

export default function AttendancePaginationControl({
  onDateRangeChange,
}: AttendancePaginationControlProps) {
  // Inicializa com a semana atual (domingo a sábado)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const today = new Date();
      const weekStart = startOfDay(startOfWeek(today, { weekStartsOn: 0 })); // Domingo
      const weekEnd = endOfDay(endOfWeek(today, { weekStartsOn: 0 })); // Sábado
      return {
        from: weekStart,
        to: weekEnd,
      };
    }
  );

  // Notifica mudanças no intervalo de datas
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      onDateRangeChange({
        from: dateRange.from,
        to: dateRange.to,
      });
    }
  }, [dateRange, onDateRangeChange]);

  const handlePreviousInterval = () => {
    if (dateRange?.from && dateRange?.to) {
      // Calcula a duração do intervalo atual em dias
      const intervalDays = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Move o intervalo para trás pela mesma duração
      const newStart = new Date(dateRange.from);
      newStart.setDate(dateRange.from.getDate() - intervalDays);

      const newEnd = new Date(dateRange.to);
      newEnd.setDate(dateRange.to.getDate() - intervalDays);

      setDateRange({
        from: startOfDay(newStart),
        to: endOfDay(newEnd),
      });
    } else if (dateRange?.from) {
      // Se só tem data inicial, move uma semana para trás
      const previousWeekStart = startOfDay(
        startOfWeek(subWeeks(dateRange.from, 1), { weekStartsOn: 0 })
      );
      const previousWeekEnd = endOfDay(
        endOfWeek(subWeeks(dateRange.from, 1), { weekStartsOn: 0 })
      );
      setDateRange({
        from: previousWeekStart,
        to: previousWeekEnd,
      });
    }
  };

  const handleNextInterval = () => {
    if (dateRange?.from && dateRange?.to) {
      // Calcula a duração do intervalo atual em dias
      const intervalDays = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Move o intervalo para frente pela mesma duração
      const newStart = new Date(dateRange.from);
      newStart.setDate(dateRange.from.getDate() + intervalDays);

      const newEnd = new Date(dateRange.to);
      newEnd.setDate(dateRange.to.getDate() + intervalDays);

      setDateRange({
        from: startOfDay(newStart),
        to: endOfDay(newEnd),
      });
    } else if (dateRange?.from) {
      // Se só tem data inicial, move uma semana para frente
      const nextWeekStart = startOfDay(
        startOfWeek(addWeeks(dateRange.from, 1), { weekStartsOn: 0 })
      );
      const nextWeekEnd = endOfDay(
        endOfWeek(addWeeks(dateRange.from, 1), { weekStartsOn: 0 })
      );
      setDateRange({
        from: nextWeekStart,
        to: nextWeekEnd,
      });
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (newDateRange?.from && newDateRange?.to) {
      // Permite seleção livre de intervalos, ajustando apenas para início e fim do dia
      setDateRange({
        from: startOfDay(newDateRange.from),
        to: endOfDay(newDateRange.to),
      });
    } else if (newDateRange?.from) {
      // Se apenas uma data for selecionada, mantém apenas a data inicial
      setDateRange({
        from: startOfDay(newDateRange.from),
        to: undefined,
      });
    } else {
      setDateRange(newDateRange);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousInterval}
          className="h-8 w-8 p-0 rounded-r-none border-r"
          disabled={!dateRange?.from}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger>
            <Button
              variant="ghost"
              className="h-8 px-3 text-sm font-medium rounded-none border-0 hover:bg-muted/50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange?.from && dateRange?.to ? (
                <>
                  {format(dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : dateRange?.from ? (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                "Selecione período"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextInterval}
          className="h-8 w-8 p-0 rounded-l-none border-l"
          disabled={!dateRange?.from}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
