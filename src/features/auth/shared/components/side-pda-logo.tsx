"use client";

import Stack from "@/components/Stack";
import dynamic from "next/dynamic";
import Image from "next/image";

const CARDS = [
    { id: 1, img: "/auth/pda-students.jpg" },
    { id: 2, img: "/auth/pda-students-2.webp" },
    { id: 3, img: "/auth/pda-students-3.webp" },
    { id: 4, img: "/auth/pda-students-4.webp" },
];

const Grainient = dynamic(() => import("@/components/Grainient"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-linear-to-br from-[#d2b43d] via-[#2D1044] to-[#A08B30]" aria-hidden="true" />
    ),
});

export const SidePdaLogo = () => {
    return (
        <>
            <div className="hidden [@media(min-width:1100px)]:flex relative justify-center items-center bg-primary/50 rounded-xl w-full h-full overflow-clip text-primary-foreground bg-linear-1200 from-[#edcd4d] to-[#421864]">
                <Grainient
                    color1="#d2b43d"
                    color2="#2D1044"
                    color3="#A08B30"
                    timeSpeed={0.15}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={1.5}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.08}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.4}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
                <p className="absolute bottom-10 text-lg text-white font-dela-gothic">Um pouquinho da nossa história...</p>
                <div className="size-[60%] z-50 absolute top-0 left-0 right-0 bottom-0 m-auto">
                    <Stack
                        randomRotation={true}
                        sensitivity={200}
                        mobileBreakpoint={768}
                        cards={CARDS.map((card) => (
                            <figure
                                key={`card-${card.id}`}
                                className="relative w-full h-full flex flex-col rounded-lg overflow-hidden bg-red-50"
                            >
                                <Image
                                    src={card.img}
                                    alt={`Card ${card.id}`}
                                    width={400}
                                    height={400}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </figure>
                        ))}
                        autoplay={true}
                        autoplayDelay={3000}
                        pauseOnHover={false}
                    />
                </div>
            </div>

            <div className="fixed inset-0 -z-10 flex [@media(min-width:1100px)]:hidden w-full h-full" aria-hidden="true">
                <Grainient
                    color1="#d2b43d"
                    color2="#2D1044"
                    color3="#A08B30"
                    timeSpeed={0.15}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={1.5}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.08}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.4}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
            </div>
        </>
    );
};
