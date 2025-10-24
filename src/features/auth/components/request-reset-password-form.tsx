"use client";

// Global imports
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Hooks
import useAuth from "@/hooks/use-auth";

// Local imports
import { resetPasswordSchema } from "../utils";
import { ResetPasswordFormDataT } from "../types";
import { useCooldownManager } from "../utils/cooldown-manager";

// Assets
import pdaSymbol from "/public/assets/logos/simbolo_pda_fundo_branco.png";

export const RequestResetPasswordForm = () => {
  const { handleRequestResetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormDataT>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const currentEmail = form.watch("email");

  const {
    cooldown,
    lastSentEmail,
    isEmailChanged,
    canResend,
    startCooldown,
    formatTime,
  } = useCooldownManager(
    {
      duration: 120,
      storageKey: "reset_password_cooldown",
      emailStorageKey: "pending_reset_email",
    },
    currentEmail
  );

  const onSubmit = async (values: ResetPasswordFormDataT) => {
    try {
      setIsSubmitting(true);

      const success = await handleRequestResetPassword(values.email);
      if (success) {
        startCooldown(values.email);
        toast.success("Solicitação enviada com sucesso!");
        setIsSuccess(true);
      } else {
        throw new Error("Não foi possível enviar a solicitação");
      }
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao enviar solicitação. Tente novamente.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (form.getValues().email && canResend) {
      await onSubmit(form.getValues());
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
      <div className="w-full flex items-start justify-start">
        <Link
          href="/login"
          className="flex gap-2 items-center cursor-pointer text-muted-foreground font-semibold group"
        >
          <ArrowLeft className="size-5" />
          <p className="group-hover:underline">Voltar para login</p>
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Image width={36} height={36} src={pdaSymbol} alt="PdA" />
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold">Redefinir senha</p>
          <p className="text-muted-foreground">
            {isSuccess
              ? "Verifique seu e-mail para redefinir sua senha."
              : "Digite seu e-mail para receber as instruções de redefinição."}
          </p>
        </div>
      </div>

      {!isSuccess ? (
        <div className="flex flex-col gap-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel className="font-semibold">E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEmailChanged && cooldown > 0 && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Você alterou o e-mail. Pode reenviar imediatamente para o
                    novo endereço.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !canResend}
                className="w-full font-semibold mt-2 cursor-pointer"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : !canResend ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Aguarde {formatTime(cooldown)}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar solicitação
                  </>
                )}
              </Button>

              {lastSentEmail && cooldown > 0 && !isEmailChanged && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    E-mail enviado para{" "}
                    <span className="font-medium text-foreground">
                      {lastSentEmail}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Você pode reenviar em {formatTime(cooldown)}
                  </p>
                </div>
              )}
            </form>
          </Form>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert>
            <Mail />
            <AlertTitle className="font-bold">Instruções enviadas!</AlertTitle>
            <AlertDescription>
              Um e-mail foi enviado para{" "}
              <span className="font-bold">{form.getValues().email}</span> com os
              passos para redefinir sua senha.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                form.reset();
                setIsSuccess(false);
              }}
              variant="outline"
              className="cursor-pointer"
            >
              Solicitar para outro e-mail
            </Button>
            <Button
              onClick={handleResend}
              disabled={!canResend}
              variant="link"
              className="!text-blue-600 cursor-pointer hover:outline disabled:opacity-50"
            >
              {!canResend ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Aguarde {formatTime(cooldown)}
                </>
              ) : (
                "Reenviar instruções"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
