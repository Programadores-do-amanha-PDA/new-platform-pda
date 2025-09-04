import { DateRange } from "react-day-picker";

export interface ClassroomConfigModulesT {
  id: string;
  title: string;
  interval: DateRange;
  created_at?: string;
  updated_at?: string;
}

export interface ClassroomConfigT {
  id: string;
  classroom_id: string;
  modules: ClassroomConfigModulesT[];
}
