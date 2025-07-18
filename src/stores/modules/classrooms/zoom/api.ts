import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  ZoomMeetingParticipantT,
  ZoomMeetingPollResultsT,
  ZoomMeetingT,
} from "@/types/zoom/meetings";
import { toast } from "sonner";
import axios from "axios";
import { ZoomAccountMeT, ZoomAccountT } from "@/types/zoom/accounts";

interface ZoomAPIState {
  meetingsByAPI: ZoomMeetingT[];
  loading: boolean;
}

interface ZoomAPIActions {
  setMeetingsByAPI: (meetings: ZoomMeetingT[]) => void;
  getZoomMeAccountDataByAPI: (
    account_id: string,
    client_id: string,
    client_secret: string
  ) => Promise<false | Partial<ZoomAccountMeT>>;
  getAllMeetingsByAPI: (account: Partial<ZoomAccountT>) => Promise<boolean>;
  getMeetingByAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingT | null>;
  getAllParticipantsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingParticipantT[]>;
  getAllPollResultsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingPollResultsT[]>;
  reset: () => void;
}

const initialState: ZoomAPIState = {
  meetingsByAPI: [],
  loading: false,
};

export const useZoomAPIStore = create<ZoomAPIState & ZoomAPIActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setMeetingsByAPI: (meetingsByAPI) => set({ meetingsByAPI }),

      getZoomMeAccountDataByAPI: async (
        account_id,
        client_id,
        client_secret
      ) => {
        try {
          set({ loading: true });
          if (!account_id || !client_id || !client_secret)
            throw "no account id provided";
          const { data } = await axios.post(`/api/zoom/${account_id}`, {
            client_id,
            client_secret,
          });
          console.log(data);

          if (!data) throw "no me account response from API";

          return data.results as Partial<ZoomAccountMeT>;
        } catch (error) {
          console.error("Error fetching me account from Zoom API:", error);
          toast.error(
            "Credenciais da conta inválidas ou não autorizadas. Verifique suas credenciais e tente novamente."
          );
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAllMeetingsByAPI: async (account) => {
        try {
          if (
            !account.account_id ||
            !account.client_id ||
            !account.client_secret
          )
            throw "no account id provided";

          set({ loading: true });
          const { data } = await axios.post(
            `/api/zoom/${account.account_id}/meetings`,
            {
              client_id: account.client_id,
              client_secret: account.client_secret,
            }
          );

          if (!data) throw "no meetings response from API";

          set({
            meetingsByAPI: data.results.map((m: ZoomMeetingT) => ({
              ...m,
              account_id: account.id,
            })) as ZoomMeetingT[],
          });
          return true;
        } catch {
          toast.error("Falha ao buscar reuniões da API do Zoom");
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getMeetingByAPI: async (account, meetingId) => {
        try {
          // Verifica se todos os campos necessários estão presentes
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          // Chama a API para obter detalhes da reunião
          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );
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
            const meetingStartTime = new Date(
              data.results.start_time
            ).getTime();
            const currentTime = new Date().getTime();

            if (meetingStartTime >= currentTime) {
              // Reunião futura: retorna dados básicos
              return {
                ...data.results,
                participants: [],
                poll_results: [],
                account_id: account.id,
              } as ZoomMeetingT;
            } else {
              // Reunião passada: busca participantes e pesquisas
              const participants =
                await get().getAllParticipantsByMeetingIdFromAPI(
                  account,
                  encodedMeetingId
                );
              const pollResults =
                await get().getAllPollResultsByMeetingIdFromAPI(
                  account,
                  encodedMeetingId
                );

              return {
                ...data.results,
                participants: participants || [],
                poll_results: pollResults || [],
                account_id: account.id,
              } as ZoomMeetingT;
            }
          }

          return {
            ...data.results,
            account_id: account.id,
          } as ZoomMeetingT;
        } catch (error) {
          console.error("Error fetching Zoom meeting data:", error);
          toast.error("Falha ao buscar reuniões da API do Zoom");
          return null;
        } finally {
          set({ loading: false });
        }
      },

      getAllParticipantsByMeetingIdFromAPI: async (account, meetingId) => {
        try {
          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );

          const { data } = await axios.post(
            `/api/zoom/${account.account_id}/meetings/${encodedMeetingId}/participants`,
            {
              client_id: account.client_id,
              client_secret: account.client_secret,
            }
          );

          if (!data || !Array.isArray(data.results)) {
            throw new Error("Invalid participants data from API");
          }

          return data.results as ZoomMeetingParticipantT[];
        } catch (error) {
          console.error("Error fetching meeting participants:", error);
          toast.error("Falha ao buscar participantes da reunião");
          return [];
        }
      },

      getAllPollResultsByMeetingIdFromAPI: async (account, meetingId) => {
        try {
          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );

          const { data } = await axios.post(
            `/api/zoom/${account.account_id}/meetings/${encodedMeetingId}/polls/results`,
            {
              client_id: account.client_id,
              client_secret: account.client_secret,
            }
          );

          if (!data || !Array.isArray(data.results)) {
            throw new Error("Invalid poll results data from API");
          }

          return data.results as ZoomMeetingPollResultsT[];
        } catch (error) {
          console.error("Error fetching poll results:", error);
          toast.error("Falha ao buscar resultados de pesquisas da reunião");
          return [];
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomAPIStore" }
  )
);
