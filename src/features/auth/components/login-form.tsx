"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

import useAuth from "@/hooks/use-auth";

import { signInWithPassword } from "@/app/actions/(auth)";

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
import { Session } from "@supabase/supabase-js";
import Image from "next/image";
import pdaSymbol from "@/assets/logos/simbolo_pda_fundo_branco.png";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  error: boolean;
  confirmation?: boolean;
  data?: {
    session: Session;
  };
  message?: string;
}

export const LoginForm = () => {
  const router = useRouter();
  const { updateAuthState } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = form;

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response: LoginResponse = await signInWithPassword(data);

      console.log("Response:", response);

      if (response.error && response.confirmation) {
        toast.error("Confirme seu email para continuar.");
        router.push(
          `/resend-confirmation?email=${encodeURIComponent(data.email)}`
        );
        return;
      }

      // Erro de autenticação (credenciais inválidas)
      if (response.error && response.confirmation === false) {
        setError("root", {
          type: "manual",
          message: response.message || "Credenciais inválidas",
        });
        toast.error("Email ou senha incorretos.");
        return;
      }

      // Login bem-sucedido
      if (!response.error && response.data?.session) {
        updateAuthState(response.data.session);
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        return;
      }

      // Fallback para erros não tratados
      throw new Error(response.message || "Erro desconhecido");
    } catch (error) {
      console.error("Erro no login:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Verifique suas credenciais.";

      toast.error(errorMessage);
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <Image width={36} height={36} src={pdaSymbol} alt="PdA" />
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-bold">Entrar</p>
          <p className="text-muted-foreground">
            Use suas credenciais para acessar sua conta
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold">Senha</FormLabel>
                    <Link
                      href="/reset-password"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                      tabIndex={-1}
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors.root && (
              <div className="text-sm text-destructive font-medium">
                {errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold mt-2 cursor-pointer"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </Form>

        <div className="flex gap-2 justify-center items-center mt-6 text-center">
          <p className="text-sm text-muted-foreground">Primeiro acesso?</p>
          <Link
            href="/resend-confirmation"
            className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
          >
            Confirme seu email
          </Link>
        </div>
      </div>
    </div>
  );
};