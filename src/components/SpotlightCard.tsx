import React, { useRef, useState } from "react";

interface Position {
    x: number;
    y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
    readonly className?: string;
    readonly spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

/**
 * A card component that displays a spotlight effect following the mouse cursor.
 *
 * @component
 * @example
 * <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.25)">
 *   <h1>Featured Content</h1>
 * </SpotlightCard>
 *
 * @param {SpotlightCardProps} props - The component props
 * @param {React.ReactNode} props.children - The content to be rendered inside the card
 * @param {string} [props.className=""] - Additional CSS classes to apply to the card container
 * @param {string} [props.spotlightColor="rgba(255, 255, 255, 0.25)"] - The color of the spotlight effect as a CSS color value
 *
 * @returns {React.ReactElement} A focused/interactive card with a dynamic spotlight gradient effect
 *
 * @remarks
 * - The spotlight effect follows the mouse position within the card
 * - The spotlight is disabled while the element is focused (keyboard navigation)
 * - Opacity is set to 0.6 on focus or mouse enter, and 0 on blur or mouse leave
 * - Built with Tailwind CSS for styling
 */
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }: SpotlightCardProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState<number>(0);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(0.6);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(0.6);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
                }}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;
