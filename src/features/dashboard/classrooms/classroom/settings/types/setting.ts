import {
  ClassTypes,
  SettingJustification,
  ClassModules,
  UserMode,
} from ".";

export interface ClassSetting {
  id: string;
  classroom_id: string;
  modules: Array<ClassModules>;
  class_types: Array<ClassTypes>;
  justifications: Array<SettingJustification>;
  user_modes: Array<UserMode>;
}
