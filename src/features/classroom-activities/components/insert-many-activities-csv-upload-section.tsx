import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { CsvUploadSectionProps } from "./insert-many-activities-dialog.types";

const InsertManyActivitiesCsvUploadSection = ({ onFileChange }: Readonly<CsvUploadSectionProps>) => {
    return (
        <div className="items-center gap-4 grid my-4 w-full">
            <Label
                htmlFor="csv-file"
                className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-sm px-4 py-2 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring w-max h-9 [&_svg]:size-4 font-semibold text-primary-foreground text-sm whitespace-nowrap transition-colors cursor-pointer [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0"
            >
                Selecionar arquivo
            </Label>
            <Input id="csv-file" type="file" accept=".csv" className="hidden" onChange={onFileChange} />
        </div>
    );
};

export default InsertManyActivitiesCsvUploadSection;
