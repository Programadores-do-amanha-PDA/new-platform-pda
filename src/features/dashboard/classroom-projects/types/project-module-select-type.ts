import { ClassroomProjectModuleT } from "@/types";
import React from "react";

export interface ProjectModuleSelectProps
  extends React.HTMLAttributes<HTMLSelectElement> {
  classroomId: string;
  value: ClassroomProjectModuleT | "";
  onValueChange: (newValue: ClassroomProjectModuleT) => void;
  name?: string;
}
