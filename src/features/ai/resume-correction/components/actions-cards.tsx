"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, FileUp, Send } from "lucide-react";

export function ActionCards() {
    const [message, setMessage] = useState("Summarize the latest");

    return (
        <div className="gap-4">
            <div className="mx-auto w-full max-w-2xl">
                <div className="rounded-2xl border border-border bg-background shadow-lg">
                    <div className="flex items-center justify-center gap-3 p-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <FileUp className="size-4" />
                            Carregue um currículo para análise
                        </Button>
                    </div>
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                <BookOpen className="size-4" />
                                Browse Prompts
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{message.length} / 3,000</span>
                            <Button size="icon" className="size-8 rounded-lg">
                                <Send className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                    O script pode gerar informações imprecisas, incompletas ou desatualizadas. Sempre revise os resultados.
                </p>
            </div>
        </div>
    );
}
