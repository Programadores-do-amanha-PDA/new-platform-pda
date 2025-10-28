"use client";

import { ClassroomOverviewData } from "@/types/classroom-overview";
import { ClassroomConfigModulesT } from "@/features/dashboard/classroom-configs/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface ClassroomOverviewTableProps {
  data: ClassroomOverviewData;
  modules?: ClassroomConfigModulesT[];
  onDateRangeChange?: (dateRange: { from: Date; to: Date }) => void;
  onUserModeChange?: (studentId: string, userModeId: string) => void;
}

export function ClassroomOverviewTable({
  data,
  modules = [],
  onDateRangeChange,
  onUserModeChange,
}: ClassroomOverviewTableProps) {
  const columns = createColumns(data, onUserModeChange);

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
