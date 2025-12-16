
export interface ProfileFormDataT {
  fullName: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  bio: string;
}

export type ProfileFormSchemaT = {
  fullName: string;
  email: string;
  newPassword?: string;
  confirmNewPassword?: string;
  bio?: string;
};
