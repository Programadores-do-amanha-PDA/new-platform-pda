import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { getAuthUser, getSession } from "@/app/actions/auth";
import { getProfileById } from "@/app/actions/profiles";
import { getAvatarUrlById } from "@/app/actions/profile-avatar";
import { AuthUserWithProfileT, JwtPayloadT, ProfileT, RolesT } from "@/types";

interface AuthState {
  user: AuthUserWithProfileT | null;
  userRole: RolesT | null
  loading: boolean;
}

interface AuthActions {
  setUser: (user: AuthUserWithProfileT | null) => void;
  setUserRole: (role: RolesT | null) => void;
  getUserProfile: (jwt: string) => Promise<void>;
  updateAuthState: (session: { access_token: string } | null) => Promise<void>;
  fetchSession: () => Promise<void>;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  userRole: null,
  loading: true,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setUserRole: (userRole) => set({ userRole }),

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
                profile: {
                  ...(userProfile as ProfileT),
                  avatarUrl: userAvatarUrl,
                },
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
          });
        }
      },

      updateAuthState: async (session) => {
        try {
          if (!session) {
            set({ ...initialState, loading: false });
            return;
          }

          const jwt = jwtDecode<JwtPayloadT>(session.access_token);
          if (!jwt?.user_role) {
            set({ ...initialState, loading: false });
            return;
          }

          set({ userRole: jwt.user_role });
          await get().getUserProfile(session.access_token);
        } catch {
          set({ ...initialState, loading: false });
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
        set({ ...initialState, loading: false });
      },
    }),
    { name: "AuthStore" }
  )
);
