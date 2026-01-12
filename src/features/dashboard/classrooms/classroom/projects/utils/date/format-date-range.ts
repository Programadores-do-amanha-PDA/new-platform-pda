import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

// Extended type to handle both DateRange and the project's schedule format
export type ExtendedDateRange = 
  | DateRange 
  | { from: Date | string; to?: Date | string | undefined }
  | undefined;

/**
 * Formats a date range period for display
 * @param dateRange - The date range to format
 * @param fallbackText - Text to display when date range is not defined
 * @returns Formatted date range string
 */
export const formatDateRangePeriod = (
  dateRange: ExtendedDateRange,
  fallbackText: string = "Período não definido"
): string => {
  if (!dateRange?.from || !dateRange?.to) return fallbackText;

  const fromDate = dateRange.from instanceof Date 
    ? dateRange.from 
    : new Date(dateRange.from);
  
  const toDate = dateRange.to instanceof Date 
    ? dateRange.to 
    : new Date(dateRange.to);

  const fromFormatted = format(fromDate, "dd/MM/yyyy", { locale: ptBR });
  const toFormatted = format(toDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return `${fromFormatted} - ${toFormatted}`;
};