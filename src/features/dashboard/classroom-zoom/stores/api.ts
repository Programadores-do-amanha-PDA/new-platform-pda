"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import {
  getAccessToken,
  getMeAccount,
  getAllMeetingsByAccount,
  getMeetingById,
  getPastedMeetingParticipants,
  getPastMeetingsPollResults,
  getPastMeetingInstances,
  getPastedMeetingDetails,
} from "../api";
import {
  ZoomAccountMeT,
  ZoomMeetingParticipantT,
  ZoomMeetingPollResultsT,
  ZoomMeetingT,
  ZoomMeetingWithPastInstancies,
  ZoomMeetingPastInstanceT,
  ZoomAPIStateT,
  ZoomAPIActionsT,
} from "../types";
import {
  NON_RECURRING_MEETING_TYPES,
  RECURRING_MEETING_TYPES,
  validateZoomAccount,
} from "../utils";

const initialState: ZoomAPIStateT = {
  meetingsByAPI: [],
  loading: false,
};

export const useZoomAPIStore = create<ZoomAPIStateT & ZoomAPIActionsT>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setMeetingsByAPI: (meetingsByAPI) => set({ meetingsByAPI }),

      getZoomMeAccountDataByAPI: async (account, forceRefresh = false) => {
        try {
          // Validate account data
          if (!validateZoomAccount(account))
            throw new Error("Invalid account data");

          // Get access token
          const ZOOM_ACCESS_TOKEN = await getAccessToken(account, forceRefresh);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          // Fetch "me" account data from Zoom API
          const meAccount = await getMeAccount(ZOOM_ACCESS_TOKEN);
          if (!meAccount) throw new Error("no me account response from API");

          return meAccount as Partial<ZoomAccountMeT>;
        } catch (error) {
          toast.error(
            "Credenciais da conta inválidas ou não autorizadas. Verifique suas credenciais e tente novamente."
          );
          console.error("Error fetching me account from Zoom API");
          if (error instanceof Error) console.error(error);
          return false;
        }
      },

      getAllMeetingsByAPI: async (account) => {
        let loadingToast;
        try {
          // Validate account data
          if (!validateZoomAccount(account))
            throw new Error("Invalid account data");

          set({ loading: true });

          // Get access token
          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData, true);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          // Fetch all meetings from Zoom API
          loadingToast = toast.loading("Obtendo todas as Reuniões...");
          const meetings = await getAllMeetingsByAccount(ZOOM_ACCESS_TOKEN);
          if (!meetings) throw new Error("no meetings response from API");

          // Add account_id to each meeting for reference
          const newMeetings = meetings.map((m) => ({
            ...m,
            account_id: account.id,
          })) as ZoomMeetingT[];

          set((state) => {
            // Create a map of existing meetings by UUID for faster lookup
            const existingMeetingsMap = new Map(
              state.meetingsByAPI
                .filter((meeting) => meeting.account_id === account.id)
                .map((meeting) => [meeting.uuid, meeting])
            );

            // Filter only truly new meetings to prevent duplicates
            const uniqueNewMeetings = newMeetings.filter(
              (meeting) => !existingMeetingsMap.has(meeting.uuid)
            );

            // Keep meetings from other accounts unchanged
            const meetingsFromOtherAccounts = state.meetingsByAPI.filter(
              (meeting) => meeting.account_id !== account.id
            );

            // Only update if there are actually new meetings to prevent unnecessary re-renders
            if (uniqueNewMeetings.length === 0) {
              return state; // No changes needed
            }

            return {
              meetingsByAPI: [
                ...meetingsFromOtherAccounts,
                ...Array.from(existingMeetingsMap.values()), // Keep existing meetings from this account
                ...uniqueNewMeetings, // Add only new meetings
              ],
            };
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

      getMeetingByAPI: async (account, meetingData) => {
        let loadingToast;
        try {
          // Validate account and meeting data
          if (!validateZoomAccount(account))
            throw new Error("Account data is missing");
          if (!meetingData.meeting_id || !meetingData.uuid)
            throw new Error("Meeting data is missing");

          set({ loading: true });

          // Get access token
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

          const meetingDuration = (meetingData.duration || 0) * 60000;
          const meetingEndTime = new Date(
            new Date(meetingData.start_time!).getTime() + meetingDuration
          ).getTime();
          const now = Date.now();

          // getting meeting data
          loadingToast = toast.loading("Obtendo dados da Reunião...");
          let meeting;

          // Decide which API endpoint to use based on meeting status and type
          if (
            meetingEndTime <= now ||
            (RECURRING_MEETING_TYPES as readonly number[]).includes(
              meetingData.type!
            )
          ) {
            meeting = await getMeetingById(
              meetingData.meeting_id,
              ZOOM_ACCESS_TOKEN
            );
          } else if (meetingEndTime > now) {
            meeting = await getPastedMeetingDetails(
              meetingData.uuid,
              ZOOM_ACCESS_TOKEN
            );
          }
          if (!meeting) {
            throw new Error("No meetingData data returned from API");
          }
          toast.dismiss(loadingToast);

          // processing recurrence or non recurrence meeting data
          const meetingDataProcessed: Omit<ZoomMeetingT, "id" | "created_at"> =
            {
              ...meeting,
              participants: [],
              poll_results: [],
              account_id: account.id,
            };

          // if meeting type is a non recurrence
          if (
            (NON_RECURRING_MEETING_TYPES as readonly number[]).includes(
              meetingData.type!
            )
          ) {
            // if is not a past meeting
            if (meetingEndTime >= now) {
              return meetingDataProcessed;
            }
            // if is a past meeting
            else if (meetingEndTime < now) {
              loadingToast = toast.loading(
                "Obtendo participantes e resultados de polls da reunião..."
              );
              const [participants, pollResults] = await Promise.all([
                get().getAllParticipantsByMeetingIdFromAPI(
                  account,
                  meetingData.meeting_id
                ),
                get().getAllPollResultsByMeetingIdFromAPI(
                  account,
                  meetingData.meeting_id
                ),
              ]);
              if (loadingToast) toast.dismiss(loadingToast);

              meetingDataProcessed["participants"] = participants || [];
              meetingDataProcessed["poll_results"] = pollResults || [];

              return meetingDataProcessed;
            }
          }
          // if meeting type is a recurrence
          else if (
            (RECURRING_MEETING_TYPES as readonly number[]).includes(
              meetingData.type!
            )
          ) {
            loadingToast = toast.loading(
              `Obtendo todas as instancias passadas`
            );
            const allPastInstances = await getPastMeetingInstances(
              meeting.meeting_id,
              ZOOM_ACCESS_TOKEN
            );
            if (!allPastInstances)
              throw new Error("No past instances data returned from API");
            if (loadingToast) toast.dismiss(loadingToast);

            return {
              ...meetingDataProcessed,
              past_instances: allPastInstances.map((instance) => ({
                ...instance,
                participants: [],
                poll_results: [],
                justifications: [],
                account_id: account.id,
              })),
            } as Omit<ZoomMeetingWithPastInstancies, "id" | "created_at">;
          }

          toast.dismiss(loadingToast);
          toast.success("Dados da Reunião obtido com sucesso!");

          return {
            ...meetingData,
            account_id: account.id,
          } as ZoomMeetingT;
        } catch (error) {
          console.error("Error fetching Zoom meeting data:");
          if (error instanceof Error) console.error(error);
          toast.error("Falha ao buscar reuniões da API do Zoom");
          return null;
        } finally {
          set({ loading: false });
          if (loadingToast) toast.dismiss(loadingToast);
        }
      },

      getAllParticipantsByMeetingIdFromAPI: async (account, meetingId) => {
        let loadingToastId;
        try {
          // Validate account data
          if (!validateZoomAccount(account))
            throw new Error("Invalid account data");
          // Validate meeting ID
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };

          // Get access token
          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          // Double encode the meeting ID for Zoom API compatibility
          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );

          loadingToastId = toast.loading(
            "Obtendo os Participantes da Reunião..."
          );

          // Fetch participants from Zoom API
          const participants = await getPastedMeetingParticipants(
            encodedMeetingId,
            ZOOM_ACCESS_TOKEN
          );

          toast.dismiss(loadingToastId);
          if (!participants || !Array.isArray(participants)) {
            console.error("Invalid participants data:", participants);
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
          toast.dismiss(loadingToastId);
        }
      },

      getAllPollResultsByMeetingIdFromAPI: async (account, meetingId) => {
        let loadingToastId;
        try {
          // Validate account data
          if (!validateZoomAccount(account))
            throw new Error("Invalid account data");
          // Validate meeting ID
          if (!meetingId) throw new Error("Meeting ID is missing");

          set({ loading: true });

          // Get access token
          const accessData = {
            account_id: account.account_id,
            client_id: account.client_id,
            client_secret: account.client_secret,
          };
          const ZOOM_ACCESS_TOKEN = await getAccessToken(accessData);
          if (!ZOOM_ACCESS_TOKEN) {
            throw new Error("Failed to get access token");
          }

          // Double encode the meeting ID for Zoom API compatibility
          const encodedMeetingId = encodeURIComponent(
            encodeURIComponent(meetingId)
          );

          // Fetch poll results from Zoom API
          loadingToastId = toast.loading(
            "Obtendo as Respostas das Polls da Reunião..."
          );

          const pollResults = await getPastMeetingsPollResults(
            encodedMeetingId,
            ZOOM_ACCESS_TOKEN
          );
          toast.dismiss(loadingToastId);
          if (!pollResults || !Array.isArray(pollResults)) {
            throw new Error("Invalid poll results data from API");
          }

          toast.success(
            "Respostas das Polls da Reunião foram obtidas com sucesso!"
          );

          // Filter out any null or undefined entries from the poll results
          const nonNullablePollResults = pollResults.filter(
            Boolean
          ) as ZoomMeetingPollResultsT[];
          return nonNullablePollResults;
        } catch (error) {
          toast.error("Falha ao buscar resultados de pesquisas da reunião.");
          console.error("Error fetching poll results:");
          if (error instanceof Error) console.error(error);
          return [];
        } finally {
          toast.dismiss(loadingToastId);
        }
      },

      // TODO optimize this function to only get new past instances instead of all
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

          loadingToast = toast.loading(
            "Obtendo as Instâncias Passadas da Reunião..."
          );
          const pastInstances = await getPastMeetingInstances(
            meetingId,
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
