import { AuthUserWithProfile } from "@/types/auth";

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