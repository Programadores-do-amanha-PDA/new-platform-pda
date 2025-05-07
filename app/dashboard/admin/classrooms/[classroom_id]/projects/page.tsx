import AllProjectsPage from "@/modules/projects/all-projects-page";

const Page = async ({
  params,
}: {
  params: Promise<{ classroom_id: string }>;
}) => {
  const { classroom_id } = await params;
  return <AllProjectsPage classroom_id={classroom_id} />;
};

export default Page;
