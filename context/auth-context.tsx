"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../types/auth";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextProps {
  user: User | null;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userRole: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      updateAuthState(session);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      updateAuthState(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
