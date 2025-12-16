import { AuthUserWithProfile } from "./profile";

export interface ProfileDataTabsPropsT {
  currentUser: AuthUserWithProfile;
  onUpdateUser: () => void;
}
