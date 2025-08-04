"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationButtonProps {
  onConfirm: () => void;
  buttonText?: string;
  dialogTitle?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  buttonVariant?: "destructive" | "outline" | "secondary" | "ghost";
  buttonClassName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationButton({
  onConfirm,
  buttonText = "Deletar",
  dialogTitle = "Confirmar Deleção",
  description,
  confirmText = "Deletar",
  cancelText = "Cancelar",
  buttonVariant = "destructive",
  buttonClassName = "font-bold",
  isLoading = false,
}: DeleteConfirmationButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={buttonVariant}
          className={buttonClassName}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {dialogTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="font-bold"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Deletando..." : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
