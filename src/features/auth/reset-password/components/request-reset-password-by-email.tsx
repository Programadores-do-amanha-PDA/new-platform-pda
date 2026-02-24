"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ArrowLeft, Mail, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useCooldownManager } from "@/hooks/cooldown-manager";
import { useAuth } from "@/features/auth/shared";

import { RequestResetPasswordByEmailSchema } from "../types";
import { requestResetPasswordByEmailSchema } from "../utils";

import { logger } from "@/lib/logger";

const log = logger.child({ module: "RequestResetPasswordForm" });
const SYMBOL_PATH = "/logos/symbol-white-background.png";

export const RequestResetPasswordByEmail = () => {
    const { handleRequestResetPassword } = useAuth();
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPasswordResetRequested, setIsPasswordResetRequested] = useState(false);

    const form = useForm<RequestResetPasswordByEmailSchema>({
        resolver: zodResolver(requestResetPasswordByEmailSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange",
    });

    const currentEmail = form.watch("email");

    const { cooldown, lastSentEmail, isValueChanged, canResend, startCooldown, formatTime } = useCooldownManager(
        {
            durationInSeconds: 120,
            storageKey: "request_reset_password_cooldown",
            emailStorageKey: "pending_request_reset_email",
        },
        currentEmail,
    );

    const onSubmit = async (formData: RequestResetPasswordByEmailSchema) => {
        try {
            if (isRequesting) return;
            if (!formData.email || !requestResetPasswordByEmailSchema.parse(formData)) {
                throw new Error("Email is required");
            }

            setIsRequesting(true);
            const isRequested = await handleRequestResetPassword({ email: formData.email });

            if (!isRequested) {
                throw new Error("Occurred an error requesting password reset");
            }

            startCooldown(formData.email);
            setIsPasswordResetRequested(true);
            toast.success({
                title: "Solicitação enviada com sucesso!",
                description: `Verifique seu e-mail para ${formData.email}.`,
            });
        } catch (error) {
            log.error({ err: error, operation: "request_reset_password" }, "Error requesting password reset");
            toast.error({
                title: "Erro ao enviar solicitação",
                description: "Tente novamente mais tarde.",
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const handleResend = async () => {
        if (form.getValues().email && canResend) {
            await onSubmit(form.getValues());
        }
    };

    return (
        <div className="flex flex-col gap-8 mx-auto w-full max-w-md bg-white backdrop-blur-sm rounded-lg p-6 [@media(min-width:1100px)]:p-0">
            <div className="flex justify-start items-start w-full">
                <Link
                    href="/sign-in"
                    className="group flex items-center gap-2 font-semibold text-muted-foreground cursor-pointer"
                >
                    <ArrowLeft className="size-5" />
                    <p className="group-hover:underline">Voltar para login</p>
                </Link>
            </div>
            <div className="flex flex-col gap-6">
                <Image width={36} height={36} src={SYMBOL_PATH} alt="PdA" />
                <div className="flex flex-col gap-3">
                    <p className="font-bold text-4xl">Redefinir senha</p>
                    <p className="text-muted-foreground">
                        {isPasswordResetRequested
                            ? "Verifique seu e-mail para redefinir sua senha."
                            : "Digite seu e-mail para receber as instruções de redefinição."}
                    </p>
                </div>
            </div>

            {!isPasswordResetRequested ? (
                <div className="flex flex-col gap-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                                                disabled={isRequesting}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isValueChanged && cooldown > 0 && (
                                <Alert>
                                    <AlertDescription className="text-sm">
                                        Você alterou o e-mail. Pode reenviar imediatamente para o novo endereço.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isRequesting || !canResend}
                                className="mt-2 w-full font-semibold cursor-pointer"
                                size="lg"
                            >
                                {isRequesting ? (
                                    <>
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : !canResend ? (
                                    <>
                                        <Clock className="mr-2 w-4 h-4" />
                                        Aguarde {formatTime(cooldown)}
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 w-4 h-4" />
                                        Enviar solicitação
                                    </>
                                )}
                            </Button>

                            {lastSentEmail && cooldown > 0 && !isValueChanged && (
                                <div className="text-center">
                                    <p className="text-muted-foreground text-sm">
                                        E-mail enviado para <span className="font-medium text-foreground">{lastSentEmail}</span>
                                    </p>
                                    <p className="mt-1 text-muted-foreground text-xs">
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
                            Um e-mail foi enviado para <span className="font-bold">{form.getValues().email}</span> com os passos
                            para redefinir sua senha.
                        </AlertDescription>
                    </Alert>
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => {
                                form.reset();
                                setIsPasswordResetRequested(false);
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
                            className="disabled:opacity-50 hover:outline text-blue-600! cursor-pointer"
                        >
                            {!canResend ? (
                                <>
                                    <Clock className="mr-2 w-4 h-4" />
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
