import { toast } from "@/lib/toast";
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
import { logger } from "@/lib/logger";

const initialState: ZoomMeetingPastInstanceState = {
    pastInstances: [],
    loading: false,
};

const log = logger.child({ store: "ZoomMeetingPastInstanceStore" });

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
                    log.error(
                        { err: error, operation: "getAllPastInstancesByClassroom" },
                        "Error fetching past instances by classroom",
                    );
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
                    log.error(
                        { err: error, operation: "getAllPastInstancesByMeeting" },
                        "Error fetching past instances by meeting",
                    );
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
                    log.error(
                        { err: error, operation: "getPastInstancesByMeetingId" },
                        "Error fetching past instances by meeting ID",
                    );
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
                    log.error({ err: error, operation: "getPastInstanceById" }, "Error fetching past instance by ID");
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
                    log.error({ err: error, operation: "getPastInstanceByUuid" }, "Error fetching past instance by UUID");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createPastInstance: async (pastInstanceData) => {
                try {
                    if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                        toast.error({ title: "Erro!", description: "Dados obrigatórios da instância passada estão faltando!" });
                        throw new Error("Missing required fields: classroom_id, meeting_id, or uuid");
                    }

                    const newPastInstance = await createPastInstance(pastInstanceData);
                    if (!newPastInstance) throw new Error("no past instance create response");

                    set({ pastInstances: [newPastInstance, ...get().pastInstances] });
                    toast.success({ title: "Sucesso!", description: "Instância passada criada com sucesso!" });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "createPastInstance" }, "Error creating past instance");
                    toast.error({ title: "Erro!", description: "Erro ao criar nova instância passada!" });
                    return false;
                }
            },

            createMultiplePastInstances: async (pastInstancesData) => {
                try {
                    if (!pastInstancesData || pastInstancesData.length === 0) {
                        toast.error({ title: "Erro!", description: "Nenhuma instância passada foi fornecida!" });
                        throw new Error("No past instances data provided");
                    }

                    // Validar se todos os itens têm os campos obrigatórios
                    for (const pastInstanceData of pastInstancesData) {
                        if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                            toast.error({
                                title: "Erro!",
                                description: "Dados obrigatórios estão faltando em uma ou mais instâncias!",
                            });
                            throw new Error(
                                "Missing required fields: classroom_id, meeting_id, or uuid in one or more instances",
                            );
                        }
                    }

                    const newPastInstances = await toast.promise(createMultiplePastInstances(pastInstancesData), {
                        loading: { title: `Criando ${pastInstancesData.length} instâncias passadas...` },
                        success: {
                            title: "Sucesso!",
                            description: `${pastInstancesData.length} instâncias passadas criadas com sucesso!`,
                        },
                        error: { title: "Erro!", description: "Erro ao criar múltiplas instâncias passadas!" },
                    });
                    if (!newPastInstances) throw new Error("no multiple past instances create response");

                    set({
                        pastInstances: [...newPastInstances, ...get().pastInstances],
                    });

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "createMultiplePastInstances" },
                        "Error creating multiple past instances",
                    );
                    toast.error({ title: "Erro!", description: "Erro ao criar múltiplas instâncias passadas!" });
                    return false;
                }
            },

            upsertMultiplePastInstances: async (classroomId, pastInstancesData) => {
                try {
                    // Validating classroom id
                    if (!classroomId) throw new Error("no classroom id provided");

                    // Validating if array is provided
                    if (!pastInstancesData || pastInstancesData.length === 0) {
                        toast.error({ title: "Erro!", description: "Nenhuma instância passada foi fornecida!" });
                        throw new Error("No past instances data provided");
                    }

                    // accessing current store state
                    const currentStore = get();

                    // Validating if all items have required fields
                    for (const pastInstanceData of pastInstancesData) {
                        if (!pastInstanceData.classroom_id || !pastInstanceData.meeting_id || !pastInstanceData.uuid) {
                            toast.error({
                                title: "Erro!",
                                description: "Dados obrigatórios estão faltando em uma ou mais instâncias!",
                            });
                            throw new Error(
                                "Missing required fields: classroom_id, meeting_id, or uuid in one or more instances",
                            );
                        }
                    }

                    const upsertedPastInstances = await toast.promise(
                        upsertMultiplePastInstances(
                            classroomId,
                            pastInstancesData,
                            { preserveUserData: true }, // Preserve justifications and other user data
                        ),
                        {
                            loading: { title: `Processando ${pastInstancesData.length} instâncias passadas...` },
                            success: {
                                title: "Sucesso!",
                                description: `${pastInstancesData.length} instâncias passadas processadas com sucesso!`,
                            },
                            error: { title: "Erro!", description: "Erro ao processar múltiplas instâncias passadas!" },
                        },
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

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "upsertMultiplePastInstances" },
                        "Error upserting multiple past instances",
                    );
                    toast.error({ title: "Erro!", description: "Erro ao processar múltiplas instâncias passadas!" });
                    return false;
                }
            },

            updatePastInstanceById: async (pastInstanceId, updates) => {
                try {
                    if (!pastInstanceId || !updates) {
                        throw new Error("id and updates fields are required");
                    }

                    const updatedPastInstance = await toast.promise(updatePastInstanceById(pastInstanceId, updates), {
                        loading: { title: "Atualizando instância passada..." },
                        success: { title: "Sucesso!", description: "Instância passada atualizada com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao atualizar a instância passada!" },
                    });
                    if (!updatedPastInstance) throw new Error("no update past instance response");

                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.id === pastInstanceId ? updatedPastInstance : pastInstance,
                        ),
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "updatePastInstanceById" }, "Error updating past instance");
                    toast.error({ title: "Erro!", description: "Erro ao atualizar a instância passada!" });
                    return false;
                }
            },

            updatePastInstanceByUuid: async (uuid, updates) => {
                try {
                    if (!uuid || !updates) {
                        throw new Error("uuid and updates fields are required");
                    }

                    const updatedPastInstance = await toast.promise(updatePastInstanceByUuid(uuid, updates), {
                        loading: { title: "Atualizando instância passada..." },
                        success: { title: "Sucesso!", description: "Instância passada atualizada com sucesso!" },
                        error: { title: "Erro!", description: "Erro ao atualizar a instância passada!" },
                    });
                    if (!updatedPastInstance) throw new Error("no update past instance response");

                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.uuid === uuid ? updatedPastInstance : pastInstance,
                        ),
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "updatePastInstanceByUuid" }, "Error updating past instance by UUID");
                    toast.error({ title: "Erro!", description: "Erro ao atualizar a instância passada!" });
                    return false;
                }
            },

            refreshInstanceData: async (instanceId, uuid, account) => {
                try {
                    if (!instanceId || !uuid || !account) {
                        toast.error({ title: "Erro!", description: "Dados obrigatórios estão faltando!" });
                        throw new Error("Missing required fields: instanceId, uuid, or account");
                    }

                    //
                    const currentState = get();

                    // Find the instance in the current state
                    const currentInstance = currentState.pastInstances.find((instance) => instance.id === instanceId);
                    if (!currentInstance) {
                        toast.error({ title: "Erro!", description: "Instância não encontrada no estado atual!" });
                        throw new Error("Instance not found in current state");
                    }

                    // fetch new participants and poll results data from Zoom API
                    const zoomAPIStore = useZoomAPIStore.getState();
                    const [newParticipants, newPollResults] = await Promise.all([
                        zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, uuid),
                        zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, uuid),
                    ]);
                    toast.success({ title: "Sucesso!", description: "Dados buscados na API do Zoom!" });

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
                        toast.error({ title: "Erro!", description: "Nenhum novo dado encontrado na API do Zoom!" });
                        return false;
                    }

                    if (isInstanceUpToDate) {
                        toast.info({ title: "Informação!", description: "Os dados da instância já estão atualizados!" });
                        return true;
                    }

                    const updatedPastInstance = await toast.promise(
                        updatePastInstanceById(instanceId, {
                            participants: newParticipants,
                            poll_results: newPollResults,
                            synchronized_at: new Date().toISOString(),
                        }),
                        {
                            loading: { title: "Atualizando dados da instância passada..." },
                            success: { title: "Sucesso!", description: "Dados da instância passada atualizados com sucesso!" },
                            error: { title: "Erro!", description: "Erro ao atualizar os dados da instância passada!" },
                        },
                    );

                    if (!updatedPastInstance) {
                        throw new Error("Failed to update past instance");
                    }

                    // Atualizar o estado local
                    set({
                        pastInstances: get().pastInstances.map((pastInstance) =>
                            pastInstance.id === instanceId ? updatedPastInstance : pastInstance,
                        ),
                    });

                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "refreshInstanceData" }, "Error refreshing instance data");
                    toast.error({ title: "Erro!", description: "Erro ao atualizar dados da instância!" });
                    return false;
                }
            },

            refreshMultipleInstancesData: async (
                instances: Array<{
                    instanceId: string;
                    uuid: string;
                    account: ZoomAccountT;
                }>,
            ) => {
                try {
                    if (!instances || instances.length === 0) {
                        toast.error({ title: "Erro!", description: "Nenhuma instância fornecida para atualização!" });
                        return false;
                    }

                    const zoomAPIStore = useZoomAPIStore.getState();
                    const updatePromises = instances.map(async ({ instanceId, uuid, account }) => {
                        // Buscar novos dados da API do Zoom
                        const [newParticipants, newPollResults] = await Promise.all([
                            zoomAPIStore.getAllParticipantsByMeetingIdFromAPI(account, uuid),
                            zoomAPIStore.getAllPollResultsByMeetingIdFromAPI(account, uuid),
                        ]);

                        // Atualizar a instância no banco de dados
                        const updatedPastInstance = await toast.promise(
                            updatePastInstanceById(instanceId, {
                                participants: newParticipants,
                                poll_results: newPollResults,
                                synchronized_at: new Date().toISOString(),
                            }),
                            {
                                loading: { title: "Atualizando dados da instância..." },
                                success: { title: "Sucesso!", description: "Dados da instância atualizados com sucesso!" },
                                error: { title: "Erro!", description: "Erro ao atualizar dados da instância!" },
                            },
                        );

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

                    toast.success({
                        title: "Sucesso!",
                        description: `Todas as ${updatedInstances.length} instâncias foram atualizadas com sucesso!`,
                    });

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "refreshMultipleInstancesData" },
                        "Error refreshing multiple instances data",
                    );
                    toast.error({ title: "Erro!", description: "Erro ao atualizar dados das instâncias!" });
                    return false;
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
                    toast.success({
                        title: "Sucesso!",
                        description: "Instância passada deletada com sucesso!",
                    });
                    return true;
                } catch (error) {
                    console.error("Error deleting past instance:", error);
                    toast.error({
                        title: "Erro!",
                        description: "Erro ao deletar instância passada. Tente novamente mais tarde!",
                    });
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
