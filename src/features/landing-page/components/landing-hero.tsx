"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LandingPageVideoDialog } from "./landing-page-video-dialog";
import { TriangleWithoutPointSvg } from "@/components/icons/triangle-without-point-svg";
import { TriangleSvg } from "@/components/icons/triangle-svg";


function FloatingIcon({
    icon: Icon,
    className,
    delay = 0,
}: Readonly<{
    icon: React.ElementType;
    className: string;
    delay?: number;
}>) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -12, 0] }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        >
            <Icon className="size-8" />
        </motion.div>
    );
}

/**
 * Hero section with headline, subtitle, CTAs, and decorative floating elements.
 * Adapts the reference design's layout to PdA branding.
 */
export function LandingHero() {
    return (
        <section
            id="inicio"
            className="w-full relative flex min-h-[95vh] items-center justify-center overflow-hidden px-4 py-20 md:px-8"
            aria-label="Hero"
        >
            {/* Floating decorative icons */}
            <FloatingIcon
                icon={TriangleWithoutPointSvg}
                className="absolute top-[15%] left-[8%] size-14 text-primary/70"
                delay={0}
            />
            <FloatingIcon icon={TriangleSvg} className="absolute top-[12%] right-[10%] size-16 text-secondary/70" delay={0.8} />
            <FloatingIcon
                icon={TriangleSvg}
                className="absolute bottom-[20%] left-[12%] size-12 text-secondary/70"
                delay={1.6}
            />
            <FloatingIcon
                icon={TriangleWithoutPointSvg}
                className="absolute right-[8%] bottom-[25%] size-14 text-primary/70"
                delay={2.4}
            />

            {/* Decorative small crosses */}
            <div
                className="absolute top-[30%] left-[20%] text-2xl font-light text-white/20 select-none max-md:hidden"
                aria-hidden="true"
            >
                +
            </div>
            <div
                className="absolute right-[25%] bottom-[35%] text-2xl font-light text-white/20 select-none max-md:hidden"
                aria-hidden="true"
            >
                +
            </div>

            {/* Hero content */}
            <div className="relative flex flex-col z-10 mx-auto max-w-3xl text-center">
                <motion.figure
                    className="mb-4 text-sm font-semibold tracking-widest text-primary uppercase md:text-base"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image
                        src="/logos/logo-pda-horizontal-yellow-background.png"
                        alt="Programadores do Amanhã"
                        width={200}
                        height={56}
                        className="mx-auto h-12 w-auto md:h-14"
                        priority
                    />
                </motion.figure>

                <motion.h1
                    className="mb-6 text-4xl font-bold font-dela-gothic leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    Formando os <span className="text-primary">Desenvolvedores</span>
                    <br />
                    do Futuro
                </motion.h1>

                <motion.p
                    className="mx-auto mb-10 max-w-xl text-white/80 text-lg font-medium leading-relaxed md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    Transformamos vidas por meio da educação em tecnologia, capacitando jovens de comunidades diversas para o
                    mercado de desenvolvimento de software.
                </motion.p>

                <motion.section
                    role="group"
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                >
                    <Button variant="default" className="w-full sm:w-max" size="lg" asChild>
                        <Link href="/sign-in" className="cursor-pointer font-dela-gothic text-primary-foreground">
                            Acessar a plataforma
                        </Link>
                    </Button>
                    <LandingPageVideoDialog />
                </motion.section>
            </div>
        </section>
    );
}
