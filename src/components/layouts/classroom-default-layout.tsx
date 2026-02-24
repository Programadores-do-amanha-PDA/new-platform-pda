import { use } from "react";
import { ClassroomDataLoaderProvider } from "@/features/classrooms/data-loader";

interface ClassroomLayoutProps {
  readonly children: React.ReactNode;
  readonly params: Promise<{ classroom_id: string }>;
}

/**
 * Classroom Default Layout - Wraps classroom pages with data loader.
 *
 * Handles async params resolution and provides classroom data loading
 * based on user role. Uses React 19's `use()` hook to unwrap params promise.
 *
 * @param props - Component props
 * @param props.children - Classroom page content
 * @param props.params - Async params containing classroom_id
 * @returns JSX element with data loader wrapping children
 */
export default function ClassroomLayout({
  children,
  params,
}: Readonly<ClassroomLayoutProps>) {
  // React 19: use() hook to unwrap async params
  const { classroom_id } = use(params);

  return (
    <ClassroomDataLoaderProvider classroomId={classroom_id}>
      {children}
    </ClassroomDataLoaderProvider>
  );
}