import {
  ZoomMeetingParticipantType,
  ZoomMeetingPollResults,
  ZoomMeetingType,
} from "@/types/zoom/meettings";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { ZoomAccountMeType, ZoomAccountType } from "@/types/zoom/accounts";

const useZoomAPIMeetingsStack = () => {
  const [meetingsByAPI, setMeetingsByAPI] = useState<ZoomMeetingType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetZoomMeAccountDataByAPI = async (
    account_id: string,
    client_id: string,
    client_secret: string
  ) => {
    try {
      setLoading(true);
      if (!account_id || !client_id || !client_secret)
        throw "no account id provided";
      const { data } = await axios.post(`/api/zoom/${account_id}`, {
        client_id,
        client_secret,
      });
      console.log(data);

      if (!data) throw "no me account response from API";

      return data.results as Partial<ZoomAccountMeType>;
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
    account: Partial<ZoomAccountType>
  ) => {
    try {
      if (!account.account_id || !account.client_id || !account.client_secret)
        throw "no account id provided";

      setLoading(true);
      const { data } = await axios.post(
        `/api/zoom/${account.account_id}/meetings`,
        {
          client_id: account.client_id,
          client_secret: account.client_secret,
        }
      );

      if (!data) throw "no meetings response from API";

      setMeetingsByAPI(
        data.results.map((m: ZoomMeetingType) => ({
          ...m,
          account_id: account.id,
        })) as ZoomMeetingType[]
      );
      return true;
    } catch {
      toast.error("Falha ao buscar reuniões da API do Zoom");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetZoomMeetingByAPI = async (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => {
    try {
      // Verifica se todos os campos necessários estão presentes
      if (!account.account_id) throw new Error("Account ID is missing");
      if (!account.client_id) throw new Error("Client ID is missing");
      if (!account.client_secret) throw new Error("Client Secret is missing");
      if (!meetingId) throw new Error("Meeting ID is missing");

      setLoading(true);

      // Chama a API para obter detalhes da reunião
      const encodedMeetingId = encodeURIComponent(encodeURIComponent(meetingId));
      const { data } = await axios.post(
        `/api/zoom/${account.account_id}/meetings/${encodedMeetingId}`,
        {
          client_id: account.client_id,
          client_secret: account.client_secret,
        }
      );

      if (!data || !data.results)
        throw new Error("No meeting data returned from API");

      // Lógica para reuniões não recorrentes
      if (data.results.type === 1 || data.results.type === 2) {
        const meetingStartTime = new Date(data.results.start_time).getTime();
        const currentTime = new Date().getTime();

        if (meetingStartTime >= currentTime) {
          // Reunião futura: retorna dados básicos
          return {
            ...data.results,
            participants: [],
            poll_results: [],
            account_id: account.id,
          } as ZoomMeetingType;
        } else {
          // Reunião passada: busca participantes e pesquisas
          const participants = await handleGetAllParticipantsByMeetingIdFromAPI(
            account,
            data.results.meeting_id
          );
          const pollResults = await handleGetAllPollResultsByMeetingIdFromAPI(
            account,
            data.results.meeting_id
          );

          return {
            ...data.results,
            participants: participants || [],
            poll_results: pollResults || [],
            account_id: account.id,
          } as ZoomMeetingType;
        }
      }

      return {
        ...data.results,
        account_id: account.id,
      } as ZoomMeetingType;
    } catch (error) {
      console.error("Error fetching Zoom meeting data:", error);
      toast.error("Falha ao buscar reuniões da API do Zoom");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllParticipantsByMeetingIdFromAPI = async (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => {
    try {
      const { data } = await axios.post(
        `/api/zoom/${account.account_id}/meetings/${meetingId}/participants`
      );

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid participants data from API");
      }

      return data as ZoomMeetingParticipantType[];
    } catch (error) {
      console.error("Error fetching meeting participants:", error);
      toast.error("Falha ao buscar participantes da reunião");
      return [];
    }
  };

  const handleGetAllPollResultsByMeetingIdFromAPI = async (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => {
    try {
      const { data } = await axios.post(
        `/api/zoom/${account.account_id}/meetings/${meetingId}/polls/results`
      );

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid poll results data from API");
      }

      return data as ZoomMeetingPollResults[];
    } catch (error) {
      console.error("Error fetching poll results:", error);
      toast.error("Falha ao buscar resultados de pesquisas da reunião");
      return [];
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
  meetingsByAPI: ZoomMeetingType[];
  meetingsByAPILoading: boolean;
  handleGetZoomMeAccountDataByAPI: (
    account_id: string,
    client_id: string,
    client_secret: string
  ) => Promise<false | Partial<ZoomAccountMeType>>;
  handleGetAllZoomMeetingsByAPI: (
    account: Partial<ZoomAccountType>
  ) => Promise<boolean>;
  handleGetZoomMeetingByAPI: (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => Promise<ZoomMeetingType | null>;
  handleGetAllParticipantsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => Promise<ZoomMeetingParticipantType[]>;
  handleGetAllPollResultsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountType>,
    meetingId: number
  ) => Promise<ZoomMeetingPollResults[]>;
}

export default useZoomAPIMeetingsStack;
