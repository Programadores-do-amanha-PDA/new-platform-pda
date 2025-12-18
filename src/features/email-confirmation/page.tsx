"use client";

import Image from "next/image";
import BinaryGrid from "@/components/shared/binary-grid";

import { EmailConfirmationForm } from "./components/email-confirmation-form";
import womanArt from "/public/assets/images/login/woman-login-art.png";

export default function EmailConfirmationPage() {
  return (
    <div className="w-full h-full flex gap-6 bg-muted p-6 md:p-10">
      <div className="flex h-full w-full flex-col justify-center items-center gap-6">
        <EmailConfirmationForm />
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
            src={womanArt}
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
