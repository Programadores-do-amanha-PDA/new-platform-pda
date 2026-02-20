import { Profile } from "./profile";

export interface ProfileAvatarPickerPropsT {
  userProfile: Profile;
  onUpdateUser: () => void;
}

export interface CropAreaT {
  x: number;
  y: number;
  width: number;
  height: number;
}