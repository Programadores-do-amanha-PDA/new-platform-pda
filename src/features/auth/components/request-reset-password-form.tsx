"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import useAuth from "@/hooks/use-auth";

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
import Image from "next/image";
import pdaSymbol from "/public/assets/logos/simbolo_pda_fundo_branco.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const requestResetPasswordSchema = z.object({
  email: z
    .string()
    .email("Forneça um e-mail válido")
    .min(1, "O e-mail é obrigatório"),
});

type RequestResetPasswordFormData = z.infer<typeof requestResetPasswordSchema>;

export const RequestResetPasswordForm = () => {
  const { handleRequestResetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RequestResetPasswordFormData>({
    resolver: zodResolver(requestResetPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: RequestResetPasswordFormData) => {
    try {
      setIsSubmitting(true);

      const success = await handleRequestResetPassword(values.email);
      if (success) {
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

  const handleResend = () => {
    if (form.getValues().email) {
      onSubmit(form.getValues());
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold mt-2 cursor-pointer"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar solicitação
                  </>
                )}
              </Button>
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
              variant="link"
              className="!text-blue-600 cursor-pointer hover:outline"
            >
              Reenviar instruções
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
