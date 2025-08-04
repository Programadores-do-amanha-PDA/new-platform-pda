"use client";

import { ClassroomOverviewData } from "@/types/classroom-overview";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface ClassroomOverviewTableProps {
  data: ClassroomOverviewData;
}

export function ClassroomOverviewTable({ data }: ClassroomOverviewTableProps) {
  const columns = createColumns(data);

  return <DataTable columns={columns} data={data.students} fullData={data} />;
}
