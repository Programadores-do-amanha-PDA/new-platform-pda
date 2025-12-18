"use client";

import Image from "next/image";
import BinaryGrid from "@/components/shared/binary-grid";

import { SignInForm } from "./components";
import womanArt from "/public/assets/images/login/woman-login-art.png";

export default function LoginPage() {
    return (
        <div className="w-full h-full flex gap-6 p-6 md:p-10">
            <div className="flex h-full w-full flex-col justify-center items-center gap-6">
                <SignInForm />
            </div>
            <div className="hidden w-full h-full flex-col md:flex">
                <div className="flex w-full h-full items-center justify-center text-primary-foreground relative bg-primary/55 rounded-xl overflow-clip">
                    <BinaryGrid
                        baseColor="#000000"
                        activeColor="#333333"
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
