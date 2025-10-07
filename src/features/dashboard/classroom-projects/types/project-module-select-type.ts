import React from "react";
import { ClassroomProjectModuleT } from "./";

export interface ProjectModuleSelectProps
  extends React.HTMLAttributes<HTMLSelectElement> {
  classroomId: string;
  value: ClassroomProjectModuleT | "";
  onValueChange: (newValue: ClassroomProjectModuleT) => void;
  name?: string;
  error?: boolean;
}
