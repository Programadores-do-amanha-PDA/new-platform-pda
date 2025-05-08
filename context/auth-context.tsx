"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthUserWithProfileType, JwtPayload } from "../types/auth";
import { usePathname, useRouter } from "next/navigation";
import LoadingComponent from "@/components/common/loading-component";

import { getAuthUser, getSession } from "@/utils/supabase/actions/client/auth";
import { getProfileById } from "@/utils/supabase/actions/profiles";
import { resendAnEmailSignupConfirmation, signOut } from "@/app/actions/auth";
import { toast } from "sonner";
import { getAvatarUrlById } from "@/app/actions/profile_avatar";

interface AuthContextProps {
  user: AuthUserWithProfileType | null;
  userRole: string | null;
  loading: boolean;
  redirectToRoleDashboard: () => void;
  setUser: (user: AuthUserWithProfileType) => void;
  setUserRole: (role: "admin" | "employer" | "alumni" | null) => void;
  handleSignOut: () => Promise<void>;
  handleResendAnEmailSignupConfirmation: (email: string) => Promise<boolean>;
  fetchSession: () => Promise<void>;
  updateAuthState: (session: { access_token: string } | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUserWithProfileType | null>(null);
  const [userRole, setUserRole] = useState<
    "admin" | "employer" | "alumni" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(true);

  const getUserProfile = async (jwt: string) => {
    const user = await getAuthUser(jwt);
    if (user) {
      const userProfile = await getProfileById(user.id);
      const userAvatarUrl = await getAvatarUrlById(user.id);
      if (userProfile) {
        setUser({
          ...user,
          profile: {...userProfile, avatarUrl: userAvatarUrl},
        });
        setLoading(false);
      } else if (!userProfile) {
        setUser(null);
      }
    } else if (!user) {
      setUser(null);
      setUserRole(null);
      setIsRedirecting(false);
    }
  };

  const updateAuthState = async (session: { access_token: string } | null) => {
    if (session) {
      const jwt: JwtPayload = jwtDecode(session.access_token);
      if (jwt && jwt.user_role) {
        setUserRole(jwt.user_role);
        await getUserProfile(session.access_token);
      } else if (!jwt || !jwt.user_role) {
        setUser(null);
        setUserRole(null);
        setIsRedirecting(false);
      }
    } else if (!session) {
      setUser(null);
      setUserRole(null);
      setIsRedirecting(false);
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    const session = await getSession();
    if (session) {
      await updateAuthState(session);
    } else if (!session) {
      setUser(null);
      setUserRole(null);
      setLoading(false);
    }
  };

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

  const handleSignOut = async () => {
    const isSigningOut = await signOut();
    if (isSigningOut) {
      toast.error("Usuario deslogado com sucesso!");
      setUser(null);
      setUserRole(null);
      router.push("/");
      return;
    }

    toast.error("Falha ao deslogar o usuário! Tente novamente mais tarde!");
    return;
  };

  const handleResendAnEmailSignupConfirmation = async (email: string) => {
    const isResendingConfirmation = await resendAnEmailSignupConfirmation(
      email
    );
    if (isResendingConfirmation) {
      toast.success("Confirmação de email reenviada com sucesso!");
      return true;
    }

    toast.error(
      "Falha ao reenviar a confirmação de email! Tente novamente mais tarde!"
    );
    return false;
  };

  useEffect(() => {
    fetchSession();
  }, []);

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
        handleSignOut,
        handleResendAnEmailSignupConfirmation,
        fetchSession,
        updateAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
