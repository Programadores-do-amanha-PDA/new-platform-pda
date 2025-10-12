"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface AsyncActionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  onAction?: () => Promise<void> | void;
}

const AsyncActionButton = ({
  children,
  className,
  variant,
  size,
  onAction,
  ...rest
}: AsyncActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = useCallback(async () => {
    if (!onAction) return;

    setIsLoading(true);
    try {
      await onAction();
    } catch (error) {
      console.error("Error in async action:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onAction]);

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

export default AsyncActionButton;
