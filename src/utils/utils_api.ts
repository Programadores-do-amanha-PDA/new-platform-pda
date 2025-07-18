import axios from "axios";

const useAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_UTILS_API_PATH || "",
  timeout: 105000,
  headers: { "X-Custom-Header": "foobar", "Content-Type": "application/json" },
});

export const connectUseAPI = async () => {
  return useAxios
    .get("/")
    .then(() => true)
    .catch((e) => {
      console.error(e);
      return false;
    });
};

export const SendMessageOnDiscord = async ({
  message,
  channel,
}: {
  message: string;
  channel: string;
}) => {
  const options = {
    method: "POST",
    url: "/discord/send",
    data: {
      message,
      channel,
    },
  };

  return useAxios.request(options);
};
