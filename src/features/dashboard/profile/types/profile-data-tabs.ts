import { AuthUserWithProfileT } from "@/types";

export interface ProfileDataTabsPropsT {
  currentUser: AuthUserWithProfileT;
  onUpdateUser: () => void;
}
