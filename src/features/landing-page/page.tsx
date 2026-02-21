"use client";

import dynamic from "next/dynamic";
import { LandingFeatures } from "./components/landing-features";
import { LandingHero } from "./components/landing-hero";


const Grainient = dynamic(() => import("@/components/Grainient"), {
  ssr: false,
});

/**
 * Root landing page — public-facing home screen.
 * Composed of header, hero, and features sections with animated gradient background.
 */
export default function RootPage() {
  return (
    <div className="relative w-full flex-col items-center overflow-y-auto">
      {/* Full-screen animated gradient background */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
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

      <main className="flex-1 flex max-w-[1920px] items-center justify-center">
        <LandingHero />
      </main>
      <LandingFeatures />
    </div>
  );
}
