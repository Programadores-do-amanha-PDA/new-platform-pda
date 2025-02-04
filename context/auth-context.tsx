"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../types/auth";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import LoadingComponent from "@/components/loading-component";

interface AuthContextProps {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  redirectToRoleDashboard: () => void;
  setUser: (user: User) => void;
  setUserRole: (role: "admin" | "employer" | "alumni" | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userRole: null,
  loading: true,
  redirectToRoleDashboard: () => {},
  setUser: () => {},
  setUserRole: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<
    "admin" | "employer" | "alumni" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const updateAuthState = async (
      session: { user: User; access_token: string } | null
    ) => {
      if (session) {
        const jwt: JwtPayload = jwtDecode(session.access_token);
        setUserRole(jwt.user_role);
        setUser(session.user);
      } else {
        setUserRole(null);
        setUser(null);
      }
    };

    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        await updateAuthState(session);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await updateAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectToRoleDashboard = () => {
    if (!loading) {
      setIsRedirecting(true);

      if (user && userRole) {
        const routes = {
          admin: "/dashboard/admin",
          employer: "/dashboard/employer",
          alumni: "/dashboard/alumni",
        };

        const baseRoute = routes[userRole] || "/";

        if (!pathname.startsWith(baseRoute)) {
          router.push(baseRoute);
        }
      } else if (!user && !["/", "/confirmation"].includes(pathname)) {
        router.push("/");
      }

      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    redirectToRoleDashboard();
  }, [user, userRole, loading, pathname, router]);

  if (loading || isRedirecting) {
    return <LoadingComponent />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        setUser,
        setUserRole,
        redirectToRoleDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
