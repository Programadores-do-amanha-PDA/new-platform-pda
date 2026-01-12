"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, AlertCircleIcon, Lock } from "lucide-react";

import { logger } from "@/lib/logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useAuth, getAuthErrorMessage } from "@/features/shared/auth";
import { SetNewPasswordSchema } from "../types";
import { setNewPasswordSchema } from "../utils";

const SYMBOL_PATH = "/assets/logos/symbol-white-background.png";

const log = logger.child({ module: "SetNewPassword" });

export const SetNewPassword = () => {
    const router = useRouter();
    const { updateUser, user } = useAuth();

    const form = useForm<SetNewPasswordSchema>({
        resolver: zodResolver(setNewPasswordSchema),
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

    const onSubmit = async (formData: SetNewPasswordSchema) => {
        try {
            if (isSubmitting) return;
            if (!user) throw new Error("user is null");
            if (!formData.password || !setNewPasswordSchema.parse(formData)) {
                throw new Error("Password is required");
            }

            log.info({ user, formData, operation: "set_new_password" }, "Setting new password for user");

            const userUpdated = await updateUser({
                password: formData.password,
            });

            if (userUpdated && userUpdated.error && userUpdated.isAuthError) {
                const errorMessage = getAuthErrorMessage({ errorCode: userUpdated.error }).error;
                setError("root", {
                    type: "manual",
                    message: errorMessage,
                });
                toast.error(errorMessage);
                return;
            }

            if (!userUpdated || userUpdated.user === null || userUpdated.error) {
                throw new Error("Failed to update user password");
            }

            toast.success("Senha redefinida com sucesso!");
            router.push("/sign-in");
        } catch (error) {
            log.error({ err: error, operation: "set_new_password" }, "Error setting new password");
            setError("root", {
                type: "manual",
                message: "Erro ao redefinir a senha. Tente novamente.",
            });
            toast.error("Erro ao redefinir a senha. Tente novamente.");
        }
    };

    return (
        <div className="flex flex-col gap-8 mx-auto w-full max-w-sm">
            <div className="flex flex-col gap-6">
                <Image width={36} height={36} src={SYMBOL_PATH} alt="PdA" />
                <div className="flex flex-col gap-3">
                    <p className="font-bold text-4xl">Redefinir senha</p>
                    <p className="text-muted-foreground">
                        Digite sua nova senha. Garanta que ela é segura e diferente de senhas anteriores.
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {user?.email && (
                            <Alert className="bg-blue-50">
                                <AlertDescription className="text-blue-700">
                                    Alterando senha para <span className="font-semibold">{user?.email}</span>
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
                                    <FormLabel className="font-semibold">Confirmar nova senha</FormLabel>
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

                        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full font-semibold" size="lg">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    Redefinindo...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 w-4 h-4" />
                                    Redefinir senha
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
                <Separator />
                <div className="text-muted-foreground text-sm">
                    <p className="mb-2 font-medium text-foreground">Dicas de segurança:</p>
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
