"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Clock, AlertCircleIcon, ArrowLeft } from "lucide-react";

import { useCooldownManager } from "@/hooks/cooldown-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { resendEmailSignupConfirmation } from "../actions";
import { EmailConfirmationFormSchema } from "../types";
import { emailConfirmationSchema } from "../utils";

const SYMBOL_PATH = "/logos/symbol-white-background.png";

export const EmailConfirmationForm = () => {
    const searchParams = useSearchParams();

    const form = useForm<EmailConfirmationFormSchema>({
        resolver: zodResolver(emailConfirmationSchema),
        defaultValues: {
            email: "",
        },
    });

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors },
        setError,
    } = form;

    const currentEmail = watch("email");

    const { cooldown, lastSentEmail, isValueChanged, canResend, startCooldown, formatTime } = useCooldownManager(
        {
            durationInSeconds: 120,
            storageKey: "resend_confirmation_cooldown",
            emailStorageKey: "pending_confirmation_email",
        },
        currentEmail,
    );

    useEffect(() => {
        const getInitialEmail = () => {
            const emailFromUrl = searchParams?.get("email");

            let emailFromHash = "";
            if (typeof window !== "undefined") {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                emailFromHash = params.get("email") || "";

                if (emailFromHash) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }

            const emailFromStorage =
                typeof window !== "undefined" ? localStorage.getItem("pending_confirmation_email") || "" : "";

            const email = emailFromUrl || emailFromHash || emailFromStorage;

            if (email) {
                setValue("email", email);
            }
        };

        getInitialEmail();
    }, []);

    const onSubmit = async (data: EmailConfirmationFormSchema) => {
        try {
            if (!data.email) throw new Error("Email is not provided");
            if (!emailConfirmationSchema.parse(data)) throw new Error("Invalid email format");

            const isSent = await resendEmailSignupConfirmation({ email: data.email });

            if (isSent) {
                startCooldown(data.email);
                toast.success("Email de confirmação enviado com sucesso!");
            } else {
                throw new Error("Não foi possível enviar o email");
            }
        } catch (error) {
            console.error("Erro ao reenviar confirmação:", error);
            const errorMessage = error instanceof Error ? error.message : "Erro ao enviar email. Tente novamente.";

            toast.error(errorMessage);
            setError("root", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
            <div className="w-full flex items-start justify-start">
                <Link
                    href="/sign-in"
                    className="flex gap-2 items-center cursor-pointer text-muted-foreground font-semibold group"
                >
                    <ArrowLeft className="size-5" />
                    <p className="group-hover:underline">Entrar</p>
                </Link>
            </div>
            <div className="flex flex-col gap-6 bg-b">
                <Image width={36} height={36} src={SYMBOL_PATH} alt="PdA" />
                <div className="flex flex-col gap-3">
                    <p className="text-4xl font-bold">Confirmar Email</p>
                    <p className="text-muted-foreground">
                        A verificação de email é importante para garantirmos a segurança em sua conta!
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

                        {isValueChanged && cooldown > 0 && (
                            <Alert variant="default">
                                <AlertDescription className="text-sm">
                                    Você alterou o email. Pode reenviar imediatamente para o novo endereço.
                                </AlertDescription>
                            </Alert>
                        )}

                        {errors.root && (
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>{errors.root.message}</AlertTitle>
                            </Alert>
                        )}

                        <Button type="submit" disabled={isSubmitting || !canResend} className="w-full font-semibold" size="lg">
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

                        {lastSentEmail && cooldown > 0 && !isValueChanged && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Email enviado para <span className="font-medium text-foreground">{lastSentEmail}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Você pode reenviar em {formatTime(cooldown)}
                                </p>
                            </div>
                        )}
                    </form>
                </Form>
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Não recebeu o email?</p>
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
