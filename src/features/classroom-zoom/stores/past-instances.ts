import { toast } from "sonner";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
    getAllPastInstancesByClassroomId,
    getAllPastInstancesByMeetingId,
    getPastInstanceById,
    getPastInstanceByUuid,
    createPastInstance,
    createMultiplePastInstances,
    upsertMultiplePastInstances,
    updatePastInstanceById,
    updatePastInstanceByUuid,
    deletePastInstanceById,
} from "../actions/past-instances";
import { ZoomAccountT } from "../types/accounts";
import { ZoomMeetingPastInstanceState, ZoomMeetingPastInstanceActions } from "../types/past-instances";
import { useZoomAPIStore } from "./api";

const initialState: ZoomMeetingPastInstanceState = {
    pastInstances: [],
    loading: false,
};

export const useZoomMeetingPastInstanceStore = create<ZoomMeetingPastInstanceState & ZoomMeetingPastInstanceActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setPastInstances: (pastInstances) => set({ pastInstances }),

            getAllPastInstancesByClassroom: async (classroomId) => {
                try {
                    set({ loading: true });
                    const pastInstancesResponse = await getAllPastInstancesByClassroomId(classroomId);
                    if (!pastInstancesResponse) throw "no past instances response";
                    set({ pastInstances: pastInstancesResponse });
                    return true;
                } catch (error) {
                    console.error("Error fetching past instances by classroom:", error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getAllPastInstancesByMeeting: async (meetingId) => {
                try {
                    set({ loading: true });
                    const pastInstancesResponse = await getAllPastInstancesByMeetingId(meetingId);
                    if (!pastInstancesResponse) throw "no past instances response";
                    set({ pastInstances: pastInstancesResponse });
                    return true;
                } catch (error) {
                    console.error("Error fetching past instances by meeting:", error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            // Internal function to get instances by meeting without overwriting state
            _getPastInstancesByMeetingId: async (meetingId: string) => {
                try {
                    const pastInstancesResponse = await getAllPastInstancesByMeetingId(meetingId);
                    if (!pastInstancesResponse) throw "no past instances response";
                    return pastInstancesResponse;
                } catch (error) {
                    console.error("Error fetching past instances by meeting ID:", error);
                    return false;
                }
            },

            getPastInstanceById: async (pastInstanceId) => {
                try {
                    set({ loading: true });
                    const pastInstanceResponse = await getPastInstanceById(pastInstanceId);
                    if (!pastInstanceResponse) throw "no past instance response";
                    return pastInstanceResponse;
                } catch (error) {
                    console.error("Error fetching past instance by ID:", error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getPastInstanceByUuid: async (uuid) => {
                try {
                    set({ loading: true });
                    const pastInstanceResponse = await getPastInstanceByUuid(uuid);
                    if (!pastInstanceResponse) throw "no past instance response";
                    return pastInstanceResponse;
                } catch (error) {
                    console.error("Error fetching past instance by UUID:", error);
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createPastInstance: async (pastInstanceData) => {
                try {
                    if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                        toast.error("Dados obrigatórios da instância passada estão faltando!");
                        throw new Error("Missing required fields: classroom_id, meeting_id, or uuid");
                    }

                    const newPastInstance = await createPastInstance(pastInstanceData);
                    if (!newPastInstance) throw new Error("no past instance create response");

                    set({ pastInstances: [newPastInstance, ...get().pastInstances] });
                    toast.success("Instância passada criada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error creating past instance:", error);
                    toast.error("Erro ao criar nova instância passada!");
                    return false;
                }
            },

            createMultiplePastInstances: async (pastInstancesData) => {
                let loadingToastId: string | number | undefined;
                try {
                    if (!pastInstancesData || pastInstancesData.length === 0) {
                        toast.error("Nenhuma instância passada foi fornecida!");
                        throw new Error("No past instances data provided");
                    }

                    // Validar se todos os itens têm os campos obrigatórios
                    for (const pastInstanceData of pastInstancesData) {
                        if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                            toast.error("Dados obrigatórios estão faltando em uma ou mais instâncias!");
                            throw new Error(
                                "Missing required fields: classroom_id, meeting_id, or uuid in one or more instances",
                            );
                        }
                    }

                    loadingToastId = toast.loading(`Criando ${pastInstancesData.length} instâncias passadas...`);

                    const newPastInstances = await createMultiplePastInstances(pastInstancesData);
                    if (!newPastInstances) throw new Error("no multiple past instances create response");

                    set({
                        pastInstances: [...newPastInstances, ...get().pastInstances],
                    });

                    toast.dismiss(loadingToastId);
                    toast.success(`${newPastInstances.length} instâncias passadas criadas com sucesso!`);
                    return true;
                } catch (error) {
                    console.error("Error creating multiple past instances:", error);
                    toast.error("Erro ao criar múltiplas instâncias passadas!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            upsertMultiplePastInstances: async (classroomId, pastInstancesData) => {
                let loadingToastId;
                try {
                    // Validating classroom id
                    if (!classroomId) throw new Error("no classroom id provided");

                    // Validating if array is provided
                    if (!pastInstancesData || pastInstancesData.length === 0) {
                        toast.error("Nenhuma instância passada foi fornecida!");
                        throw new Error("No past instances data provided");
                    }

                    // accessing current store state
                    const currentStore = get();

                    // Validating if all items have required fields
                    for (const pastInstanceData of pastInstancesData) {
                        if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                            toast.error("Dados obrigatórios estão faltando em uma ou mais instâncias!");
                            throw new Error(
                                "Missing required fields: classroom_id, meeting_id, or uuid in one or more instances",
                            );
                        }
                    }

                    loadingToastId = toast.loading(`Processando ${pastInstancesData.length} instâncias passadas...`);

                    console.log("pastInstancesData", pastInstancesData.length);
                    // Upsert instances, preserving user data like justifications
                    const upsertedPastInstances = await upsertMultiplePastInstances(
                        classroomId,
                        pastInstancesData,
                        { preserveUserData: true }, // Preserve justifications and other user data
                    );
                    if (!upsertedPastInstances) throw new Error("no multiple past instances upsert response");

                    // Update the store with upserted instances, preserving other instances
                    const currentInstances = currentStore.pastInstances;
                    const upsertedUuids = new Set(upsertedPastInstances.map((instance) => instance.id));

                    // Merge existing justifications with new data to prevent data loss
                    const mergedInstances = upsertedPastInstances.map((upsertedInstance) => {
                        // Find existing instance by ID
                        const existingInstance = currentInstances.find((existing) => existing.id === upsertedInstance.id);

                        // Preserve existing justifications if they exist
                        if (existingInstance?.justifications && existingInstance.justifications.length > 0) {
                            return {
                                ...upsertedInstance,
                                justifications: existingInstance.justifications,
                            };
                        }

                        return upsertedInstance;
                    });

                    // Remove old versions of upserted instances and add merged ones
                    const filteredInstances = currentInstances.filter((instance) => !upsertedUuids.has(instance.id));

                    set({
                        pastInstances: [...mergedInstances, ...filteredInstances],
                    });

                    toast.dismiss(loadingToastId);
                    toast.success(`${upsertedPastInstances.length} instâncias passadas processadas com sucesso!`);
                    return true;
                } catch (error) {
                    console.error("Error upserting multiple past instances:", error);
                    toast.error("Erro ao processar múltiplas instâncias passadas!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            updatePastInstanceById: async (pastInstanceId, updates) => {
                let loadingToastId: string | number | undefined;
                try {
                    if (!pastInstanceId || !updates) {
                        throw new Error("id and updates fields are required");
                    }

                    loadingToastId = toast.loading("Atualizando instância passada...");
                    const updatedPastInstance = await updatePastInstanceById(pastInstanceId, updates);
                    if (!updatedPastInstance) throw new Error("no update past instance response");

                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.id === pastInstanceId ? updatedPastInstance : pastInstance,
                        ),
                    });

                    toast.dismiss(loadingToastId);
                    toast.success("Instância passada atualizada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating past instance:", error);
                    toast.error("Erro ao atualizar a instância passada!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            updatePastInstanceByUuid: async (uuid, updates) => {
                let loadingToastId: string | number | undefined;
                try {
                    if (!uuid || !updates) {
                        throw new Error("uuid and updates fields are required");
                    }

                    loadingToastId = toast.loading("Atualizando instância passada...");
                    const updatedPastInstance = await updatePastInstanceByUuid(uuid, updates);
                    if (!updatedPastInstance) throw new Error("no update past instance response");

                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.uuid === uuid ? updatedPastInstance : pastInstance,
                        ),
                    });

                    toast.dismiss(loadingToastId);
                    toast.success("Instância passada atualizada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error updating past instance by UUID:", error);
                    toast.error("Erro ao atualizar a instância passada!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            refreshInstanceData: async (instanceId, uuid, account) => {
                let loadingToastId: string | number | undefined;
                try {
                    // Check instanceId, uuid and account
                    if (!instanceId || !uuid || !account) {
                        toast.error("Dados obrigatórios estão faltando!");
                        throw new Error("Missing required fields: instanceId, uuid, or account");
                    }

                    //
                    const currentState = get();

                    // Find the instance in the current state
                    const currentInstance = currentState.pastInstances.find((instance) => instance.id === instanceId);
                    if (!currentInstance) {
                        toast.error("Instância não encontrada no estado atual!");
                        throw new Error("Instance not found in current state");
                    }

                    // fetch new participants and poll results data from Zoom API
                    const loadingToast = toast.loading("Buscando novos dados da instancia na API do Zoom...");
                    const zoomAPIStore = useZoomAPIStore.getState();
                    const [newParticipants, newPollResults] = await Promise.all([
                        zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, uuid),
                        zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, uuid),
                    ]);
                    toast.dismiss(loadingToast);
                    toast.success("Dados buscados na API do Zoom!");

                    console.log("Fetched new data from Zoom API:", {
                        newParticipants,
                        newPollResults,
                    });

                    // Check if there's any new data to update
                    const hasNewParticipants = newParticipants && newParticipants.length > 0;
                    const hasNewPollResults = newPollResults && newPollResults.length > 0;

                    // Check if participants are up to date
                    const participantsUpToDate =
                        !hasNewParticipants ||
                        (currentInstance.participants?.length === newParticipants?.length &&
                            currentInstance.participants?.every((participant) =>
                                newParticipants?.some((newPart) => newPart.user_email === participant.user_email),
                            ));

                    // Check if poll results are up to date
                    const pollResultsUpToDate =
                        !hasNewPollResults ||
                        (currentInstance.poll_results?.length === newPollResults?.length &&
                            currentInstance.poll_results?.every((poll) =>
                                newPollResults?.some((newPoll) => newPoll.email === poll.email),
                            ));

                    const isInstanceUpToDate = participantsUpToDate && pollResultsUpToDate;

                    if (!hasNewParticipants && !hasNewPollResults) {
                        toast.error("Nenhum novo dado encontrado na API do Zoom!");
                        return false;
                    }

                    if (isInstanceUpToDate) {
                        toast.info("Os dados da instância já estão atualizados!");
                        return true;
                    }

                    //  Update the instance on Supabase
                    loadingToastId = toast.loading("Atualizando os dados da instância...");
                    console.log({
                        participants: newParticipants,
                        poll_results: newPollResults,
                        synchronized_at: new Date().toISOString(),
                    });
                    const updatedPastInstance = await updatePastInstanceById(instanceId, {
                        participants: newParticipants,
                        poll_results: newPollResults,
                        synchronized_at: new Date().toISOString(),
                    });

                    if (!updatedPastInstance) {
                        throw new Error("Failed to update past instance");
                    }

                    // Atualizar o estado local
                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.id === instanceId ? updatedPastInstance : pastInstance,
                        ),
                    });

                    toast.dismiss(loadingToast);
                    toast.success("Dados da instância atualizados com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error refreshing instance data:", error);
                    toast.error("Erro ao atualizar dados da instância!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            refreshMultipleInstancesData: async (
                instances: Array<{
                    instanceId: string;
                    uuid: string;
                    account: ZoomAccountT;
                }>,
            ) => {
                let loadingToastId: string | number | undefined;
                try {
                    if (!instances || instances.length === 0) {
                        toast.error("Nenhuma instância fornecida para atualização!");
                        return false;
                    }

                    loadingToastId = toast.loading(`Atualizando dados de ${instances.length} instâncias...`);

                    const zoomAPIStore = useZoomAPIStore.getState();
                    const updatePromises = instances.map(async ({ instanceId, uuid, account }) => {
                        // Buscar novos dados da API do Zoom
                        const [newParticipants, newPollResults] = await Promise.all([
                            zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, uuid),
                            zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, uuid),
                        ]);

                        // Atualizar a instância no banco de dados
                        const updatedPastInstance = await updatePastInstanceById(instanceId, {
                            participants: newParticipants,
                            poll_results: newPollResults,
                            synchronized_at: new Date().toISOString(),
                        });

                        return updatedPastInstance;
                    });

                    const updatedInstances = await Promise.all(updatePromises);

                    // Atualizar o estado local com as instâncias atualizadas
                    if (updatedInstances.length > 0) {
                        set({
                            pastInstances: get().pastInstances.map((pastInstance) => {
                                const updatedInstance = updatedInstances.find(
                                    (updated) => updated && updated.id === pastInstance.id,
                                );
                                return updatedInstance || pastInstance;
                            }),
                        });
                    }

                    toast.dismiss(loadingToastId);
                    toast.success(`Todas as ${updatedInstances.length} instâncias foram atualizadas com sucesso!`);

                    return true;
                } catch (error) {
                    console.error("Error refreshing multiple instances data:", error);
                    toast.error("Erro ao atualizar dados das instâncias!");
                    return false;
                } finally {
                    if (loadingToastId !== undefined) {
                        toast.dismiss(loadingToastId);
                    }
                }
            },

            deletePastInstance: async (pastInstanceId) => {
                try {
                    if (!pastInstanceId) throw new Error("past instance id is required to delete");

                    set({ loading: true });
                    const response = await deletePastInstanceById(pastInstanceId);
                    if (!response) throw new Error("no delete past instance response");

                    set({
                        pastInstances: get().pastInstances.filter((pastInstance) => pastInstance.id !== pastInstanceId),
                    });
                    toast.success("Instância passada deletada com sucesso!");
                    return true;
                } catch (error) {
                    console.error("Error deleting past instance:", error);
                    toast.error("Erro ao deletar instância passada. Tente novamente mais tarde!");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ZoomMeetingPastInstanceStore" },
    ),
);
