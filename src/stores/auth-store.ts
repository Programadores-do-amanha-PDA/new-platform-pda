import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { AuthUserWithProfileType, JwtPayload } from "@/types/auth-types";
import { getAuthUser, getSession } from "@/app/actions/(auth)/auth";
import { getProfileById } from "@/app/actions/profiles";
import { getAvatarUrlById } from "@/app/actions/profile-avatar";

interface AuthState {
  user: AuthUserWithProfileType | null;
  userRole: "admin" | "employer" | "alumni" | null;
  loading: boolean;
  isRedirecting: boolean;
}

interface AuthActions {
  setUser: (user: AuthUserWithProfileType | null) => void;
  setUserRole: (role: "admin" | "employer" | "alumni" | null) => void;
  setIsRedirecting: (value: boolean) => void;
  getUserProfile: (jwt: string) => Promise<void>;
  updateAuthState: (session: { access_token: string } | null) => Promise<void>;
  fetchSession: () => Promise<void>;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  userRole: null,
  loading: true,
  isRedirecting: true,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setUserRole: (userRole) => set({ userRole }),
      setIsRedirecting: (isRedirecting) => set({ isRedirecting }),

      getUserProfile: async (jwt) => {
        try {
          const user = await getAuthUser(jwt);
          if (!user) {
            set({ user: null, loading: false });
            return;
          }

          const [userProfile, userAvatarUrl] = await Promise.all([
            getProfileById(user.id),
            getAvatarUrlById(user.id),
          ]);

          if (userProfile) {
            set({
              user: {
                ...user,
                profile: { ...userProfile, avatarUrl: userAvatarUrl },
              },
              loading: false,
            });
          } else {
            set({ user: null, loading: false });
          }
        } catch {
          set({
            user: null,
            userRole: null,
            loading: false,
            isRedirecting: false,
          });
        }
      },

      updateAuthState: async (session) => {
        try {
          if (!session) {
            set({ ...initialState, loading: false, isRedirecting: false });
            return;
          }

          const jwt = jwtDecode<JwtPayload>(session.access_token);
          if (!jwt?.user_role) {
            set({ ...initialState, loading: false, isRedirecting: false });
            return;
          }

          set({ userRole: jwt.user_role });
          await get().getUserProfile(session.access_token);
        } catch {
          set({ ...initialState, loading: false, isRedirecting: false });
        }
      },

      fetchSession: async () => {
        try {
          const session = await getSession();
          if (!session) throw new Error("No session found");

          await get().updateAuthState(session);
        } catch {
          set({ ...initialState, loading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: "AuthStore" }
  )
);
