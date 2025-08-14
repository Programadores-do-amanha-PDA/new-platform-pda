"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZoomAccountT } from "@/types/classroom-zoom/accounts";

export default function EditAccountDialog({
  currentAccount,
  handleSetCurrentAccount,
  updateAccount,
}: {
  currentAccount: ZoomAccountT | null;
  handleSetCurrentAccount: (account: ZoomAccountT | null) => void;
  updateAccount: (
    accountId: string,
    updates: Partial<ZoomAccountT>
  ) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<Partial<ZoomAccountT>>({
    account_id: "",
    client_id: "",
    client_secret: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { account_id, client_id, client_secret } = accountData;

      if (!account_id || !client_id || !client_secret || !currentAccount?.id) {
        toast.error("Por favor, preencha todos os campos.");
        return;
      }

      toast.info("Atualizando informações de conta...");
      const success = await updateAccount(currentAccount.id, {
        account_id,
        client_id,
        client_secret,
      });
      
      if (!success) throw new Error("no account updated");

      toast.success("Conta atualizada com sucesso!");
      handleSetCurrentAccount(null);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar conta.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      setAccountData({
        account_id: currentAccount.account_id || "",
        client_id: currentAccount.client_id || "",
        client_secret: currentAccount.client_secret || "",
      });
    }
  }, [currentAccount]);

  const handleSetOpen = (v: boolean) => {
    if (v === false) {
      handleSetCurrentAccount(null);
    }
  };

  return (
    <Dialog open={currentAccount !== null} onOpenChange={handleSetOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Conta</DialogTitle>
          <DialogDescription>
            Atualize as informações de conexão do App server to server da conta do Zoom.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6 py-4" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col items-start gap-2">
            <Label htmlFor="account_id" className="font-semibold">
              Account ID
            </Label>
            <Input
              id="account_id"
              name="account_id"
              type="text"
              className="col-span-3"
              value={accountData.account_id}
              onChange={(e) =>
                setAccountData({ ...accountData, account_id: e.target.value })
              }
            />
          </div>
          <div className="w-full flex flex-col items-start gap-2">
            <Label htmlFor="client_id" className="font-semibold">
              Client ID
            </Label>
            <Input
              id="client_id"
              name="client_id"
              type="text"
              className="col-span-3"
              value={accountData.client_id}
              onChange={(e) =>
                setAccountData({ ...accountData, client_id: e.target.value })
              }
            />
          </div>
          <div className="w-full flex flex-col items-start gap-2">
            <Label htmlFor="client_secret" className="font-semibold">
              Client Secret
            </Label>
            <Input
              id="client_secret"
              name="client_secret"
              className="col-span-3"
              type="password"
              value={accountData.client_secret}
              onChange={(e) =>
                setAccountData({
                  ...accountData,
                  client_secret: e.target.value,
                })
              }
            />
          </div>

          <div className="w-full flex justify-end gap-4 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="font-semibold" disabled={loading}>
              {loading && <LoaderCircle className="size-5 animate-spin" />}
              Atualizar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}