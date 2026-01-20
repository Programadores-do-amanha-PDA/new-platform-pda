"use client";

import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, FileUp, Minus, Send } from "lucide-react";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { generateResumeCorrectionAsync } from "../agent";
import { useState } from "react";
import { RESUME_CORRECTION_OUTPUT_SCHEMA, ResumeCorrectionOutput } from "../utils";

const resumeCorrectionFormSchema = z.object({
    resumeFile: z
        .instanceof(File)
        .refine((file) => file.type === "application/pdf", {
            message: "Por favor, envie um arquivo PDF válido.",
        })
        .optional(),
    resumeText: z.string().min(1, "Por favor, envie um currículo em formato PDF."),
    fileName: z.string().optional(),
});

type ResumeCorrectionFormData = z.infer<typeof resumeCorrectionFormSchema>;

// Configure PDF.js worker for browser environment
if (typeof window !== "undefined" && "Worker" in window) {
    GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
}

/**
 * Extracts text content from a PDF file.
 *
 * @async
 * @param params Parameters containing the PDF buffer.
 * @returns Extracted text from all pages separated by newlines.
 */
async function extractTextFromPdfAsync({ buffer }: { buffer: ArrayBuffer }): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { items } = await page.getTextContent();
        const textItems = items.filter((item): item is TextItem => "str" in item);
        fullText += textItems.map((it) => it.str).join(" ") + "\n";
    }
    return fullText;
}

/**
 * Reads a file and extracts text from a PDF.
 *
 * @param file The file to read.
 * @returns Extracted text or null if extraction fails.
 */
async function readerFileAsArrayBufferAsync(file: File): Promise<string | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const buffer = reader.result as ArrayBuffer;
                const textExtractedByUploadedResume = await extractTextFromPdfAsync({ buffer });
                if (!textExtractedByUploadedResume) {
                    toast.error("Não foi possível extrair o texto do currículo. Por favor, tente outro arquivo.");
                    resolve(null);
                    return;
                }
                resolve(textExtractedByUploadedResume);
            } catch {
                toast.error("Erro ao processar o arquivo. Por favor, tente novamente.");
                resolve(null);
            }
        };

        reader.onerror = () => {
            toast.error("Erro ao ler o arquivo. Por favor, tente novamente.");
            resolve(null);
        };

        reader.readAsArrayBuffer(file);
    });
}

export function ChatInput() {
    const [result, setResult] = useState<ResumeCorrectionOutput | null>(null);
    const form = useForm<ResumeCorrectionFormData>({
        resolver: zodResolver(resumeCorrectionFormSchema),
        defaultValues: {
            resumeFile: undefined,
            resumeText: "",
            fileName: "",
        },
    });

    const resumeText = useWatch({ control: form.control, name: "resumeText" });
    const fileName = useWatch({ control: form.control, name: "fileName" });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedResume = e.target.files?.[0];
        if (!uploadedResume) return;

        form.setValue("fileName", uploadedResume.name);
        form.setValue("resumeFile", uploadedResume);

        const textExtractedByUploadedResume = await readerFileAsArrayBufferAsync(uploadedResume);
        if (!textExtractedByUploadedResume) return;

        form.setValue("resumeText", textExtractedByUploadedResume);
    };

    const handleReset = () => {
        form.reset();
    };

    const onSubmit = async (data: ResumeCorrectionFormData) => {
        console.log("Submitted resume text:", data.resumeText);

        const resumeReview = await generateResumeCorrectionAsync({ resume: data.resumeText!, prompt: "" });
        setResult(resumeReview);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 overflow-y bg-red-50">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-lg p-6 space-y-4 border rounded-lg">
                    <section className="space-y-4 ">
                        <p className="text-lg font-medium flex gap-2 items-center">
                            <FileText className="size-6 text-primary" />
                            Currículo (pdf)
                        </p>
                        <main className="flex items-center justify-start gap-3">
                            <FormField
                                control={form.control}
                                name="resumeFile"
                                render={() => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                onChange={handleUpload}
                                                accept="application/pdf"
                                                className="hidden"
                                                id="file-upload"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!resumeText ? (
                                <Label
                                    htmlFor="file-upload"
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors border hover:bg-accent"
                                >
                                    <FileUp className="size-4" />
                                    Carregue um currículo para análise
                                </Label>
                            ) : (
                                <div className="flex items-center gap-2 flex-col">
                                    <header className="w-full flex gap-2 items-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="cursor-pointer"
                                            size="icon"
                                            onClick={handleReset}
                                        >
                                            <Minus className="size-4" />
                                        </Button>
                                        <span className="text-sm text-muted-foreground">{fileName}</span>
                                    </header>
                                    <div className="border rounded-md bg-muted overflow-hidden">
                                        <header className="w-full flex items-center justify-center p-2 border-b">
                                            <p>Texto extraído do currículo</p>
                                        </header>
                                        <div className="px-4 p-2">
                                            <span className="">{resumeText}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>
                    </section>

                    <Button
                        type="submit"
                        className={cn("w-max rounded-lg cursor-pointer font-semibold", resumeText && "animate-pulse-glow")}
                        disabled={!resumeText}
                        variant="default"
                        size="lg"
                    >
                        Corrigir currículo
                        <Send className="size-4" />
                    </Button>
                </form>
            </Form>
            {result && (
                <div className="w-lg p-6 space-y-4 border rounded-lg">
                    <h2 className="text-2xl font-bold">Resultado da Correção do Currículo</h2>
                    <section>
                        <h3 className="text-xl font-semibold mb-2">Revisão Geral</h3>
                        <p>{result.review}</p>
                    </section>
                    <section>
                        <h3 className="text-xl font-semibold mb-2">Pontos Chave</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {result.keys_points.map((point, index) => (
                                <li key={index}>
                                    <strong>{point.keys_point_title}:</strong> {point.keys_point_description}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            )}
        </div>
    );
}
