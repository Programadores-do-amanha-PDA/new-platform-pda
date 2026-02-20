import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import ActivityTypeSelector from "./activity-type-selector";
import { ActivityConfigSectionProps } from "./insert-many-activities-dialog.types";

const InsertManyActivitiesConfigSection = ({
    activityType,
    onActivityTypeChange,
    activityDate,
    onActivityDateChange,
    activityVisible,
    onActivityVisibleChange,
}: Readonly<ActivityConfigSectionProps>) => {
    return (
        <div className="gap-5 grid grid-cols-1 md:grid-cols-3 bg-muted/50 mb-4 p-4 rounded-lg">
            <div className="space-y-2">
                <Label htmlFor="activity-type" className="font-medium text-sm">
                    Tipo da Atividade
                </Label>
                <ActivityTypeSelector value={activityType} handleValueChange={onActivityTypeChange} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="activity-date" className="font-medium text-sm">
                    Data da Atividade
                </Label>
                <Input
                    id="activity-date"
                    type="date"
                    value={activityDate}
                    onChange={(e) => onActivityDateChange(e.target.value)}
                    className="w-full"
                />
            </div>

            <div className="space-y-2">
                <Label className="font-medium text-sm">Visível no Cronograma</Label>
                <div className="flex items-center space-x-2">
                    <Switch checked={activityVisible} onCheckedChange={onActivityVisibleChange} />
                    <span className="text-muted-foreground text-sm">{activityVisible ? "Sim" : "Não"}</span>
                </div>
            </div>
        </div>
    );
};

export default InsertManyActivitiesConfigSection;
