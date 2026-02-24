import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
    getAllZoomAccountsByClassroomId,
    getZoomAccountById,
    createZoomAccountByClassroomId,
    updateZoomAccountById,
    deleteZoomAccountById,
} from "../actions/accounts";
import { ZoomAccountT } from "../types/accounts";
import { useZoomAPIStore } from "./api";
import { logger } from "@/lib/logger";

interface ZoomAccountState {
    accounts: ZoomAccountT[];
    loading: boolean;
}

interface ZoomAccountActions {
    setZoomAccounts: (accounts: ZoomAccountT[]) => void;
    getAllZoomAccounts: (classroomId: string) => Promise<boolean>;
    getZoomAccountById: (accountId: string) => Promise<ZoomAccountT | boolean>;
    createZoomAccount: (accountData: Partial<ZoomAccountT>) => Promise<string | boolean>;
    updateZoomAccount: (accountId: string, updates: Partial<ZoomAccountT>) => Promise<boolean>;
    deleteZoomAccount: (accountId: string) => Promise<boolean>;
    reset: () => void;
}

const initialState: ZoomAccountState = {
    accounts: [],
    loading: false,
};

const log = logger.child({ module: "ZoomAccountStore" });

export const useZoomAccountStore = create<ZoomAccountState & ZoomAccountActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setZoomAccounts: (accounts) => set({ accounts }),

            getAllZoomAccounts: async (classroomId) => {
                try {
                    set({ loading: true });
                    const accountsResponse = await getAllZoomAccountsByClassroomId(classroomId);
                    if (!accountsResponse) throw "No accounts response";
                    set({ accounts: accountsResponse });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "getAllZoomAccounts" }, "Error fetching zoom accounts by classroom ID");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            getZoomAccountById: async (accountId) => {
                try {
                    set({ loading: true });
                    const accountResponse = await getZoomAccountById(accountId);
                    if (!accountResponse) throw "No account response";
                    return accountResponse;
                } catch (error) {
                    log.error({ err: error, operation: "getZoomAccountById" }, "Error fetching zoom account by ID");
                    return false;
                } finally {
                    set({ loading: false });
                }
            },

            createZoomAccount: async (accountData) => {
                try {
                    if (
                        !accountData.classroom_id ||
                        !accountData.id ||
                        !accountData.account_id ||
                        !accountData.client_id ||
                        !accountData.client_secret
                    ) {
                        return false;
                    }

                    const me = await useZoomAPIStore.getState().getZoomMeAccountDataByAPI(
                        {
                            account_id: accountData.account_id,
                            id: accountData.id!,
                            client_id: accountData.client_id,
                            client_secret: accountData.client_secret,
                            classroom_id: accountData.classroom_id,
                        },
                        true, // forçar renovação do token
                    );
                    if (!me) throw new Error("no me data");

                    const newAccount: ZoomAccountT = await createZoomAccountByClassroomId({
                        ...accountData,
                        me,
                    });
                    if (!newAccount) throw new Error("No account create response");

                    set({ accounts: [newAccount, ...get().accounts] });
                    return newAccount.id;
                } catch (error) {
                    log.error({ err: error, operation: "create_zoom_account" }, "Error creating zoom account");
                    return false;
                }
            },

            updateZoomAccount: async (accountId, updates) => {
                try {
                    if (!accountId || !updates) {
                        throw new Error("ID and updates fields are required");
                    }
                    const updatedAccount = await updateZoomAccountById(accountId, updates);
                    if (!updatedAccount) throw new Error("No update account response");

                    set({
                        accounts: get().accounts.map((account) => (account.id === accountId ? updatedAccount : account)),
                    });
                    return true;
                } catch (error) {
                    log.error({ err: error, operation: "update_zoom_account" }, "Error updating zoom account");
                    return false;
                }
            },

            deleteZoomAccount: async (accountId) => {
                try {
                    if (!accountId) throw new Error("Account ID is required to delete");
                    const response = await deleteZoomAccountById(accountId);
                    if (!response) throw new Error("No delete account response");

                    set({
                        accounts: get().accounts.filter((account) => account.id !== accountId),
                    });
                    return true;
                } catch (error) {
                    log.error(error);
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "ZoomAccountStore" },
    ),
);
