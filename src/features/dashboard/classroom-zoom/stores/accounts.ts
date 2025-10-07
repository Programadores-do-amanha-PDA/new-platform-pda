import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";

import {
  getZoomAccountById,
  getAllZoomAccountsByClassroomId,
  updateZoomAccountById,
  deleteZoomAccountById,
  createZoomAccountByClassroomId,
} from "@/app/actions/classrooms/zoom/accounts";

import { ZoomAccountT } from "../types";
import { useZoomAPIStore } from "./";

interface ZoomAccountState {
  accounts: ZoomAccountT[];
  loading: boolean;
}

interface ZoomAccountActions {
  setAccounts: (accounts: ZoomAccountT[]) => void;
  getAllAccounts: (classroomId: string) => Promise<boolean>;
  getAccountById: (accountId: string) => Promise<ZoomAccountT | boolean>;
  createAccount: (
    accountData: Partial<ZoomAccountT>
  ) => Promise<string | boolean>;
  updateAccount: (
    accountId: string,
    updates: Partial<ZoomAccountT>
  ) => Promise<boolean>;
  deleteAccount: (accountId: string) => Promise<boolean>;
  reset: () => void;
}

const initialState: ZoomAccountState = {
  accounts: [],
  loading: false,
};

export const useZoomAccountStore = create<
  ZoomAccountState & ZoomAccountActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setAccounts: (accounts) => set({ accounts }),

      getAllAccounts: async (classroomId) => {
        try {
          set({ loading: true });
          const accountsResponse = await getAllZoomAccountsByClassroomId(
            classroomId
          );
          if (!accountsResponse) throw "No accounts response";
          set({ accounts: accountsResponse });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      getAccountById: async (accountId) => {
        try {
          set({ loading: true });
          const accountResponse = await getZoomAccountById(accountId);
          if (!accountResponse) throw "No account response";
          return accountResponse;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      createAccount: async (accountData) => {
        try {
          if (
            !accountData.classroom_id ||
            !accountData.account_id ||
            !accountData.client_id ||
            !accountData.client_secret
          ) {
            toast.error("Dados obrigatórios da conta estão faltando!");
            throw new Error("Missing required account data");
          }
          
          toast.info("Verificando as credenciais da conta...");
                    
          const me = await useZoomAPIStore
            .getState()
            .getZoomMeAccountDataByAPI(
              accountData.account_id,
              accountData.client_id,
              accountData.client_secret,
              true // forçar renovação do token
            );
          if (!me) throw new Error("no me data");
          toast.success("Credenciais verificadas com sucesso!");

          toast.info("Salvando as credencias da conta...");
          const newAccount: ZoomAccountT = await createZoomAccountByClassroomId(
            {
              ...accountData,
              me,
            }
          );
          if (!newAccount) throw new Error("No account create response");

          set({ accounts: [newAccount, ...get().accounts] });
          toast.success(
            `Conta "${newAccount?.me?.first_name}" salva com sucesso!`
          );
          return newAccount.id;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao criar nova conta!");
          return false;
        }
      },

      updateAccount: async (accountId, updates) => {
        try {
          if (!accountId || !updates) {
            throw new Error("ID and updates fields are required");
          }
          const updatedAccount = await updateZoomAccountById(
            accountId,
            updates
          );
          if (!updatedAccount) throw new Error("No update account response");

          set({
            accounts: get().accounts.map((account) =>
              account.id === accountId ? updatedAccount : account
            ),
          });
          toast.success("Conta atualizada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao atualizar a conta!");
          return false;
        }
      },

      deleteAccount: async (accountId) => {
        try {
          if (!accountId) throw new Error("Account ID is required to delete");
          const response = await deleteZoomAccountById(accountId);
          if (!response) throw new Error("No delete account response");

          set({
            accounts: get().accounts.filter(
              (account) => account.id !== accountId
            ),
          });
          toast.success("Conta deletada com sucesso!");
          return true;
        } catch (error) {
          console.error(error);
          toast.error("Erro ao deletar conta. Tente novamente mais tarde!");
          return false;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "ZoomAccountStore" }
  )
);
