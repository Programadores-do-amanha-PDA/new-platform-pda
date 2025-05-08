"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  confirmSignInAndSetSession,
  signInWithPassword,
} from "@/app/actions/auth";
import Link from "next/link";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirectToRoleDashboard, updateAuthState } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const confirmSignIn = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const type = params.get("type");
      const expires_at = params.get("expires_at");
      const errorCode = params.get("error_code");

      if (expires_at && new Date(expires_at) < new Date()) {
        toast.success("Token expirado! Tente realizar o login novamente.");
        return;
      } else if (errorCode === "otp_expired") {
        toast.error(
          "Código de verificação expirado. Por favor, solicite um novo."
        );
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      } else if (
        access_token &&
        refresh_token &&
        type === "signup" &&
        expires_at
      ) {
        const session = await confirmSignInAndSetSession(
          access_token,
          refresh_token
        );

        if (!session) {
          router.push("/login?error=invalid_token");
          return;
        }

        updateAuthState(session);
        toast.success("Login feito com sucesso!");
        redirectToRoleDashboard();
      }
    };

    confirmSignIn();
  }, [searchParams, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    setLoading(true);
    try {
      const response = await signInWithPassword(data);
      console.log(response)

      if (response.error === true && response.confirmation === true) {
        toast.error("Confirme seu email para continuar.");
        router.push("/confirmation");
      } else if (response.confirmation === false && response.error === true)
        throw new Error();
      else if (response.error === false && response.data) {
        updateAuthState(response.data?.session);
        toast.success("Login feito com sucesso!");
        redirectToRoleDashboard();
      }
    } catch {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={cn("flex flex-col gap-6")}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="font-semibold">
                      Senha
                    </Label>
                    <Link
                      href="/reset-password"
                      className="ml-auto text-sm hover:underline hover:underline-offset-4 text-muted-foreground"
                    >
                      A senha não funciona?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold"
                >
                  {loading ? "Carregando..." : "Entrar"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <Link
                  href="/confirmation"
                  className="hover:underline hover:underline-offset-4 text-muted-foreground"
                >
                  Primeiro acesso?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
