"use client";

import { SignInForm } from "./components";
import { SidePdaLogo } from "../shared/components/side-pda-logo";

export default function LoginPage() {
    return (
        <div className="w-full h-full flex gap-6 p-6 md:p-10">
            <div className="flex h-full w-full flex-col justify-center items-center gap-6">
                <SignInForm />
            </div>
            <SidePdaLogo />
        </div>
    );
}
