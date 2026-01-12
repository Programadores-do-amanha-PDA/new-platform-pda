import { AuthUserWithProfile } from "../../profile";

export interface ProfileAvatarPickerPropsT {
  user: AuthUserWithProfile;
  onUpdateUser: () => void;
}

export interface CropAreaT {
  x: number;
  y: number;
  width: number;
  height: number;
}