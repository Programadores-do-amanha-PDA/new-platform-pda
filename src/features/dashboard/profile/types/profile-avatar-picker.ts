import { AuthUserWithProfileT } from "@/types/auth";

export interface ProfileAvatarPickerPropsT {
  user: AuthUserWithProfileT;
  onUpdateUser: () => void;
}

export interface CropAreaT {
  x: number;
  y: number;
  width: number;
  height: number;
}