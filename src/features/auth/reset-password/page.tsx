"use client";

import { useAuth } from "@/features/auth/shared";

import { RequestResetPasswordByEmail, SetNewPassword } from "./components";
import { SidePdaLogo } from "../shared/components/side-pda-logo";

export default function ResetPasswordPage() {
    const { user, loading } = useAuth();

    return (
        <div className="flex gap-6 bg-muted p-6 md:p-10 w-full h-full">
            <div className="flex flex-col justify-center items-center gap-6 w-full h-full">
                {!loading && !user ? <RequestResetPasswordByEmail /> : <SetNewPassword />}
            </div>
            <SidePdaLogo />
        </div>
    );
}
