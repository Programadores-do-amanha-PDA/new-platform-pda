"use client";

import { useReducer } from "react";
import { sileo } from "sileo";
import { Upload } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { formatParticipantsData } from "../../utils/format-participant-data";
import FileUploadStage from "./file-upload-stage";
import DataReviewStage from "./data-review-stage";
import { CoodeshAssessment, CoodeshAttemptParticipantData } from "../../types";

interface InsertAttemptsState {
    readonly open: boolean;
    readonly stage: 0 | 1;
    readonly loading: boolean;
    readonly resultsCsv: string | null;
    readonly integrityCsv: string | null;
    readonly actionPlansCsv: string | null;
    readonly participantData: CoodeshAttemptParticipantData[];
}

type InsertAttemptsAction =
    | { type: "OPEN_DIALOG" }
    | { type: "CLOSE_DIALOG" }
    | { type: "SET_RESULTS_CSV"; payload: string | null }
    | { type: "SET_INTEGRITY_CSV"; payload: string | null }
    | { type: "SET_ACTION_PLANS_CSV"; payload: string | null }
    | { type: "ADVANCE_TO_REVIEW"; payload: CoodeshAttemptParticipantData[] }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "BACK_TO_FILE_SELECTION" };

const initialState: InsertAttemptsState = {
    open: false,
    stage: 0,
    loading: false,
    resultsCsv: null,
    integrityCsv: null,
    actionPlansCsv: null,
    participantData: [],
};

function insertAttemptsReducer(state: InsertAttemptsState, action: InsertAttemptsAction): InsertAttemptsState {
    switch (action.type) {
        case "OPEN_DIALOG":
            return { ...state, open: true };
        case "CLOSE_DIALOG":
            return initialState;
        case "SET_RESULTS_CSV":
            return { ...state, resultsCsv: action.payload };
        case "SET_INTEGRITY_CSV":
            return { ...state, integrityCsv: action.payload };
        case "SET_ACTION_PLANS_CSV":
            return { ...state, actionPlansCsv: action.payload };
        case "ADVANCE_TO_REVIEW":
            return { ...state, participantData: action.payload, stage: 1 };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "BACK_TO_FILE_SELECTION":
            return {
                ...state,
                participantData: [],
                resultsCsv: null,
                integrityCsv: null,
                actionPlansCsv: null,
                stage: 0,
            };
        default:
            return state;
    }
}

interface InsertAssessmentAttemptsProps {
    readonly assessment: CoodeshAssessment | undefined;
    readonly updateAssessment: (assessment: CoodeshAssessment, assessmentData: Partial<CoodeshAssessment>) => Promise<boolean>;
}

const InsertAssessmentAttempts = ({ assessment, updateAssessment }: Readonly<InsertAssessmentAttemptsProps>) => {
    const [state, dispatch] = useReducer(insertAttemptsReducer, initialState);
    const { open, stage, loading, resultsCsv, integrityCsv, actionPlansCsv, participantData } = state;

    const handleOpenChange = (isOpen: boolean) => {
        dispatch({ type: isOpen ? "OPEN_DIALOG" : "CLOSE_DIALOG" });
    };

    const handleExtractParticipantData = () => {
        if (!resultsCsv || integrityCsv === null || actionPlansCsv === null) {
            sileo.error({
                title: "Erro ao extrair dados",
                description: "Selecione todos os arquivos necessários.",
                position: "top-right",
            });
            return;
        }

        const formattedParticipantsData = formatParticipantsData(resultsCsv, integrityCsv, actionPlansCsv);
        dispatch({ type: "ADVANCE_TO_REVIEW", payload: formattedParticipantsData });
        sileo.success({
            title: "Extração concluída",
            description: "Os dados dos participantes foram extraídos com sucesso.",
            position: "top-right",
        });
    };

    const handleSubmit = async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            if (!assessment?.id) throw new Error("CoodeshAssessmentPayload ID is missing.");
            if (!participantData) throw new Error("Participant data is missing.");

            const existingParticipants = assessment.participants_data || [];

            const mergedParticipants = participantData.map((newParticipant) => {
                const existingParticipant = existingParticipants.find((existing) => existing.email === newParticipant.email);

                if (existingParticipant) {
                    return {
                        ...existingParticipant,
                        results: [...existingParticipant.results, ...newParticipant.results],
                        integrityEvents: [...existingParticipant.integrityEvents, ...newParticipant.integrityEvents],
                        actionPlans: [...existingParticipant.actionPlans, ...newParticipant.actionPlans],
                    };
                }

                return newParticipant;
            });

            const finalParticipants = [
                ...mergedParticipants,
                ...existingParticipants.filter(
                    (existing) => !participantData.some((newParticipant) => newParticipant.email === existing.email),
                ),
            ];

            await updateAssessment(assessment, { participants_data: finalParticipants });

            sileo.success({
                title: "Dados inseridos com sucesso",
                description: "Os dados dos participantes foram inseridos com sucesso.",
                position: "top-right",
            });

            dispatch({ type: "CLOSE_DIALOG" });
        } catch {
            sileo.error({
                title: "Erro ao inserir dados",
                description: "Ocorreu um erro ao inserir os dados dos participantes. Tente novamente mais tarde!",
                position: "top-right",
            });
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleBackToFileSelection = () => {
        dispatch({ type: "BACK_TO_FILE_SELECTION" });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="size-5" />
                    Carregar arquivos de respostas
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full! max-w-[65vw]! overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Carregar arquivos de respostas</DialogTitle>
                    <DialogDescription>
                        {stage === 0 && (
                            <>
                                Selecione os arquivos CSV para carregar os dados das tentativas
                                <p>
                                    O arquivo de <b>Respostas</b> é obrigatório, ja os arquivos <b>Integridade</b> e{" "}
                                    <b>Plano de ação</b> são opcionais.
                                </p>
                            </>
                        )}
                        {stage === 1 && "Revise os dados dos participantes a serem inseridos"}
                    </DialogDescription>
                </DialogHeader>

                {stage === 0 ? (
                    <FileUploadStage
                        resultsCsv={resultsCsv}
                        integrityCsv={integrityCsv}
                        actionPlansCsv={actionPlansCsv}
                        setResultsCsv={(csv) => dispatch({ type: "SET_RESULTS_CSV", payload: csv })}
                        setIntegrityCsv={(csv) => dispatch({ type: "SET_INTEGRITY_CSV", payload: csv })}
                        setActionPlansCsv={(csv) => dispatch({ type: "SET_ACTION_PLANS_CSV", payload: csv })}
                        onExtractData={handleExtractParticipantData}
                    />
                ) : (
                    <DataReviewStage
                        participantData={participantData}
                        loading={loading}
                        onSubmit={handleSubmit}
                        onBackToFileSelection={handleBackToFileSelection}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default InsertAssessmentAttempts;
