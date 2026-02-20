import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex/user-regex-validations";

import { ActivityRow, DialogStage, StudentData } from "./insert-many-activities-dialog.types";

export const getTodayDate = (): string => new Date().toISOString().split("T")[0];

const isValidEmail = (email: string): boolean => {
    return !!email && REGEX_FOR_EMAIL_VALIDATION.test(email.trim());
};

export const getStageDescription = (stage: DialogStage) => {
    if (stage === 0) {
        return (
            <>
                Selecione um arquivo CSV para carregar os emails dos participantes da atividade
                <p>
                    O sistema irá buscar automaticamente por todos os emails válidos em <b>qualquer coluna</b> do arquivo
                </p>
            </>
        );
    }

    if (stage === 1) {
        return "Configure a atividade e revise os participantes";
    }

    return "Resultado da criação da atividade";
};

export const parseStudentsFromRows = (rows: ActivityRow[]): StudentData[] => {
    const uniqueEmails = new Set<string>();

    rows.forEach((row) => {
        Object.values(row).forEach((value) => {
            if (value && typeof value === "string") {
                const trimmedValue = value.trim();
                if (isValidEmail(trimmedValue)) {
                    uniqueEmails.add(trimmedValue);
                }
            }
        });
    });

    return Array.from(uniqueEmails).map((email) => ({ email }));
};
