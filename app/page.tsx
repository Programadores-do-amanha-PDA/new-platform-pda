"use client";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";

import Logo from "/public/assets/logos/Logo_PDA_Horizontal_FundoBranco.png";

export default function LoginPage() {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex items-center justify-center rounded-md text-primary-foreground">
            <Image
              src={Logo}
              alt="Programadores do Amanhã"
              width={200}
              height={500}
            />
          </div>
        </a>
        <LoginForm/>
      </div>
    </div>
  );
}
