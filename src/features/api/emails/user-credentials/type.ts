export type UsersCredentialsValuesT = {
  to_name: string;
  to_email: string;
  short_ids: string[];
};

export type EmailTemplateTypes = {
  email: string;
  subject: string;
  values: UsersCredentialsValuesT;
};