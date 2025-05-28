import { signOut } from "@/app/actions/(auth)";
import { resendAnEmailSignupConfirmation } from "@/app/actions/(auth)/emails";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const store = useAuthStore();
  const router = useRouter();

  return {
    ...store,
    handleSignOut: async () => {
      await signOut();
      store.reset();
      router.push("/");
    },

    handleResendAnEmailSignupConfirmation: async (email: string) => {
      return await resendAnEmailSignupConfirmation(email);
    },
  };
};
