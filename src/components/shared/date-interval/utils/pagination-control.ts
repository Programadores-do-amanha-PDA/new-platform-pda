import { DateRange } from "react-day-picker";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import { getCurrentWeekRange } from "./intervals";
import { ClassModules } from "@/features/classrooms/settings";

/**
 * Gets the current module based on today's date
 */
export const getCurrentModule = (
  modules: ClassModules[]
): string => {
  if (!modules.length) return "manual";

  const today = new Date();
  const currentModules = modules.filter((module) => {
    if (!module.interval?.from || !module.interval?.to) return false;
    return isWithinInterval(today, {
      start: module.interval.from,
      end: module.interval.to,
    });
  });

  if (!currentModules.length) return "manual";

  // Se houver múltiplos módulos, seleciona o último criado (created_at)
  const latestModule = currentModules.reduce((latest, current) => {
    if (!latest.created_at) return current;
    if (!current.created_at) return latest;
    return new Date(current.created_at) > new Date(latest.created_at)
      ? current
      : latest;
  });

  return latestModule?.id || "manual";
};

/**
 * Calculates the previous interval based on current date range
 */
export const calculatePreviousInterval = (
  dateRange: DateRange | undefined
): DateRange | undefined => {
  if (!dateRange?.from) return undefined;

  if (dateRange.to) {
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

    return {
      from: startOfDay(newStart),
      to: endOfDay(newEnd),
    };
  }

  // Se só tem data inicial, move uma semana para trás
  const previousWeekStart = startOfDay(
    startOfWeek(subWeeks(dateRange.from, 1), { weekStartsOn: 0 })
  );
  const previousWeekEnd = endOfDay(
    endOfWeek(subWeeks(dateRange.from, 1), { weekStartsOn: 0 })
  );

  return {
    from: previousWeekStart,
    to: previousWeekEnd,
  };
};

/**
 * Calculates the next interval based on current date range
 */
export const calculateNextInterval = (
  dateRange: DateRange | undefined
): DateRange | undefined => {
  if (!dateRange?.from) return undefined;

  if (dateRange.to) {
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

    return {
      from: startOfDay(newStart),
      to: endOfDay(newEnd),
    };
  }

  // Se só tem data inicial, move uma semana para frente
  const nextWeekStart = startOfDay(
    startOfWeek(addWeeks(dateRange.from, 1), { weekStartsOn: 0 })
  );
  const nextWeekEnd = endOfDay(
    endOfWeek(addWeeks(dateRange.from, 1), { weekStartsOn: 0 })
  );

  return {
    from: nextWeekStart,
    to: nextWeekEnd,
  };
};

/**
 * Normalizes date range to ensure proper start and end of day
 */
export const normalizeDateRange = (
  dateRange: DateRange | undefined
): DateRange | undefined => {
  if (!dateRange) return undefined;

  if (dateRange.from && dateRange.to) {
    return {
      from: startOfDay(dateRange.from),
      to: endOfDay(dateRange.to),
    };
  }

  if (dateRange.from) {
    return {
      from: startOfDay(dateRange.from),
      to: undefined,
    };
  }

  return dateRange;
};

/**
 * Gets the initial date range based on default interval type and modules
 */
export const getInitialDateRange = (
  defaultInterval: "manual" | "modules",
  modules: ClassModules[]
): DateRange => {
  if (defaultInterval === "modules" && modules.length > 0) {
    const currentModuleId = getCurrentModule(modules);
    if (currentModuleId !== "manual") {
      const moduleData = modules.find((m) => m.id === currentModuleId);
      if (moduleData?.interval?.from && moduleData?.interval?.to) {
        return {
          from: startOfDay(moduleData.interval.from),
          to: endOfDay(moduleData.interval.to),
        };
      }
    }
  }

  return getCurrentWeekRange();
};
