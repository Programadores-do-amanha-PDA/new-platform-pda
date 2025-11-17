"use client";

import { useRouter } from "next/navigation";

import {
  updateAuthUser,
  requestPasswordResetWithUserEmail,
  resendAnEmailSignupConfirmation,
  signOut,
} from "@/app/actions";
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
