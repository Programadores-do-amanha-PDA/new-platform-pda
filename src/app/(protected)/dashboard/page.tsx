"use client";
import AdminHomePage from "@/features/dashboard/home-page/admin/page";
import useAuth from "@/hooks/use-auth";

const Page = () => {
  const { user, userRole } = useAuth();

  if (user && userRole && userRole === "admin") return <AdminHomePage />;

  // Return null for other roles or when not authenticated
  return null;
};

export default Page;
