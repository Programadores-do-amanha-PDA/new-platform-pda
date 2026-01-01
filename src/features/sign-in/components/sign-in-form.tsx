"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import useAuth from "@/hooks/use-auth";

import { signInWithEmailAndPassword } from "../actions";
import { signInSchema } from "../utils/schema";

interface SignInFormSchema {
    email: string;
    password: string;
}

const SYMBOL_PATH = "/assets/logos/symbol-white-background.png";

export const SignInForm = () => {
    const router = useRouter();
    const { updateAuthState } = useAuth();

    const form = useForm<SignInFormSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
        setError,
    } = form;

    const onSubmit = async (data: SignInFormSchema) => {
        try {
            const response = await signInWithEmailAndPassword(data);

            if (response.error && response.confirmation) {
                toast.error("Confirme seu email para continuar.");
                router.push(`/email-confirmation?email=${encodeURIComponent(data.email)}`);
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
            const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login. Verifique suas credenciais.";

            toast.error(errorMessage);
            setError("root", {
                type: "manual",
                message: errorMessage,
            });
        }
    };

    return (
        <div className="flex flex-col gap-8 mx-auto w-full max-w-sm">
            <div className="flex flex-col gap-6">
                <Image width={36} height={36} src={SYMBOL_PATH} alt="PdA" />
                <div className="flex flex-col gap-3">
                    <p className="font-bold text-4xl">Entrar</p>
                    <p className="text-muted-foreground">Use suas credenciais para acessar sua conta</p>
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

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <FormLabel className="font-semibold">Senha</FormLabel>
                                        <Link
                                            href="/reset-password"
                                            className="text-muted-foreground hover:text-primary text-sm hover:underline underline-offset-4 transition-colors"
                                            tabIndex={-1}
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            autoComplete="current-password"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {errors.root && <div className="font-medium text-destructive text-sm">{errors.root.message}</div>}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 w-full font-semibold cursor-pointer"
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="flex justify-center items-center gap-2 mt-6 text-center">
                    <p className="text-muted-foreground text-sm">Primeiro acesso?</p>
                    <Link
                        href="/email-confirmation"
                        className="font-medium text-primary text-sm hover:underline underline-offset-4 transition-colors"
                    >
                        Confirme seu email
                    </Link>
                </div>
            </div>
        </div>
    );
};
