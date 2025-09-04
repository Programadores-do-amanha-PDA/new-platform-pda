"use client";

import { ClassroomOverviewData } from "@/types/classroom-overview";
import { ClassroomConfigModulesT } from "@/types/classroom-configs";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface ClassroomOverviewTableProps {
  data: ClassroomOverviewData;
  modules?: ClassroomConfigModulesT[];
  onDateRangeChange?: (dateRange: { from: Date; to: Date }) => void;
}

export function ClassroomOverviewTable({
  data,
  modules = [],
  onDateRangeChange,
}: ClassroomOverviewTableProps) {
  const columns = createColumns(data);

  return (
    <div className="flex flex-col gap-4 h-full">
      <DataTable
        columns={columns}
        data={data.students}
        fullData={data}
        onDateRangeChange={onDateRangeChange}
        modules={modules}
      />
    </div>
  );
}
