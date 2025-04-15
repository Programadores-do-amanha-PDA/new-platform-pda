"use client";
import { useCallback, useState } from "react";
import { Button, ButtonProps } from "./ui/button";
import { LoaderCircle } from "lucide-react";

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
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = useCallback(async () => {
    console.log("Button clicked, setting isLoading to true");
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
