import { ClassroomDataLoaderProvider } from "@/providers";

interface ClassroomLayoutProps {
  children: React.ReactNode;
  params: Promise<{ classroom_id: string; }>;
}

export default function ClassroomLayout({
  children,
}: ClassroomLayoutProps) {
  return (
    <ClassroomDataLoaderProvider>
      {children}
    </ClassroomDataLoaderProvider>
  );
}