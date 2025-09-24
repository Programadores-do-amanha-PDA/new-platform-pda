"use client";
import Image from "next/image";

import BinaryRainBackground from "@/components/shared/binary-rain-background";
import { ResendConfirmationForm } from "@/features/auth/components/resend-confirmation-form";

import womanArt from "/public/assets/images/login/woman-login-art.png";

export default function ResendConfirmationPage() {
  return (
    <div className="w-full h-full flex gap-6 bg-muted p-6 md:p-10">
      <div className="flex h-full w-full flex-col justify-center items-center gap-6">
        <ResendConfirmationForm />
      </div>
      <div className="hidden w-full h-full flex-col md:flex">
        <div className="flex w-full h-full items-center justify-center text-primary-foreground rounded-xl relative bg-primary/50 overflow-clip">
          <BinaryRainBackground color="#000000" opacity={0.1} speed={30} />
          <Image
            src={womanArt}
            alt="Programadores do Amanhã"
            width={500}
            height={500}
            className="size-96 z-10"
            priority
          />
        </div>
      </div>
    </div>
  );
}
