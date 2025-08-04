"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Clock, AlertCircleIcon, ArrowLeft } from "lucide-react";

import useAuth from "@/hooks/use-auth";

import Image from "next/image";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";

import pdaSymbol from "/public/assets/logos/simbolo_pda_fundo_branco.png";

const resendConfirmationSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido")
    .toLowerCase(),
});

type ResendConfirmationFormData = z.infer<typeof resendConfirmationSchema>;

const INITIAL_COOLDOWN = 120;
const STORAGE_KEY = "resend_confirmation_cooldown";

export const ResendConfirmationForm = () => {
  const searchParams = useSearchParams();
  const { handleResendAnEmailSignupConfirmation } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [lastSentEmail, setLastSentEmail] = useState<string>("");

  const form = useForm<ResendConfirmationFormData>({
    resolver: zodResolver(resendConfirmationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
    setError,
  } = form;

  const currentEmail = watch("email");

  useEffect(() => {
    const getInitialEmail = () => {
      const emailFromUrl = searchParams?.get("email");

      let emailFromHash = "";
      if (typeof window !== "undefined") {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        emailFromHash = params.get("email") || "";

        if (emailFromHash) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }

      const emailFromStorage =
        typeof window !== "undefined"
          ? localStorage.getItem("pending_confirmation_email") || ""
          : "";

      const email = emailFromUrl || emailFromHash || emailFromStorage;

      if (email) {
        setValue("email", email);
        setLastSentEmail(email);
      }
    };

    getInitialEmail();
  }, [searchParams, setValue]);

  useEffect(() => {
    const loadCooldown = () => {
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const { endTime, email } = JSON.parse(stored);
          const remaining = Math.max(
            0,
            Math.floor((endTime - Date.now()) / 1000)
          );

          if (remaining > 0 && email === currentEmail) {
            setCooldown(remaining);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    loadCooldown();
  }, [currentEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        const newValue = prev - 1;

        if (newValue <= 0) {
          localStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const startCooldown = (email: string) => {
    const endTime = Date.now() + INITIAL_COOLDOWN * 1000;
    setCooldown(INITIAL_COOLDOWN);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ endTime, email }));
      localStorage.setItem("pending_confirmation_email", email);
    }
  };

  const onSubmit = async (data: ResendConfirmationFormData) => {
    try {
      if (!data.email) throw new Error("Email is not provided");

      const isResent = await handleResendAnEmailSignupConfirmation(data.email);

      if (isResent) {
        setLastSentEmail(data.email);
        startCooldown(data.email);
        toast.success("Email de confirmação enviado com sucesso!");
      } else {
        throw new Error("Não foi possível enviar o email");
      }
    } catch (error) {
      console.error("Erro ao reenviar confirmação:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao enviar email. Tente novamente.";

      toast.error(errorMessage);
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isEmailChanged = currentEmail !== lastSentEmail;
  const canResend = cooldown === 0 || isEmailChanged;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
      <div className="w-full flex items-start justify-start">
        <Link
          href="/login"
          className="flex gap-2 items-center cursor-pointer text-muted-foreground font-semibold group"
        >
          <ArrowLeft className="size-5" />
          <p className="group-hover:underline">Entrar</p>
        </Link>
      </div>
      <div className="flex flex-col gap-6 bg-b">
        <Image width={36} height={36} src={pdaSymbol} alt="PdA" />
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold">Confirmar Email</p>
          <p className="text-muted-foreground">
            A verificação de email é importante para garantirmos a segurança em
            sua conta!
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
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
                  Você alterou o email. Pode reenviar imediatamente para o novo
                  endereço.
                </AlertDescription>
              </Alert>
            )}

            {errors.root && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{errors.root.message}</AlertTitle>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !canResend}
              className="w-full font-semibold"
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
                "Reenviar confirmação"
              )}
            </Button>

            {lastSentEmail && cooldown > 0 && !isEmailChanged && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Email enviado para{" "}
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
        <Separator />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">
            Não recebeu o email?
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Verifique sua caixa de spam</li>
            <li>• Confirme se o email está correto</li>
            <li>• Aguarde alguns minutos para o email chegar</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
