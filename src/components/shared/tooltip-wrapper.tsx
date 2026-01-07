import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Props for the TooltipWrapper component.
 */
interface TooltipWrapperProps {
  /**
   * The element or component to be wrapped with tooltip.
   */
  readonly children: React.ReactNode;

  /**
   * The tooltip content (title/text to be displayed).
   */
  readonly title: string | React.ReactNode;

  /**
   * Optional side position of the tooltip.
   * @default "top"
   */
  readonly side?: "top" | "right" | "bottom" | "left";

  /**
   * Optional delay before showing the tooltip (in milliseconds).
   * @default 200
   */
  readonly delayDuration?: number;

  /**
   * Optional CSS class for the trigger element.
   */
  readonly className?: string;

  /**
   * Optional CSS class for the tooltip content.
   */
  readonly contentClassName?: string;
}

/**
 * A reusable tooltip wrapper component.
 *
 * Wraps any component or element with a tooltip, functioning similarly to
 * the native HTML `title` attribute, but using the Radix UI Tooltip component
 * with better styling and UX.
 *
 * @param props - The component props.
 * @returns The wrapped component with tooltip functionality.
 *
 * @example
 * // Basic usage
 * <TooltipWrapper title="Click to save">
 *   <Button>Save</Button>
 * </TooltipWrapper>
 *
 * @example
 * // With custom position and delay
 * <TooltipWrapper
 *   title="This is a helpful hint"
 *   side="right"
 *   delayDuration={500}
 * >
 *   <IconButton icon={InfoIcon} />
 * </TooltipWrapper>
 */
export const TooltipWrapper = ({
  children,
  title,
  side = "top",
  delayDuration = 700,
  className,
  contentClassName,
}: Readonly<TooltipWrapperProps>) => {
  return (
    <Tooltip delayDuration={delayDuration} >
      <TooltipTrigger asChild className={className}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={contentClassName}>
        {typeof title === "string" ? <p>{title}</p> : title}
      </TooltipContent>
    </Tooltip>
  );
};

export type { TooltipWrapperProps };
