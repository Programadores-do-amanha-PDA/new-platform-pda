"use client";
import React, { useState } from "react";
import axios from "axios";
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

export const LoginForm = ({
  redirectToRoleDashboard,
}: {
  redirectToRoleDashboard: () => void;
}) => {
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
      const response = await axios.post("/api/auth/singin", data);

      if (response.status === 200) {
        console.log(response.data);
        toast.success(response.data.message);
        redirectToRoleDashboard();
      }
    } catch (error) {
      toast.error("Erro ao fazer o login. Verifique suas credenciais.");
      return error;
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
