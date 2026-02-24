import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/lib/toast";
import { getCoodeshAssessmentsByAPI } from "../api/assessments";
import { CoodeshAssessmentPayload } from "../types";
import { logger } from "@/lib/logger";

interface CoodeshAPIAssessmentState {
    apiAssessments: CoodeshAssessmentPayload[];
    loading: boolean;
}

interface CoodeshAPIAssessmentActions {
    setApiAssessments: (assessments: CoodeshAssessmentPayload[]) => void;
    getApiAssessments: () => Promise<boolean>;
    reset: () => void;
}

const initialState: CoodeshAPIAssessmentState = {
    apiAssessments: [],
    loading: false,
};

const log = logger.child({ module: "CoodeshAPIAssessmentStore" });

export const useCoodeshAPIAssessmentStore = create<CoodeshAPIAssessmentState & CoodeshAPIAssessmentActions>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setApiAssessments: (apiAssessments) => set({ apiAssessments }),

            getApiAssessments: async () => {
                try {
                    set({ loading: true });
                    const assessments = await getCoodeshAssessmentsByAPI();

                    if (!assessments) {
                        throw new Error("no assessments fetched successfully");
                    }

                    set({
                        apiAssessments: [...get().apiAssessments, ...assessments],
                        loading: false,
                    });

                    return true;
                } catch (error) {
                    log.error(
                        { err: error, operation: "getCoodeshAssessmentsByAPI" },
                        "Error fetching assessments from Coodesh API",
                    );
                    toast.error({
                        title: "Erro!",
                        description: "Ocorreu um erro ao buscar as avaliações. Tente novamente mais tarde!",
                    });
                    set({ loading: false });
                    return false;
                }
            },

            reset: () => {
                set(initialState);
            },
        }),
        { name: "CoodeshAPIAssessmentStore" },
    ),
);
