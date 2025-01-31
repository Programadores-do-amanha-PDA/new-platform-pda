"use client";
import React, { useEffect, useState } from "react";
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
import { getCookie } from "cookies-next";

export const ResendConfirmationForm = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const INITIAL_COOLDOWN = 120;

  useEffect(() => {
    const getEmailFromCookie = async () => {
      const cookieValue = getCookie("user_email");
      setEmail(cookieValue as string | "");
    };
    getEmailFromCookie();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      email: formData.get("email") as string,
    };

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/confirmation", data);

      if (response.status === 200) {
        toast.success("Confirmação de email enviado com sucesso!");
        setCooldown(INITIAL_COOLDOWN);
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
            <CardTitle className="text-xl">
              Reenviar a confirmação de email
            </CardTitle>
            <CardDescription>
              Verifique em seu email se você recebeu a confirmação do email ou
              reenvie a solicitação de confirmação usando seu email.
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
                    defaultValue={email}
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full font-bold"
                >
                  {loading
                    ? "Enviando..."
                    : cooldown > 0
                    ? `Reenvie novamente em ${cooldown}s`
                    : "Reenviar solicitação"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};
