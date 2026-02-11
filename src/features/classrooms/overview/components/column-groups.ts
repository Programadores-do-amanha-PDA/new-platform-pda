import { ClassroomOverviewData } from "@/features/classrooms/overview/types";

export interface ColumnGroup {
  id: string;
  label: string | null;
  colspan: number;
  columns: string[];
  columnHeaders?: { [key: string]: string };
}

export function getDescriptiveColumnName(
  columnId: string,
  accessorKey?: string,
  data?: ClassroomOverviewData
): string {
  if (accessorKey?.startsWith("presence.")) {
    const presenceType = accessorKey.split(".")[1];
    switch (presenceType) {
      case "general":
        return "Geral";
      case "programming":
        return "Programação";
      case "english":
        return "Inglês";
      case "softSkills":
        return "Soft Skills";
      case "community":
        return "Comunidade";
      case "employability":
        return "Empregabilidade";
      default:
        return presenceType;
    }
  }

  // Handle activities column
  if (accessorKey === "activities") {
    return "Atividades";
  }

  // Handle attendance columns
  if (columnId?.startsWith("attendance-")) {
    const classTypeId = columnId.replace("attendance-", "");
    const classType = data?.classTypes?.find((ct) => ct.id === classTypeId);
    return classType?.name || `Presença ${classTypeId}`;
  }

  // Handle coodesh columns
  if (columnId?.startsWith("coodesh-")) {
    const testId = columnId.replace("coodesh-", "");
    const test = data?.coodeshTests?.find((t) => t.id === testId);
    return test?.name || `Teste ${testId}`;
  }

  // Handle project columns
  if (columnId?.startsWith("project-")) {
    const projectId = columnId.replace("project-", "");
    const project = data?.projects?.find((p) => p.id === projectId);
    return project?.name || `Projeto ${projectId}`;
  }

  // Handle other columns
  switch (columnId) {
    case "name":
      return "Usuário";
    default:
      return columnId;
  }
}

// Function to determine column groups
export function getColumnGroups(
  columns: Array<{
    id: string;
    columnDef?: { accessorKey?: string; header?: unknown };
  }>,
  data: ClassroomOverviewData
): ColumnGroup[] {
  const groups: ColumnGroup[] = [];
  let currentGroup: ColumnGroup | null = null;

  // Process all columns, visibility will be handled in rendering
  columns.forEach((column) => {
    const columnId = column.id;
    const accessorKey = column.columnDef?.accessorKey;
    const headerName = getDescriptiveColumnName(columnId, accessorKey, data);

    // Check if this column belongs to a group based on accessorKey or columnId
    if (columnId?.startsWith("attendance-")) {
      if (!currentGroup || currentGroup.id !== "attendance") {
        currentGroup = {
          id: "attendance",
          label: "Presença",
          colspan: 0,
          columns: [],
          columnHeaders: {},
        };
        groups.push(currentGroup);
      }
      currentGroup.colspan++;
      currentGroup.columns.push(columnId);
      if (currentGroup.columnHeaders && headerName) {
        currentGroup.columnHeaders[columnId] = headerName;
      }
    } else if (columnId?.startsWith("coodesh-")) {
      if (!currentGroup || currentGroup.id !== "coodesh") {
        currentGroup = {
          id: "coodesh",
          label: "Coodesh",
          colspan: 0,
          columns: [],
          columnHeaders: {},
        };
        groups.push(currentGroup);
      }
      currentGroup.colspan++;
      currentGroup.columns.push(columnId);
      if (currentGroup.columnHeaders && headerName) {
        currentGroup.columnHeaders[columnId] = headerName;
      }
    } else if (columnId?.startsWith("project-")) {
      if (!currentGroup || currentGroup.id !== "projects") {
        currentGroup = {
          id: "projects",
          label: "Projetos",
          colspan: 0,
          columns: [],
          columnHeaders: {},
        };
        groups.push(currentGroup);
      }
      currentGroup.colspan++;
      currentGroup.columns.push(columnId);
      if (currentGroup.columnHeaders && headerName) {
        currentGroup.columnHeaders[columnId] = headerName;
      }
    } else {
      // Individual column (not grouped) - will span 2 rows
      groups.push({
        id: columnId || `column-${groups.length}`,
        label: null, // null means it's an individual column
        colspan: 1,
        columns: [columnId || `column-${groups.length}`],
        columnHeaders: {
          [columnId || `column-${groups.length}`]:
            headerName || columnId || `column-${groups.length}`,
        },
      });
      currentGroup = null;
    }
  });

  return groups;
}
