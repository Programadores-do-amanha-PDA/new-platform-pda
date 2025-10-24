"use client";

// Global import
import { useRouter } from "next/navigation";

// Actions
import {
  signOut,
  updateAuthUser,
  requestPasswordResetWithUserEmail,
  resendAnEmailSignupConfirmation,
} from "@/app/actions";

// Stores
import { useAuthStore } from "@/stores/shared/auth-store";

export default function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    store.reset();
    router.push("/login");
  };

  return {
    ...store,
    handleResendAnEmailSignupConfirmation: resendAnEmailSignupConfirmation,
    handleRequestResetPassword: requestPasswordResetWithUserEmail,
    handleUpdateUser: updateAuthUser,
    handleSignOut,
  };
}
