import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { AssessmentPayloadT, AssessmentT } from "@/types";
import { getCoodeshAPIAssessments } from "@/features/dashboard/classroom-coodesh/api/assessments";

interface CoodeshAPIAssessmentState {
  apiAssessments: AssessmentPayloadT[];
  loading: boolean;
}

interface CoodeshAPIAssessmentActions {
  setApiAssessments: (assessments: AssessmentPayloadT[]) => void;
  getApiAssessments: () => Promise<boolean>;
  reset: () => void;
}

const initialState: CoodeshAPIAssessmentState = {
  apiAssessments: [],
  loading: false,
};

export const useCoodeshAPIAssessmentStore = create<
  CoodeshAPIAssessmentState & CoodeshAPIAssessmentActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setApiAssessments: (apiAssessments) => set({ apiAssessments }),

      getApiAssessments: async () => {
        try {
          set({ loading: true });
          const assessments: AssessmentT | null =
            await getCoodeshAPIAssessments();

          if (!assessments) {
            throw new Error("no assessments fetched successfully");
          }

          set({
            apiAssessments: [...get().apiAssessments, ...assessments.payload],
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
    { name: "CoodeshAPIAssessmentStore" }
  )
);
