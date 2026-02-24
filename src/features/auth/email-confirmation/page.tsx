import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { EmailConfirmationForm } from "./components/email-confirmation-form";
import { SidePdaLogo } from "../shared/components/side-pda-logo";

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
        <div className="w-full h-full flex gap-6 p-6 md:p-10">
            <div className="flex h-full w-full flex-col justify-center items-center gap-6">
                <Suspense fallback={<EmailConfirmationFormFallback />}>
                    <EmailConfirmationForm />
                </Suspense>
            </div>
            <SidePdaLogo />
        </div>
    );
}
