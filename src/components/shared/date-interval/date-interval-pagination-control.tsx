"use client";

import React, { useEffect, useState, type Dispatch, type SetStateAction, type JSX } from "react";
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
import type { ClassModules } from "@/features/classrooms/settings";
import {
    getCurrentModule,
    calculatePreviousInterval,
    calculateNextInterval,
    normalizeDateRange,
    getInitialDateRange,
    getCurrentWeekRange,
} from "./utils";

interface DisplayTitleProps {
    readonly intervalType: DefaultIntervalTypeT | undefined;
    readonly selectedModule: string | undefined;
    readonly modules: ClassModules[];
    readonly dateRange: DateRange | undefined;
    readonly handleDatePickerChange: Dispatch<SetStateAction<DateRange | undefined>>;
}

function DisplayTitle({
    intervalType,
    selectedModule,
    modules,
    dateRange,
    handleDatePickerChange,
}: Readonly<DisplayTitleProps>): JSX.Element {
    if (intervalType === "modules" && selectedModule && selectedModule !== "manual") {
        const moduleData = modules.find((m) => m.id === selectedModule);
        return <p className="p-2 truncate max-w-52">{moduleData?.title || "Módulo"}</p>;
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

    return <p className="p-2 truncate">Selecione período</p>;
}

export default function DateIntervalPaginationControl({
    onDateRangeChange,
    modules = [],
    defaultInterval = "manual",
}: DateIntervalPaginationControlPropsT): JSX.Element {
    /**
     * Compound state object to batch multiple setState calls and prevent cascading renders.
     */
    const [state, setState] = useState<{
        readonly selectedModule: string | undefined;
        readonly intervalType: DefaultIntervalTypeT | undefined;
        readonly dateRange: DateRange | undefined;
    }>(() => {
        // Initialize state synchronously based on props
        let selectedModuleValue: string | undefined;
        let intervalTypeValue: DefaultIntervalTypeT | undefined;

        if (defaultInterval === "modules" && modules.length > 0) {
            const currentModuleId = getCurrentModule(modules);
            if (currentModuleId !== "manual") {
                selectedModuleValue = currentModuleId;
                intervalTypeValue = "modules";
            } else {
                selectedModuleValue = "manual";
                intervalTypeValue = "manual";
            }
        } else {
            selectedModuleValue = "manual";
            intervalTypeValue = "manual";
        }

        return {
            selectedModule: selectedModuleValue,
            intervalType: intervalTypeValue,
            dateRange: getInitialDateRange(defaultInterval, modules),
        };
    });

    const { selectedModule, intervalType, dateRange } = state;

    // Setter helpers for cleaner code
    const setSelectedModule = (value: string | undefined): void => {
        setState((prev) => ({ ...prev, selectedModule: value }));
    };

    const setIntervalType = (value: DefaultIntervalTypeT | undefined): void => {
        setState((prev) => ({ ...prev, intervalType: value }));
    };

    const setDateRange = (value: DateRange | undefined): void => {
        setState((prev) => ({ ...prev, dateRange: value }));
    };

    // Notify date range changes
    useEffect((): void => {
        if (dateRange?.from && dateRange?.to) {
            onDateRangeChange({
                from: dateRange.from,
                to: dateRange.to,
            });
        }
    }, [dateRange, onDateRangeChange]);

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

    const showNavigationControls: boolean = intervalType === "manual";

    return (
        <div className="flex h-9 items-center border rounded-lg overflow-hidden">
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

                <DisplayTitle
                    intervalType={intervalType}
                    selectedModule={selectedModule}
                    modules={modules}
                    dateRange={dateRange}
                    handleDatePickerChange={handleDatePickerChange}
                />

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
                <DropdownMenuTrigger asChild>
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
