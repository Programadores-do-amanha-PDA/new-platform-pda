import AccountsPage from "@/modules/zoom/accounts-page";

const Page = async ({
  params,
}: {
  params: Promise<{ classroom_id: string }>;
}) => {
    const { classroom_id } = await params;
  return <AccountsPage classroom_id={classroom_id} />;
};
export default Page;
