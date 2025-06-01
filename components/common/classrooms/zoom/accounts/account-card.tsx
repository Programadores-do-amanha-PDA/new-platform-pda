import { ZoomAccountType } from "@/types/zoom/accounts";
import { Button } from "@/components/ui/button";
import { Edit, Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

const ZoomAccountCard = ({
  account,
  handleSetCurrentAccount,
  expansive,
}: {
  account: ZoomAccountType;
  handleSetCurrentAccount: (account: ZoomAccountType) => void;
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
          <DropdownMenuTrigger asChild className="w-max">
            <Button variant={"outline-solid"} size="sm">
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
