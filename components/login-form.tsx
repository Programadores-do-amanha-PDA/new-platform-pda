"use client";
import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { signInWithPassword } from "@/app/actions/auth";

export const LoginForm = () => {
  const router = useRouter();
  const { redirectToRoleDashboard, updateAuthState } = useAuth();
  const [loading, setLoading] = useState(false);

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
                  <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="password">Senha</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Esqueceu a senha?
                    </a>
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
                  {loading ? "Carregando..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <a href="#" className="underline underline-offset-4">
                  Ainda não tem uma conta?
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
