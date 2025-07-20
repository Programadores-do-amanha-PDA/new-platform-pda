import ProfilesDataTable from "./admin/components/profiles-data-table";

export default function AllUsersPage() {
  return (
    <main className="relative w-full overflow-hidden flex flex-col p-4 gap-4">
      <div className="w-full h-full flex relative overflow-y-auto">
        <ProfilesDataTable loading={false} />
      </div>
    </main>
  );
}
