"use client";
import { useCallback, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import { type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

const RefreshButton = ({
  children,
  handleClick,
  className,
  variant,
  size,
  ...rest
}: {
  children: React.ReactNode;
  handleClick: () => Promise<void>;
  className?: string;
  variant?: ButtonVariantProps["variant"];
  size?: ButtonVariantProps["size"];
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await handleClick();
    } catch (error) {
      console.error("Error in handleClick:", error);
    } finally {
      setIsLoading(false);
    }
  }, [handleClick]);

  return (
    <Button
      onClick={handleOnClick}
      className={className}
      variant={variant}
      size={size}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? <LoaderCircle className="size-5 animate-spin" /> : children}
    </Button>
  );
};

export default RefreshButton;
