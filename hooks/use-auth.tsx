import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { JwtPayload, User } from "../types/auth";
import { createClient } from "@/utils/supabase/client";

export const useAuth = () => {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Função para atualizar o estado do usuário e o papel
    const updateAuthState = async (
      session: { user: User; access_token: string } | null
    ) => {
      if (session) {
        const jwt: JwtPayload = jwtDecode(session.access_token);
        setUserRole(jwt.user_role); // Define o papel do usuário
        setUser(session.user); // Define os dados do usuário
      } else {
        setUserRole(null);
        setUser(null);
      }
    };

    // Verifica o estado de autenticação inicial
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      updateAuthState(session);
    };

    fetchSession();

    // Escuta mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      updateAuthState(session);
    });

    // Limpa a inscrição ao desmontar o componente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, userRole }; // Retorna tanto o usuário quanto o papel
};
