"use client";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface RefreshButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  onRefresh?: () => Promise<void> | void;
}

const RefreshButton = ({
  children,
  className,
  variant,
  size,
  onRefresh,
  ...rest
}: RefreshButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnClick = useCallback(async () => {
    if (!onRefresh) return;

    setIsLoading(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error in refresh action:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onRefresh]);

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
