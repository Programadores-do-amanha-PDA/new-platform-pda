import { DateRange } from "react-day-picker";
import { Locale } from "date-fns";
import { ClassroomConfigModulesT } from "@/types/classroom-configs";

/**
 * Props interface for the DateIntervalPicker component
 */
export interface DateIntervalPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The selected date range */
  date: DateRange | undefined;
  /** Function to update the date range - supports both direct function and React setState dispatch */
  setDate: ((date: DateRange | undefined) => void) | React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  /** Additional CSS classes for the button */
  buttonClassName?: string;
  /** Whether the component is in an error state */
  error?: boolean;
}

/**
 * Date formatting options for the picker
 */
export interface DateFormatOptionsT {
  /** Locale for date formatting */
  locale: Locale;
  /** Date format pattern */
  format: string;
}

/**
 * Default interval type for date pagination control
 */
export type DefaultIntervalTypeT = "manual" | "modules";

/**
 * Props interface for the DateIntervalPaginationControl component
 */
export interface DateIntervalPaginationControlPropsT {
  /** Callback function when date range changes */
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void;
  /** Array of classroom modules for interval selection */
  modules?: ClassroomConfigModulesT[];
  /** Default interval type to use on initialization */
  defaultInterval?: DefaultIntervalTypeT;
}