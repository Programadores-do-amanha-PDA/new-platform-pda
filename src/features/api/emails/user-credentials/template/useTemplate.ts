import shortIDItem from "./components/short-id-item";
import shortIDList from "./components/short-id-list";

export type UsersCredentialsValuesT = {
  to_name: string;
  to_email: string;
  short_ids: string[];
};

type TypeUsersCredentialsTemplate = {
  htmlTemplate: {
    text: string;
    keys: string[];
  };
  values: UsersCredentialsValuesT;
};

export const getUsersCredentialsTemplate = ({
  htmlTemplate,
  values,
}: TypeUsersCredentialsTemplate) => {
  let emailTemplate = htmlTemplate.text;

  for (let i = 0; i < htmlTemplate.keys.length; i++) {
    const key = htmlTemplate.keys[i];

    if (key === "shortIDsList") {
      if (Array.isArray(values.short_ids)) {
        const shortIdsItens = values.short_ids.map((shortId) => {
          const item = shortIDItem(shortId);
          return item;
        });

        const shortIDsList = shortIDList(shortIdsItens);

        emailTemplate = emailTemplate.replace(`[[shortIDsList]]`, shortIDsList);
      }
    }
    if (key === "toName") {
      emailTemplate = emailTemplate.replace(`[[toName]]`, values.to_name);
    }
    if (key === "toEmail") {
      emailTemplate = emailTemplate.replace(`[[toEmail]]`, values.to_email);
    }
  }

  return emailTemplate;
};
