import { ClassroomDataLoaderProvider } from "@/providers";

interface ClassroomLayoutProps {
  children: React.ReactNode;
  params: {
    classroom_id: string;
  };
}

export default function ClassroomLayout({
  children,
  params,
}: ClassroomLayoutProps) {
  return (
    <ClassroomDataLoaderProvider classroomId={params.classroom_id}>
      {children}
    </ClassroomDataLoaderProvider>
  );
}