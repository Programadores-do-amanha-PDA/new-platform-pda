"use client";
import { Edit, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ZoomAccountT } from "@/types/zoom/accounts";

const ZoomAccountCard = ({
  account,
  handleSetCurrentAccount,
  expansive,
}: {
  account: ZoomAccountT;
  handleSetCurrentAccount: (account: ZoomAccountT) => void;
  expansive: boolean;
}) => {
  return (
    <li className="p-4 border rounded-lg max-w-sm w-96 h-max flex justify-between gap-4 bg-background">
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
            <DropdownMenuItem
              onClick={() => handleSetCurrentAccount(account)}
              className="cursor-pointed font-semibold text-muted-foreground"
            >
              <Edit className="size-5" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
};
export default ZoomAccountCard;
