"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick?: () => void;
  text?: string;
  variant?: "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
}

export function DeleteButton({
  onClick,
  text = "Deletar",
  variant = "destructive",
  className = "font-bold",
  isLoading = false,
  disabled = false,
  showIcon = true,
}: DeleteButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {showIcon && <Trash2 className="size-4" />}
      {text}
    </Button>
  );
}