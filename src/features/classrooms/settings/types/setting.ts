import {
  ClassTypes,
  SettingJustification,
  ClassModules,
  UserMode,
} from ".";

export interface ClassroomSetting {
  id: string;
  classroom_id: string;
  modules: Array<ClassModules>;
  class_types: Array<ClassTypes>;
  justifications: Array<SettingJustification>;
  user_modes: Array<UserMode>;
}
