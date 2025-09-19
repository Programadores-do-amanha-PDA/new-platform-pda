import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formats a date range for display in the date interval picker
 * @param date - The date range to format
 * @returns Formatted date range string
 */
export const formatDateRange = (date: DateRange | undefined): string => {
  if (!date?.from) return "Selecione um intervalo";
  
  if (date.to) {
    return `${format(date.from, "LLL dd, y", { locale: ptBR })} - ${format(date.to, "LLL dd, y", { locale: ptBR })}`;
  }
  
  return format(date.from, "LLL dd, y", { locale: ptBR });
};

/**
 * Formats a single date using the Brazilian Portuguese locale
 * @param date - The date to format
 * @param pattern - The format pattern (defaults to "LLL dd, y")
 * @returns Formatted date string
 */
export const formatDate = (date: Date, pattern: string = "LLL dd, y"): string => {
  return format(date, pattern, { locale: ptBR });
};