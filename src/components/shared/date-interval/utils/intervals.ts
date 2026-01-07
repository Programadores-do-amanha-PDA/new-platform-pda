import { ClassModules } from "@/features/dashboard/classrooms/classroom/settings";
import {
  endOfDay,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";

export const getCurrentWeekRange = (): DateRange => {
  const today = new Date();
  const weekStart = startOfDay(startOfWeek(today, { weekStartsOn: 0 }));
  const weekEnd = endOfDay(endOfWeek(today, { weekStartsOn: 0 }));
  return { from: weekStart, to: weekEnd };
};

export const getCurrentModuleRange = (
  modules: ClassModules[]
): DateRange => {
  if (!modules.length) return getCurrentWeekRange();

  const today = new Date();
  const currentModules = modules.filter((module) => {
    if (!module.interval?.from || !module.interval?.to) return false;
    return isWithinInterval(today, {
      start: module.interval.from,
      end: module.interval.to,
    });
  });

  if (!currentModules.length) return getCurrentWeekRange();

  // Se houver múltiplos módulos, seleciona o último criado (created_at)
  const latestModule = currentModules.reduce((latest, current) => {
    if (!latest.created_at) return current;
    if (!current.created_at) return latest;
    return new Date(current.created_at) > new Date(latest.created_at)
      ? current
      : latest;
  });

  if (latestModule?.interval?.from && latestModule?.interval?.to) {
    return {
      from: startOfDay(latestModule.interval.from),
      to: endOfDay(latestModule.interval.to),
    };
  }

  return getCurrentWeekRange();
};
