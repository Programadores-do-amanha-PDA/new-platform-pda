"use client";

import { useState } from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeleteButton, DeleteConfirmationDialog } from "./delete-components";

// Componente combinado (mantido para compatibilidade)
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

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <DeleteButton
            text={buttonText}
            variant={buttonVariant}
            className={buttonClassName}
            isLoading={isLoading}
          />
        </AlertDialogTrigger>
      </AlertDialog>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        title={dialogTitle}
        description={description}
        confirmText={confirmText}
        cancelText={cancelText}
        isLoading={isLoading}
      />
    </>
  );
}
