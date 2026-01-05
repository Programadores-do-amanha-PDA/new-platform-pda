"use client";

import Image from "next/image";

import BinaryGrid from "@/components/shared/binary-grid";
import useAuth from "@/features/shared/auth";

import { RequestResetPasswordByEmail, SetNewPassword } from "./components";

const WOMAN_IMAGE_PATH = "/assets/images/auth/woman-login-art.png";

export default function ResetPasswordPage() {
    const { user, loading } = useAuth();

    return (
        <div className="flex gap-6 bg-muted p-6 md:p-10 w-full h-full">
            <div className="flex flex-col justify-center items-center gap-6 w-full h-full">
                {!loading && !user ? <RequestResetPasswordByEmail /> : <SetNewPassword />}
            </div>
            <div className="hidden md:flex flex-col w-full h-full">
                <div className="relative flex justify-center items-center bg-primary/50 rounded-xl w-full h-full overflow-clip text-primary-foreground">
                    <BinaryGrid
                        baseColor="#000000"
                        activeColor="#4c1792"
                        className="opacity-55"
                        characterSize={12}
                        gap={24}
                        proximity={100}
                        characters={["0", "1"]}
                    />
                    <Image
                        src={WOMAN_IMAGE_PATH}
                        alt="Programadores do Amanhã"
                        width={500}
                        height={500}
                        className="z-10 absolute size-96"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
