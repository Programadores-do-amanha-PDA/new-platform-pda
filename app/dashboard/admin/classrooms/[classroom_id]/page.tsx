export default async function Page({
  params,
}: {
  params: Promise<{ classroom_id: string }>;
}) {
  const { classroom_id } = await params;
  return <div>My Post: {classroom_id}</div>;
}
