"use client";

import { useEffect, useState, type JSX } from "react";
import { ChevronLeft, ChevronRight, Cog, Check } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { DateIntervalPaginationControlPropsT, DefaultIntervalTypeT } from "./types";
import {
    getCurrentModule,
    calculatePreviousInterval,
    calculateNextInterval,
    normalizeDateRange,
    getInitialDateRange,
    getCurrentWeekRange,
} from "./utils";

export default function DateIntervalPaginationControl({
    onDateRangeChange,
    modules = [],
    defaultInterval = "manual",
}: DateIntervalPaginationControlPropsT): JSX.Element {
    const [selectedModule, setSelectedModule] = useState<string>();
    const [intervalType, setIntervalType] = useState<DefaultIntervalTypeT>();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Initialize with current module if defaultInterval is "modules"
    useEffect((): void => {
        if (defaultInterval === "modules" && modules.length > 0) {
            const currentModuleId = getCurrentModule(modules);
            if (currentModuleId !== "manual") {
                setSelectedModule(currentModuleId);
                setIntervalType("modules");
            } else {
                // If no current module, use manual mode with current week
                setSelectedModule("manual");
                setIntervalType("manual");
            }
        } else {
            setSelectedModule("manual");
            setIntervalType("manual");
        }

        setDateRange(getInitialDateRange(defaultInterval, modules));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Notify date range changes
    useEffect((): void => {
        if (dateRange?.from && dateRange?.to) {
            onDateRangeChange({
                from: dateRange.from,
                to: dateRange.to,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    const handlePreviousInterval = (): void => {
        const previousInterval = calculatePreviousInterval(dateRange);
        if (previousInterval) {
            setDateRange(previousInterval);
        }
    };

    const handleNextInterval = (): void => {
        const nextInterval = calculateNextInterval(dateRange);
        if (nextInterval) {
            setDateRange(nextInterval);
        }
    };

    const handleDateRangeChange = (newDateRange: DateRange | undefined): void => {
        const normalizedRange = normalizeDateRange(newDateRange);
        setDateRange(normalizedRange);
        setSelectedModule(""); // Reset module selection when manually changing dates
    };

    // Wrapper function that matches the expected Dispatch type for DateIntervalPicker
    const handleDatePickerChange: React.Dispatch<React.SetStateAction<DateRange | undefined>> = (value): void => {
        const newDateRange = typeof value === "function" ? value(dateRange) : value;
        handleDateRangeChange(newDateRange);
        setIntervalType("manual");
        setSelectedModule("manual");
    };

    const handleIntervalTypeChange = (type: DefaultIntervalTypeT, moduleId?: string): void => {
        if (type === "manual") {
            setSelectedModule("manual");
            setDateRange(getCurrentWeekRange());
            setIntervalType("manual");
            return;
        }

        if (type === "modules" && moduleId) {
            setSelectedModule(moduleId);
            const selectedModuleData = modules.find((m) => m.id === moduleId);
            if (selectedModuleData?.interval?.from && selectedModuleData?.interval?.to) {
                setDateRange(
                    normalizeDateRange({
                        from: selectedModuleData.interval.from,
                        to: selectedModuleData.interval.to,
                    }),
                );
                setIntervalType("modules");
            }
        }
    };

    const getDisplayTitle = (): JSX.Element | string => {
        if (intervalType === "modules" && selectedModule && selectedModule !== "manual") {
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

    const showNavigationControls: boolean = intervalType === "manual";

    return (
        <div className="flex h-8 items-center border rounded-lg overflow-hidden">
            <div className="flex items-center">
                {showNavigationControls && (
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handlePreviousInterval}
                        className="size-8 p-0"
                        disabled={!dateRange?.from}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                )}

                <span className="text-sm font-semibold w-max min-w-10 text-center">{getDisplayTitle()}</span>

                {showNavigationControls && (
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
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
                    <DropdownMenuLabel className="font-semibold">Tipos de Intervalos</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(): void => handleIntervalTypeChange("manual")}>
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
                                    onClick={(): void => handleIntervalTypeChange("modules", module.id)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{module.title}</span>
                                        {intervalType === "modules" && selectedModule === module.id && (
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
