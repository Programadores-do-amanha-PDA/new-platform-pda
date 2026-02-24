"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ZoomAccountT } from "../../types/accounts";

export default function EditAccountDialog({
    currentAccount,
    handleSetCurrentAccount,
    updateZoomAccount,
}: {
    currentAccount: ZoomAccountT | null;
    handleSetCurrentAccount: (account: ZoomAccountT | null) => void;
    updateZoomAccount: (accountId: string, updates: Partial<ZoomAccountT>) => Promise<boolean>;
}) {
    const [loading, setLoading] = useState(false);
    const [accountData, setAccountData] = useState<Partial<ZoomAccountT>>(() => {
        if (currentAccount) {
            return {
                account_id: currentAccount.account_id || "",
                client_id: currentAccount.client_id || "",
                client_secret: currentAccount.client_secret || "",
            };
        }
        return {};
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const { account_id, client_id, client_secret } = accountData;

        if (!account_id || !client_id || !client_secret || !currentAccount?.id) {
            toast.error({
                title: "Erro ao atualizar conta",
                description: "Por favor, preencha todos os campos.",
            });
            return;
        }

        const success = await toast.promise(
            updateZoomAccount(currentAccount.id, {
                account_id,
                client_id,
                client_secret,
            }),
            {
                loading: { title: "Atualizando conta..." },
                success: { title: "Conta atualizada!" },
                error: { title: "Erro!", description: "Ocorreu um erro ao atualizar a conta. Tente novamente mais tarde." },
            },
        );

        if (!success) throw new Error("no account updated");

        toast.success({
            title: "Conta atualizada!",
            description: "A conta foi atualizada com sucesso.",
        });
        handleSetCurrentAccount(null);
        setLoading(false);
    };

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
                            onChange={(e) => setAccountData({ ...accountData, account_id: e.target.value })}
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
                            onChange={(e) => setAccountData({ ...accountData, client_id: e.target.value })}
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
