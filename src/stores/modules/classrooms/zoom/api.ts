"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  ZoomMeetingParticipantT,
  ZoomMeetingPollResultsT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
} from "@/types/classroom-zoom/meetings";
import { ZoomMeetingPastInstanceT } from "@/types/classroom-zoom/past-instances";
import { toast } from "sonner";
import { ZoomAccountMeT, ZoomAccountT } from "@/types";
import {
  getAllMeetingsByAccount,
  getMeetingById,
  getPastedMeetingParticipants,
  getPastMeetingsPollResults,
  getPastMeetingInstances,
} from "@/app/apis/zoom/meetings";
import { getAccessToken } from "@/app/apis/zoom/oauth";
import { getMeAccount } from "@/app/apis/zoom/account";

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
    meetingId: number
  ) => Promise<
    | ZoomMeetingT
    | Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">
    | null
  >;
  getAllParticipantsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingParticipantT[]>;
  getAllPollResultsByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingPollResultsT[]>;
  getAllPastInstanciesByMeetingIdFromAPI: (
    account: Partial<ZoomAccountT>,
    meetingId: number | string
  ) => Promise<ZoomMeetingPastInstanceT[]>;
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
          if (!account_id) throw new Error("Account ID is missing");
          if (!client_id) throw new Error("Client ID is missing");
          if (!client_secret) throw new Error("Client Secret is missing");

          set({ loading: true });

          const account = { account_id, client_id, client_secret };
          const ZOOM_ACCESS_TOKEN = await getAccessToken(account);

          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          const meAccount = await getMeAccount(ZOOM_ACCESS_TOKEN);

          if (!meAccount) throw new Error("no me account response from API");

          return meAccount as Partial<ZoomAccountMeT>;
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
        let loadingToast;
        try {
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");

          set({ loading: true });

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          loadingToast = toast.loading("Obtendo todas as Reuniões...");
          const meetings = await getAllMeetingsByAccount(ZOOM_ACCESS_TOKEN);

          if (!meetings) throw new Error("no meetings response from API");

          set({
            meetingsByAPI: meetings.map((m) => ({
              ...m,
              account_id: account.id,
            })) as ZoomMeetingT[],
          });
          return true;
        } catch (error) {
          console.error("Error fetching meetings:", error);
          toast.error("Falha ao obter todas as reuniões.");
          return false;
        } finally {
          set({ loading: false });
          toast.dismiss(loadingToast);
        }
      },

      getMeetingByAPI: async (account, meetingId) => {
        let loadingToast;
        try {
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });
          loadingToast = toast.loading("Acessando a conta do Zoom...");

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          toast.dismiss(loadingToast);
          loadingToast = toast.loading("Obtendo dados da Reunião...");

          const meeting = await getMeetingById(meetingId, ZOOM_ACCESS_TOKEN);
          if (!meeting) throw new Error("No meeting data returned from API");

          // Lógica para reuniões não recorrentes
          if (meeting.type === 1 || meeting.type === 2) {
            const meetingStartTime = new Date(
              meeting.start_time || 0
            ).getTime();
            const currentTime = new Date().getTime();

            if (meetingStartTime >= currentTime) {
              return {
                ...meeting,
                participants: [],
                account_id: account.id,
              } as Omit<ZoomMeetingT, "id" | "created_at">;
            } else {
              const participants =
                await get().getAllParticipantsByMeetingIdFromAPI(
                  account,
                  meetingId
                );
              const pollResults =
                await get().getAllPollResultsByMeetingIdFromAPI(
                  account,
                  meetingId
                );

              return {
                ...meeting,
                participants: participants || [],
                poll_results: pollResults || [],
                account_id: account.id,
              } as Omit<ZoomMeetingT, "id" | "created_at">;
            }
          } else if (meeting.type === 8) {
            const encodedMeetingId = encodeURIComponent(
              encodeURIComponent(meetingId)
            );
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

              // Dismiss previous toast before creating new one
              if (loadingToast) {
                toast.dismiss(loadingToast);
              }

              loadingToast = toast.loading(
                `Obtendo Participantes e Respostas da instância ${i + 1} de ${
                  allPastInstances.length
                }...`
              );

              try {
                const processedInstance = {
                  ...instance,
                  participants:
                    await get().getAllParticipantsByMeetingIdFromAPI(
                      account,
                      instance.uuid
                    ),
                  poll_results: await get().getAllPollResultsByMeetingIdFromAPI(
                    account,
                    instance.uuid
                  ),
                };
                pastInstancesData.push(processedInstance);
              } catch (error) {
                console.error(`Error processing instance ${i + 1}:`, error);
                // Continue with next instance even if one fails
              }
            }

            // Ensure final toast is dismissed
            if (loadingToast) {
              toast.dismiss(loadingToast);
            }

            return {
              ...meeting,
              account_id: account.id,
              past_instances: pastInstancesData,
            } as Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">;
          }

          toast.dismiss(loadingToast);
          toast.success("Dados da Reunião obtido com sucesso!");

          return {
            ...meeting,
            account_id: account.id,
          } as ZoomMeetingT;
        } catch (error) {
          console.error("Error fetching Zoom meeting data:", error);
          toast.error("Falha ao buscar reuniões da API do Zoom");
          return null;
        } finally {
          set({ loading: false });
          toast.dismiss(loadingToast);
        }
      },

      getAllParticipantsByMeetingIdFromAPI: async (account, meetingId) => {
        let loadingToast;
        try {
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );
          loadingToast = toast.loading(
            "Obtendo os Participantes da Reunião..."
          );

          const participants = await getPastedMeetingParticipants(
            encodedMeetingId,
            ZOOM_ACCESS_TOKEN
          );

          if (!participants || !Array.isArray(participants)) {
            throw new Error("Invalid participants data from API");
          }

          toast.success(
            "Os Participantes da Reunião foram obtidos com sucesso!"
          );
          return participants as ZoomMeetingParticipantT[];
        } catch (error) {
          console.error("Error fetching meeting participants:", error);
          toast.error("Falha ao obter os Participantes da Reunião.");
          return [];
        } finally {
          toast.dismiss(loadingToast);
        }
      },

      getAllPollResultsByMeetingIdFromAPI: async (account, meetingId) => {
        let loadingToast;
        try {
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };
          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );
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

          toast.success(
            "Respostas das Polls da Reunião foram obtidas com sucesso!"
          );
          return pollResults.flatMap(
            (p) => p.questions
          ).filter(Boolean) as ZoomMeetingPollResultsT[];
        } catch (error) {
          console.error("Error fetching poll results:", error);
          toast.error("Falha ao buscar resultados de pesquisas da reunião.");
          return [];
        } finally {
          toast.dismiss(loadingToast);
        }
      },

      getAllPastInstanciesByMeetingIdFromAPI: async (account, meetingId) => {
        let loadingToast;
        try {
          if (!account.account_id) throw new Error("Account ID is missing");
          if (!account.id) throw new Error("Account ID is missing");
          if (!account.client_id) throw new Error("Client ID is missing");
          if (!account.client_secret)
            throw new Error("Client Secret is missing");
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );
          loadingToast = toast.loading(
            "Obtendo as Instâncias Passadas da Reunião..."
          );

          const pastInstances = await getPastMeetingInstances(
            encodedMeetingId,
            ZOOM_ACCESS_TOKEN
          );

          if (!pastInstances || !Array.isArray(pastInstances)) {
            throw new Error("Invalid past instances data from API");
          }

          toast.success(
            "Instâncias Passadas da Reunião foram obtidas com sucesso!"
          );
          return pastInstances as ZoomMeetingPastInstanceT[];
        } catch (error) {
          console.error("Error fetching past meeting instances:", error);
          toast.error("Falha ao obter as Instâncias Passadas da Reunião.");
          return [];
        } finally {
          set({ loading: false });
          toast.dismiss(loadingToast);
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomAPIStore" }
  )
);
