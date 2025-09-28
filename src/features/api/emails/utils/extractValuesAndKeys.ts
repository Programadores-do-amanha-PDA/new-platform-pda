// src/utils/emails/template-utils.ts
import fs from "fs/promises";

export interface TemplateResult {
  text: string | null;
  keys: string[] | null;
}

export const extractValuesAndKeys = async (
  filePath: string
): Promise<TemplateResult> => {
  try {
    const text = await fs.readFile(filePath, "utf-8");
    const keys =
      text.match(/\[\[(.*?)\]\]/g)?.map((key) => key.slice(2, -2)) || [];

    return { text, keys };
  } catch (error) {
    console.error("Erro ao ler template:", error);
    return { text: null, keys: null };
  }
};
