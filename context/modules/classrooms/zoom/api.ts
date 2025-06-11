import {
  ZoomMeetingParticipantType,
  ZoomMeetingPollResultQuestionDetails,
  ZoomMeetingPollResults,
  ZoomMeetingType,
} from "@/types/zoom/meetings";
import { useState } from "react";
import { toast } from "sonner";
import { ZoomAccountMeType, ZoomAccountType } from "@/types/zoom/accounts";
import {
  getAllMeetingsByAccount,
  getMeetingById,
  getPastedMeetingParticipants,
  getPastMeetingInstances,
  getPastMeetingsPollResults,
} from "@/utils/apis/zoom/meetings";
import { getAccessToken } from "@/utils/apis/zoom/oauth";
import { getMeAccount } from "@/utils/apis/zoom/account";

const useZoomAPIMeetingsStack = () => {
  const [meetingsByAPI, setMeetingsByAPI] = useState<
    (ZoomMeetingType | Omit<ZoomMeetingType, "id">)[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleGetZoomMeAccountDataByAPI = async (
    account: Omit<
      ZoomAccountType,
      "id" | "classroom_id" | "me" | "label" | "created_at"
    >
  ) => {
    try {
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");

      setLoading(true);
      const ZOOM_ACCESS_TOKEN = await getAccessToken(account);
      if (!ZOOM_ACCESS_TOKEN) {
        throw new Error("Failed to get access token");
      }

      const meAccount = await getMeAccount(ZOOM_ACCESS_TOKEN);
      if (!meAccount) throw "no me me account response from API";

      return meAccount as Partial<ZoomAccountMeType>;
    } catch (error) {
      console.error("Error fetching me account from Zoom API:", error);
      toast.error(
        "Credenciais da conta inválidas ou não autorizadas. Verifique suas credenciais e tente novamente."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllZoomMeetingsByAPI = async (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >
  ) => {
    let loadingToast;
    try {
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");

      setLoading(true);
      const ZOOM_ACCESS_TOKEN = await getAccessToken(account);
      if (!ZOOM_ACCESS_TOKEN) {
        throw new Error("Failed to get access token");
      }

      loadingToast = toast.loading("Obtendo todas as Reuniões...");
      const meetings = await getAllMeetingsByAccount(ZOOM_ACCESS_TOKEN);
      if (!meetings) throw "no meetings response from API";

      setMeetingsByAPI(
        meetings.map((m) => ({
          ...m,
          account_id: account.id,
        })) as Omit<ZoomMeetingType, "id">[]
      );

      return true;
    } catch {
      toast.error("Falha ao obter todas as reuniões.");
      return false;
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleGetZoomMeetingByAPI = async (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number
  ) => {
    let loadingToast;
    try {
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");
      if (!meetingId) throw new Error("Meeting ID is missing");

      setLoading(true);
      loadingToast = toast.loading("Acessando a conta do Zoom...");
      const ZOOM_ACCESS_TOKEN = await getAccessToken(account);
      if (!ZOOM_ACCESS_TOKEN) {
        throw new Error("Failed to get access token");
      }
      toast.dismiss(loadingToast);

      const encodedMeetingId = encodeURIComponent(
        encodeURIComponent(meetingId)
      );
      loadingToast = toast.loading("Obtendo dados da Reunião...");
      const meeting = await getMeetingById(encodedMeetingId, ZOOM_ACCESS_TOKEN);
      if (!meeting) throw new Error("No meeting data returned from API");
      toast.dismiss(loadingToast);
      toast.success("Dados da Reunião obtido com sucesso!");

      // Lógica para reuniões não recorrentes
      if (meeting.type === 1 || meeting.type === 2) {
        const meetingStartTime = new Date(meeting.start_time || 0).getTime();
        const currentTime = new Date().getTime();

        if (meetingStartTime >= currentTime) {
          return {
            ...meeting,
            participants: [],
            poll_results: [],
            account_id: account.id,
          } as Omit<ZoomMeetingType, "id">;
        } else {
          const participants = await handleGetAllParticipantsByMeetingIdFromAPI(
            account,
            meetingId,
            false
          );
          const pollResults = await handleGetAllPollResultsByMeetingIdFromAPI(
            account,
            meetingId,
            false
          );

          return {
            ...meeting,
            participants: participants || [],
            poll_results: pollResults || [],
            account_id: account.id,
          } as Omit<ZoomMeetingType, "id">;
        }
      } else if (meeting.type === 8) {
        const allPastInstances = await getPastMeetingInstances(
          encodedMeetingId,
          ZOOM_ACCESS_TOKEN
        );
        if (!allPastInstances)
          throw new Error("No past instances data returned from API");

        const pastInstancesData = [];

        for (let i = 0; i < allPastInstances.length; i++) {
          const instance = allPastInstances[i];
          if (!instance.uuid) continue;

          loadingToast = toast.loading(
            `Obtendo Participantes e Respostas da instancia ${i} de ${allPastInstances.length}...`
          );
          const processedInstance = {
            ...instance,
            participants: await handleGetAllParticipantsByMeetingIdFromAPI(
              account,
              instance.uuid,
              true
            ),
            poll_results: await handleGetAllPollResultsByMeetingIdFromAPI(
              account,
              instance.uuid,
              true
            ),
          };
          pastInstancesData.push(processedInstance);
          toast.dismiss(loadingToast);
        }

        return {
          ...meeting,
          past_instances: pastInstancesData,
          account_id: account.id,
        } as Omit<ZoomMeetingType, "id">;
      }
      return meeting;
    } catch (error) {
      console.error("Error fetching Zoom meeting data:", error);
      toast.error("Falha ao buscar reuniões da API do Zoom");
      return null;
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleGetAllParticipantsByMeetingIdFromAPI = async (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number | string,
    isRecurrent: boolean
  ) => {
    let loadingToast;
    try {
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");
      if (!meetingId) throw new Error("Meeting ID is missing");

      setLoading(true);
      const ZOOM_ACCESS_TOKEN = await getAccessToken(account);
      if (!ZOOM_ACCESS_TOKEN) {
        throw new Error("Failed to get access token");
      }
      if (!isRecurrent) toast.dismiss(loadingToast);
      if (!isRecurrent) toast.success("Dados da conta pego com sucesso!");

      const encodedMeetingId = encodeURIComponent(
        encodeURIComponent(meetingId)
      );

      if (!isRecurrent)
        loadingToast = toast.loading("Obtendo os Participantes da Reunião...");
      const participants = await getPastedMeetingParticipants(
        encodedMeetingId,
        ZOOM_ACCESS_TOKEN
      );

      if (!participants || !Array.isArray(participants)) {
        throw new Error("Invalid participants data from API");
      }

      console.log(participants)
      if (!isRecurrent)
        toast.success("Os Participantes da Reunião foram obtidos com sucesso!");
      return participants as ZoomMeetingParticipantType[];
    } catch (error) {
      console.error("Error fetching meeting participants:", error);
      toast.error("Falha ao obter os Participantes da Reunião.");
      return [];
    } finally {
      if (!isRecurrent) toast.dismiss(loadingToast);
    }
  };

  const handleGetAllPollResultsByMeetingIdFromAPI = async (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number | string,
    isRecurrent: boolean
  ) => {
    let loadingToast;
    try {
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");
      if (!meetingId) throw new Error("Meeting ID is missing");

      setLoading(true);
      const ZOOM_ACCESS_TOKEN = await getAccessToken(account);
      if (!ZOOM_ACCESS_TOKEN) {
        throw new Error("Failed to get access token");
      }

      const encodedMeetingId = encodeURIComponent(
        encodeURIComponent(meetingId)
      );

      if (!isRecurrent)
        loadingToast = toast.loading(
          "Obtendo as Respostas das Polls da Reunião..."
        );
      const pollResults = await getPastMeetingsPollResults(
        encodedMeetingId,
        ZOOM_ACCESS_TOKEN
      );

      if (!pollResults || !Array.isArray(pollResults)) {
        throw new Error("Invalid poll results data from API");
      }

      if (!isRecurrent)
        toast.success(
          "Respostas das Polls da Reunião foram obtidas com sucesso!"
        );
      return pollResults.flatMap(
        (p: ZoomMeetingPollResults) => p.questions
      ) as ZoomMeetingPollResultQuestionDetails[];
    } catch (error) {
      console.error("Error fetching poll results:", error);
      toast.error("Falha ao buscar resultados de pesquisas da reunião.");
      return [];
    } finally {
      if (!isRecurrent || loadingToast) toast.dismiss(loadingToast);
    }
  };

  return {
    meetingsByAPI,
    setMeetingsByAPI,
    meetingsByAPILoading: loading,
    handleGetZoomMeAccountDataByAPI,
    handleGetZoomMeetingByAPI,
    handleGetAllZoomMeetingsByAPI,
    handleGetAllParticipantsByMeetingIdFromAPI,
    handleGetAllPollResultsByMeetingIdFromAPI,
  };
};

export interface ZoomAPIMeetingsStackI {
  meetingsByAPI: (ZoomMeetingType | Omit<ZoomMeetingType, "id">)[];
  meetingsByAPILoading: boolean;
  handleGetZoomMeAccountDataByAPI: (
    account: Omit<
      ZoomAccountType,
      "id" | "classroom_id" | "me" | "label" | "created_at"
    >
  ) => Promise<false | Partial<ZoomAccountMeType>>;
  handleGetAllZoomMeetingsByAPI: (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >
  ) => Promise<boolean>;
  handleGetZoomMeetingByAPI: (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number
  ) => Promise<Omit<ZoomMeetingType, "id"> | null>;
  handleGetAllParticipantsByMeetingIdFromAPI: (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number | string,
    isRecurrent: boolean
  ) => Promise<ZoomMeetingParticipantType[]>;
  handleGetAllPollResultsByMeetingIdFromAPI: (
    account: Omit<
      ZoomAccountType,
      "classroom_id" | "me" | "label" | "created_at"
    >,
    meetingId: number,
    isRecurrent: boolean
  ) => Promise<ZoomMeetingPollResultQuestionDetails[]>;
}

export default useZoomAPIMeetingsStack;
