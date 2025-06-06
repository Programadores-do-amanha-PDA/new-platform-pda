import { useState } from "react";
import { toast } from "sonner";

import {
  getZoomAccountById,
  getAllZoomAccountsByClassroomId,
  updateZoomAccountById,
  deleteZoomAccountById,
  createZoomAccountByClassroomId,
} from "@/app/actions/classrooms/zoom/accounts";

import { ZoomAccountMeType, ZoomAccountType } from "@/types/zoom/accounts";

const useZoomAccountsStack = (
  handleGetZoomMeAccountDataByAPI: (
    account: Omit<
      ZoomAccountType,
      "id" | "classroom_id" | "me" | "label" | "created_at"
    >
  ) => Promise<false | Partial<ZoomAccountMeType>>
) => {
  const [accounts, setAccounts] = useState<ZoomAccountType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllZoomAccounts = async (classroomId: string) => {
    try {
      setLoading(true);
      const accountsResponse = await getAllZoomAccountsByClassroomId(
        classroomId
      );
      if (!accountsResponse) throw "No accounts response";
      setAccounts(accountsResponse);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetZoomAccountById = async (accountId: string) => {
    try {
      setLoading(true);
      const accountResponse = await getZoomAccountById(accountId);
      if (!accountResponse) throw "No account response";
      return accountResponse;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZoomAccount = async (
    accountData: Omit<ZoomAccountType, "id" | "me" | "label" | "created_at">
  ) => {
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
      setLoading(true);

      toast.info("Verificando as credenciais da conta...");
      const me = await handleGetZoomMeAccountDataByAPI(accountData);
      if (!me) throw new Error("no me data");

      const newAccount = await createZoomAccountByClassroomId({
        ...accountData,
        me,
      });
      if (!newAccount) throw new Error("No account create response");
      setAccounts((accounts) => [newAccount, ...accounts]);
      toast.success(`Conta "${newAccount.account_name}" criada com sucesso!`);
      return newAccount.id;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar nova conta!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZoomAccountById = async (
    accountId: string,
    updates: Partial<ZoomAccountType>
  ) => {
    try {
      if (!accountId || !updates) {
        throw new Error("ID and updates fields are required");
      }
      setLoading(true);
      const updatedAccount = await updateZoomAccountById(accountId, updates);
      if (!updatedAccount) throw new Error("No update account response");
      setAccounts((accounts) =>
        accounts.map((account) =>
          account.id === accountId ? updatedAccount : account
        )
      );
      toast.success("Conta atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a conta!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZoomAccountById = async (accountId: string) => {
    try {
      if (!accountId) throw new Error("Account ID is required to delete");
      setLoading(true);
      const response = await deleteZoomAccountById(accountId);
      if (!response) throw new Error("No delete account response");
      setAccounts((accounts) =>
        accounts.filter((account) => account.id !== accountId)
      );
      toast.success("Conta deletada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar conta. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    setAccounts,
    accountsLoading: loading,
    handleGetAllZoomAccounts,
    handleGetZoomAccountById,
    handleCreateZoomAccount,
    handleUpdateZoomAccountById,
    handleDeleteZoomAccountById,
  };
};

export default useZoomAccountsStack;

export interface ZoomAccountsStackI {
  accounts: ZoomAccountType[];
  accountsLoading: boolean;
  handleGetAllZoomAccounts: (classroomId: string) => Promise<boolean>;
  handleGetZoomAccountById: (
    accountId: string
  ) => Promise<ZoomAccountType | boolean>;
  handleCreateZoomAccount: (
    accountData: Omit<ZoomAccountType, "id" | "me" | "label" | "created_at">
  ) => Promise<string | boolean>;
  handleUpdateZoomAccountById: (
    accountId: string,
    updates: Partial<ZoomAccountType>
  ) => Promise<boolean>;
  handleDeleteZoomAccountById: (accountId: string) => Promise<boolean>;
}
