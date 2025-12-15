import {
  ClassTypes,
  SettingJustification,
  Modules,
  UserMode,
} from ".";

export interface Setting {
  id: string;
  classroom_id: string;
  modules: Array<Modules>;
  class_types: Array<ClassTypes>;
  justifications: Array<SettingJustification>;
  user_modes: Array<UserMode>;
}
