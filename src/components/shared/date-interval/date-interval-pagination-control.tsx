"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Cog, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DateIntervalPicker from "./date-interval-picker";
import { ClassroomConfigModulesT } from "@/types/classroom-configs";
import { Separator } from "@/components/ui/separator";

type DefaultIntervalType = "manual" | "modules";

interface DateIntervalPaginationControlProps {
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void;
  modules?: ClassroomConfigModulesT[];
  defaultInterval?: DefaultIntervalType;
}

export default function DateIntervalPaginationControl({
  onDateRangeChange,
  modules = [],
  defaultInterval = "manual",
}: DateIntervalPaginationControlProps) {
  const getCurrentModule = useCallback((): string => {
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
  }, [modules]);

  const [selectedModule, setSelectedModule] = useState<string>(
    defaultInterval === "manual" ? "manual" : ""
  );
  const [intervalType, setIntervalType] = useState<"manual" | "modules">(
    defaultInterval === "manual" ? "manual" : "modules"
  );

  // Inicializar com o módulo atual se defaultInterval for "modules"
  useEffect(() => {
    if (defaultInterval === "modules" && modules.length > 0) {
      const currentModuleId = getCurrentModule();
      if (currentModuleId !== "manual") {
        setSelectedModule(currentModuleId);
        setIntervalType("modules");
      } else {
        // Se não há módulo atual, usar modo manual com semana atual
        setSelectedModule("manual");
        setIntervalType("manual");
        setDateRange(getCurrentWeekRange());
      }
    }
  }, [defaultInterval]);

  const getCurrentWeekRange = (): DateRange => {
    const today = new Date();
    const weekStart = startOfDay(startOfWeek(today, { weekStartsOn: 0 }));
    const weekEnd = endOfDay(endOfWeek(today, { weekStartsOn: 0 }));
    return { from: weekStart, to: weekEnd };
  };

  const getCurrentModuleRange = (): DateRange => {
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

  const getInitialDateRange = (): DateRange => {
    return defaultInterval === "modules"
      ? getCurrentModuleRange()
      : getCurrentWeekRange();
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getInitialDateRange
  );

  // Notifica mudanças no intervalo de datas
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      onDateRangeChange({
        from: dateRange.from,
        to: dateRange.to,
      });
    }
  }, [dateRange]);

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
      setDateRange({
        from: startOfDay(newDateRange.from),
        to: endOfDay(newDateRange.to),
      });
    } else if (newDateRange?.from) {
      setDateRange({
        from: startOfDay(newDateRange.from),
        to: undefined,
      });
    } else {
      setDateRange(newDateRange);
    }
    setSelectedModule(""); // Reset module selection when manually changing dates
  };

  // Wrapper function that matches the expected Dispatch type for DateIntervalPicker
  const handleDatePickerChange: React.Dispatch<
    React.SetStateAction<DateRange | undefined>
  > = (value) => {
    const newDateRange = typeof value === "function" ? value(dateRange) : value;
    handleDateRangeChangeWrapper(newDateRange);
  };

  const handleIntervalTypeChange = (
    type: "manual" | "modules",
    moduleId?: string
  ) => {
    if (type === "manual") {
      setSelectedModule("manual");
      setDateRange(getCurrentWeekRange());
      setIntervalType("manual");
      return;
    }

    if (type === "modules" && moduleId) {
      setSelectedModule(moduleId);
      const selectedModuleData = modules.find((m) => m.id === moduleId);
      if (
        selectedModuleData?.interval?.from &&
        selectedModuleData?.interval?.to
      ) {
        setDateRange({
          from: startOfDay(selectedModuleData.interval.from),
          to: endOfDay(selectedModuleData.interval.to),
        });
        setIntervalType("modules");
      }
    }
  };

  const handleDateRangeChangeWrapper = (
    newDateRange: DateRange | undefined
  ) => {
    handleDateRangeChange(newDateRange);
    setIntervalType("manual");
    setSelectedModule("manual");
  };

  const getDisplayTitle = () => {
    if (
      intervalType === "modules" &&
      selectedModule &&
      selectedModule !== "manual"
    ) {
      const moduleData = modules.find((m) => m.id === selectedModule);
      return moduleData?.title || "Módulo";
    }

    if ((dateRange?.from && dateRange?.to) || dateRange?.from) {
      return (
        <DateIntervalPicker
          date={dateRange}
          setDate={handleDatePickerChange}
          buttonClassName="h-8 w-max border-0! shadow-none! rounded-none! border-x!"
        />
      );
    }

    return "Selecione período";
  };

  const showNavigationControls = intervalType === "manual";

  return (
    <div className="flex h-8 items-center border rounded-lg overflow-hidden">
      <div className="flex items-center">
        {showNavigationControls && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              handlePreviousInterval();
            }}
            className="size-8 p-0"
            disabled={!dateRange?.from}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        )}

        <span className="text-sm font-semibold w-max min-w-10 text-center">
          {getDisplayTitle()}
        </span>

        {showNavigationControls && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextInterval();
            }}
            className="size-8 p-0 rounded-none"
            disabled={!dateRange?.from}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Separator orientation="vertical" />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="sm" variant="ghost" className="size-8 p-0 rounded-none">
            <Cog className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel className="font-semibold">
            Tipos de Intervalos
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleIntervalTypeChange("manual")}>
            <div className="flex items-center justify-between w-full">
              <span>Manual</span>
              {intervalType === "manual" && <Check className="h-4 w-4" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center justify-between w-full">
                <span>Módulos</span>
                {intervalType === "modules" && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="w-[230px]">
              {modules.map((module) => (
                <DropdownMenuItem
                  key={module.id}
                  onClick={() => handleIntervalTypeChange("modules", module.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{module.title}</span>
                    {intervalType === "modules" &&
                      selectedModule === module.id && (
                        <Check className="h-4 w-4" />
                      )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
