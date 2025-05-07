import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { AssessmentPayloadType } from "@/types/coodesh/assessments";

const CoodeshAPIAssessmentsStack = () => {
  const [coodeshAPIAssessments, setCoodeshAPIAssessments] =
    useState<AssessmentPayloadType[]>([]);

  const handleGetCoodeshAPIAssessments = async () => {
    try {
      const assessments = await axios.get("/api/coodesh/assessments");
      console.log(assessments.data.assessments);
      if (!assessments) throw "no assessments fetched successfully";
      setCoodeshAPIAssessments((prevAssessments) => [
        ...prevAssessments,
        assessments.data.assessments.payload,
      ]);
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao buscar avaliações! Tente novamente mais tarde!");
      return false;
    }
  };

  return {
    coodeshAPIAssessments,
    setCoodeshAPIAssessments,
    handleGetCoodeshAPIAssessments,
  };
};

export default CoodeshAPIAssessmentsStack;

export interface CoodeshAPIAssessmentsI {
  coodeshAPIAssessments: AssessmentPayloadType[];
  handleGetCoodeshAPIAssessments: () => Promise<boolean>;
}
