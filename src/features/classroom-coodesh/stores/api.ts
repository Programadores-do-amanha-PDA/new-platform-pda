import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { getCoodeshAssessmentsByAPI } from "../api/assessments";
import { CoodeshAssessmentPayload } from "../types";

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
                    console.error(error);
                    toast.error("Erro ao buscar avaliações! Tente novamente mais tarde!");
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
