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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZoomAccountT } from "@/types/classroom-zoom/accounts";

export default function AccountDialog({
  classroom_id,
  createAccount,
  currentAccount,
  handleSetCurrentAccount,
  updateAccount,
}: {
  classroom_id: string;
  createAccount: (
    accountData: Partial<ZoomAccountT>
  ) => Promise<string | boolean>;
  currentAccount: ZoomAccountT | null;
  handleSetCurrentAccount: (account: ZoomAccountT | null) => void;
  updateAccount: (
    accountId: string,
    updates: Partial<ZoomAccountT>
  ) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
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

      if (!account_id || !client_id || !client_secret || !classroom_id) {
        toast.error("Por favor, preencha todos os campos.");
        return;
      }

      if (!currentAccount || !currentAccount.id) {
        toast.info("Salvando informações de conta...");
        const account = await createAccount({
          classroom_id,
          account_id,
          client_id,
          client_secret,
        });

        if (!account) throw new Error("no account created");
        return
      } else if (currentAccount && currentAccount.id) {
        toast.info("Atualizando informações de conta...");
        const account = await updateAccount(currentAccount.id, {
          account_id,
          client_id,
          client_secret,
        });
        if (!account) throw new Error("no account updated");

        toast.success("Conta atualizada com sucesso!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      setAccountData(currentAccount);
    }
  }, [currentAccount]);

  const handleSetOpen = (v: boolean) => {
    if (v === false) {
      setAccountData({
        account_id: "",
        client_id: "",
        client_secret: "",
      });
      handleSetCurrentAccount(null);
    }
    setOpen(v);
  };

  return (
    <Dialog
      open={currentAccount !== null || open === true}
      onOpenChange={handleSetOpen}
    >
      <DialogTrigger>
        <Button variant="default" className="font-semibold">
          Adicionar Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentAccount ? "Atualizar Conta" : "Adicionar Nova Conta"}
          </DialogTitle>
          <DialogDescription>
            {currentAccount
              ? "Atualize as informações de conexão do App server to server da conta do Zoom."
              : "Adicione as informações de conexão do App server to server da conta do Zoom."}
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
            <Button className="font-semibold" disabled={loading}>
              {loading && <LoaderCircle className="size-5 animate-spin" />}
              {!currentAccount?.id ? "Adicionar" : "Editar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
