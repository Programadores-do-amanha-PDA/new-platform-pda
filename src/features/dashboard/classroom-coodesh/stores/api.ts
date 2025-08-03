import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { AssessmentPayloadT, AssessmentT } from "@/types";
import { getCoodeshAPIAssessments } from "@/app/apis/coodesh/assessments";

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
          const assessments: AssessmentT = await getCoodeshAPIAssessments();
          console.log(assessments);

          if (!assessments) throw "no assessments fetched successfully";

          set({
            apiAssessments: [...get().apiAssessments, ...assessments.payload],
            loading: false,
          });

          return true;
        } catch (error) {
          console.log(error);
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
