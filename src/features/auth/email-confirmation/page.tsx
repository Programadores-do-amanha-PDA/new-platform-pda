"use client";

import { Suspense } from "react";
import Image from "next/image";
import BinaryGrid from "@/components/shared/binary-grid";
import { Skeleton } from "@/components/ui/skeleton";

import { EmailConfirmationForm } from "./components/email-confirmation-form";
const WOMAN_IMAGE_PATH = "/assets/images/auth/woman-login-art.png";

const EmailConfirmationFormFallback = () => {
    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
        </div>
    );
};

export default function EmailConfirmationPage() {
    return (
        <div className="w-full h-full flex gap-6 bg-muted p-6 md:p-10">
            <div className="flex h-full w-full flex-col justify-center items-center gap-6">
                <Suspense fallback={<EmailConfirmationFormFallback />}>
                    <EmailConfirmationForm />
                </Suspense>
            </div>
            <div className="hidden w-full h-full flex-col md:flex">
                <div className="flex w-full h-full items-center justify-center text-primary-foreground rounded-xl relative bg-primary/50 overflow-clip">
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
                        className="size-96 absolute z-10"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
