"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ActivityClassTypes } from "../types";
import { activityTypes } from "../utils";

interface ActivityTypeSelectorProps {
    value: ActivityClassTypes | undefined;
    handleValueChange: (value: ActivityClassTypes) => void;
}

const ActivityTypeSelector = ({ value, handleValueChange }: ActivityTypeSelectorProps) => {
    return (
        <Select value={value} onValueChange={(value) => handleValueChange(value as ActivityClassTypes)}>
            <SelectTrigger className="w-full h-7! cursor-pointer">
                <SelectValue placeholder="Tipo de atividade" className="h-7" />
            </SelectTrigger>
            <SelectContent>
                {activityTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="cursor-pointer">
                        {type.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default ActivityTypeSelector;
