"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useZoomAccountStore } from "@/stores/modules/classrooms/zoom/accounts";
import AccountDialog from "../components/accounts/account-dialog";
import ZoomAccountCard from "../components/accounts/account-card";
import { ZoomAccountT } from "@/types/zoom";

export default function AccountsPage() {
  const params = useParams();
  const classroom_id = Array.isArray(params.classroom_id)
    ? params.classroom_id[0]
    : params.classroom_id;

  const { accounts, createAccount, updateAccount } = useZoomAccountStore();
  const [searchFilter, setSearchFilter] = useState<string>("");
  const filteredAccounts = accounts.filter(
    (account) =>
      (account.me &&
        account.me?.first_name
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase())) ||
      account.me?.last_name?.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const [currentAccount, setCurrentAccount] = useState<ZoomAccountT | null>(
    null
  );

  if (!classroom_id) return null;

  return (
    <div className="w-full h-full flex flex-col px-4 gap-6">
      <header className="w-full flex items-center justify-between flex-wrap py-4 gap-4">
        <Input
          id="search"
          type="text"
          placeholder="Buscando algo?"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-xs min-w-72 "
        />

        <AccountDialog
          classroom_id={classroom_id}
          createAccount={createAccount}
          currentAccount={currentAccount}
          handleSetCurrentAccount={setCurrentAccount}
          updateAccount={updateAccount}
        />
      </header>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto">
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
}
