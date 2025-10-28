import {
  ClassroomConfigClassTypesT,
  ClassroomConfigJustificationT,
  ClassroomConfigModulesT,
  ClassroomConfigUserModeT,
} from ".";

export interface ClassroomConfigT {
  id: string;
  classroom_id: string;
  modules: Array<ClassroomConfigModulesT>;
  class_types: Array<ClassroomConfigClassTypesT>;
  justifications: Array<ClassroomConfigJustificationT>;
  user_modes: Array<ClassroomConfigUserModeT>;
}
