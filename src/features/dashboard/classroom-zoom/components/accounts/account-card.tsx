"use client";
import { useState } from "react";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import { DeleteConfirmationDialog } from "@/components/shared/delete-components";
import EditAccountDialog from "./edit-account-dialog";
import { ZoomAccountT } from "@/types/classroom-zoom/accounts";

const ZoomAccountCard = ({
  account,
  expansive,
}: {
  account: ZoomAccountT;
  expansive: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<ZoomAccountT | null>(
    null
  );
  const { deleteAccount, updateAccount } = useZoomAccountStore();

  return (
    <li className="p-4 border rounded-lg max-w-sm w-96 h-max flex justify-between gap-4 bg-background shadow">
      <div className="flex flex-col gap-1">
        <p
          className="font-semibold truncate"
          title={account.me?.first_name ?? account.account_id}
        >
          {account.me?.first_name ?? account.account_id}
        </p>
        <p className="font-bold text-sm text-muted-foreground">
          {account.me?.email}
        </p>
        <p className="text-sm h-5 text-gray-500 flex gap-1">
          Sincronizada em:
          <p className="font-bold">
            {new Date(account.created_at).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              dateStyle: "short",
            })}
          </p>
        </p>
      </div>
      {expansive && (
        <DropdownMenu>
          <DropdownMenuTrigger className="w-max">
            <Button variant={"outline"} size="sm">
              <Ellipsis className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Ações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-0">
              <Button
                variant="ghost"
                onClick={() => setCurrentAccount(account)}
                className="!w-full cursor-pointed font-semibold text-muted-foreground justify-start"
              >
                <Edit className="size-4" />
                Editar
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-0">
              <Button
                type="button"
                variant="destructive"
                className="!w-full cursor-pointed !text-destructive-foreground font-semibold fon justify-start"
                onClick={() => setDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Deletar
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DeleteConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={() => deleteAccount(account.id)}
        description="Essa ação não pode ser desfeita. Isso EXCLUIRÁ PERMANENTEMENTE os dados da CONTA e removerá todos os dados de REUNIÕES, PRESENÇAS e RESPOSTAS (KPI) atreladas a conta."
      />

      <EditAccountDialog
        currentAccount={currentAccount}
        handleSetCurrentAccount={setCurrentAccount}
        updateAccount={updateAccount}
      />
    </li>
  );
};
export default ZoomAccountCard;
