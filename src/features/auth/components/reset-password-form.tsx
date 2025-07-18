"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, AlertCircleIcon, ArrowLeft, Lock } from "lucide-react";

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
import pdaSymbol from "@/assets/logos/simbolo_pda_fundo_branco.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"
      ),
    confirmPassword: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const { handleUpdateUser, user } = useAuth();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      if (!user) throw new Error("user is null");

      const isReset = await handleUpdateUser({
        password: data.password,
      });

      if (isReset) {
        toast.success("Senha redefinida com sucesso!");
      } else {
        throw new Error("Não foi possível redefinir a senha");
      }
    } catch (error) {
      setError("root", {
        type: "manual",
        message: "Erro ao redefinir a senha. Tente novamente.",
      });
      console.log(error);
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
          <p className="group-hover:underline">Entrar</p>
        </Link>
      </div>
      <div className="flex flex-col gap-6 bg-b">
        <Image width={36} height={36} src={pdaSymbol} alt="PdA" />
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold">Redefinir senha</p>
          <p className="text-muted-foreground">
            Digite sua nova senha. Garanta que ela é segura e diferente de
            senhas anteriores.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {user?.email && (
              <Alert className="bg-blue-50">
                <AlertDescription className="text-blue-700">
                  Alterando senha para{" "}
                  <span className="font-semibold">{user?.email}</span>
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-semibold">Nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Crie uma nova senha"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-semibold">
                    Confirmar nova senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirme sua nova senha"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors.root && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>{errors.root.message}</AlertTitle>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold mt-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Redefinir senha
                </>
              )}
            </Button>
          </form>
        </Form>
        <Separator />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">
            Dicas de segurança:
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Use uma combinação de letras maiúsculas e minúsculas</li>
            <li>• Inclua números e caracteres especiais</li>
            <li>• Evite usar informações pessoais ou comuns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
