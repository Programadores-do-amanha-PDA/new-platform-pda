"use client";
import {
  exchangeAuthCode,
  signOut,
  updateAuthUser,
} from "@/app/actions/(auth)";
import {
  requestPasswordResetWithUserEmail,
  resendAnEmailSignupConfirmation,
} from "@/app/actions/(auth)/emails";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const store = useAuthStore();
  const router = useRouter();

  const handleResendAnEmailSignupConfirmation = async (email: string) => {
    return await resendAnEmailSignupConfirmation(email);
  };

  const handleRequestResetPassword = async (email: string) => {
    return await requestPasswordResetWithUserEmail(email);
  };

  const handleExchangeAuthCode = async (code: string) => {
    return await exchangeAuthCode(code);
  };

  const handleUpdateUser = async (
    updates: Partial<{
      password: string;
      email: string;
      nonce: string;
      phone: string;
      data: object;
    }>
  ) => {
    return await updateAuthUser(updates);
  };

  const handleSignOut = async () => {
    await signOut();
    store.reset();
    router.push("/");
  };

  return {
    ...store,
    handleResendAnEmailSignupConfirmation,
    handleRequestResetPassword,
    handleExchangeAuthCode,
    handleUpdateUser,
    handleSignOut,
  };
};
