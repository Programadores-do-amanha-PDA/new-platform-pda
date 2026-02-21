"use client";

import { motion } from "motion/react";

import SpotlightCard from "@/components/SpotlightCard";
import CountUp from "@/components/CountUp";

/**
 * Feature item configuration.
 */
interface FeatureItem {
    readonly title: React.ElementType;
    readonly description: string;
}

/**
 * Features displayed in the landing page service section.
 */
const FEATURES: readonly FeatureItem[] = [
    {
        title: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 {...props}>
                R$ <CountUp from={0} to={6} separator="," direction="up" duration={3} className="count-up-text" /> milhões
            </h3>
        ),
        description: "Gerados em renda agregada por nossos estudantes ao se empregarem em vagas de tecnologia",
    },
    {
        title: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 {...props}>
                <CountUp from={0} to={150} separator="," direction="up" duration={3} className="count-up-text" />%
            </h3>
        ),
        description: "Aumento médio na renda familiar dos participantes",
    },
    {
        title: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 {...props}>
                <CountUp from={0} to={33} separator="," direction="up" duration={3} className="count-up-text" />%
            </h3>
        ),
        description: "Das empresas de tecnologia no Brasil não têm colaboradores negros no time de tecnologia",
    },
    {
        title: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 {...props}>
                <CountUp from={0} to={72} separator="," direction="up" duration={3} className="count-up-text" />%
            </h3>
        ),
        description: "Da população entre 14 e 29 anos que não completou alguma etapa obrigatória do Ensino são negros",
    },
];

/**
 * Individual feature card with spotlight hover effect.
 */
function FeatureCard({ feature, index }: Readonly<{ feature: FeatureItem; index: number }>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <SpotlightCard
                className="h-full rounded-xl! border-white/10! bg-card/80! backdrop-blur-sm p-6!"
                spotlightColor="rgba(244, 203, 37, 0.404)"
            >
                <div className="flex flex-col gap-3">
                    <feature.title className="text-xl font-dela-gothic text-card-foreground" />
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
            </SpotlightCard>
        </motion.div>
    );
}

/**
 * Features/services section — 4-card grid replicating the reference design.
 */
export function LandingFeatures() {
    return (
        <section
            id="sobre"
            className="relative flex flex-col items-center gap-10 z-40 bg-background/10 backdrop-blur-md px-4 py-10 md:px-8"
            aria-label="Nossos diferenciais"
        >
            <motion.h1
                className="mb-6 text-xl font-bold font-dela-gothic leading-tight text-white drop-shadow-lg md:text-2xl lg:text-3xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
            >
                Nosso Impacto
            </motion.h1>
            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature, index) => (
                        <FeatureCard key={`feature-${index}`} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
