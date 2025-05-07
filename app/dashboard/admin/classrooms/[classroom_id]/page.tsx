import ClassroomHomePage from "@/modules/classroom/home-page";

export default async function Page({
  params,
}: {
  params: { classroom_id: string };
}) {
  const { classroom_id } = params;

  return <ClassroomHomePage classroom_id={classroom_id} />;
}
