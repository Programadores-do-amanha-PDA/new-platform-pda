"use client";
import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";
import BinaryRainBackground from "@/components/shared/binary-rain-background";
import womanArt from "/public/assets/images/login/woman-login-art.png";

export default function LoginPage() {
  return (
    <div className="w-full h-full flex gap-6 bg-muted p-6 md:p-10">
      <div className="flex h-full w-full flex-col justify-center items-center gap-6">
        <LoginForm />
      </div>
      <div className="flex w-full h-full flex-col">
        <div className="flex w-full h-full items-center justify-center text-primary-foreground relative bg-primary/55 rounded-xl overflow-clip">
          <BinaryRainBackground color="#000000" opacity={0.1} speed={60} />

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
