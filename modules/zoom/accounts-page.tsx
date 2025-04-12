"use client";
import { useState } from "react";
import { Search } from "lucide-react";

import { useAdminStackContext } from "@/context/admin/stack-context";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ZoomAccountCard from "@/components/classrooms/zoom/accounts/account-card";
import AccountDialog from "@/components/classrooms/zoom/accounts/account-dialog";

import { ZoomAccountType } from "@/types/zoom/accounts";

const AccountsPage = ({ classroom_id }: { classroom_id: string }) => {
  const {
    classroomsStack: {
      zoom: {
        accounts: {
          accounts,
          handleCreateZoomAccount,
          handleUpdateZoomAccountById,
        },
      },
    },
  } = useAdminStackContext();

  const [searchFilter, setSearchFilter] = useState<string>("");
  const filteredAccounts = accounts.filter(
    (account) =>
      (account.me &&
        account.me?.first_name
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase())) ||
      account.me?.last_name?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const [currentAccount, setCurrentAccount] = useState<ZoomAccountType | null>(
    null
  );

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <header className="w-full flex items-center justify-between flex-wrap p-4 gap-4">
        <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-sm rounded-md border px-2">
          <Input
            id="search"
            type="text"
            placeholder="Buscando algo?"
            className="max-w-xs !border-none !ring-0 shadow-none !rounded-none"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <Label htmlFor="search">
            <Search className="size-5 text-primary-foreground" />
          </Label>
        </div>

        <AccountDialog
          classroom_id={classroom_id}
          handleCreateZoomAccount={handleCreateZoomAccount}
          currentAccount={currentAccount}
          handleSetCurrentAccount={setCurrentAccount}
          handleUpdateZoomAccountById={handleUpdateZoomAccountById}
        />
      </header>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2">
        {filteredAccounts.map((account) => (
          <ZoomAccountCard
            expansive={true}
            account={account}
            key={account.id}
            handleSetCurrentAccount={setCurrentAccount}
          />
        ))}
      </ul>
    </div>
  );
};

export default AccountsPage;
