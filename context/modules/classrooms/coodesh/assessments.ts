"use client";
import { useState } from "react";
import { toast } from "sonner";

import {
  createCoodeshAssessment,
  getAllCoodeshAssessment,
  updateCoodeshAssessment,
} from "@/app/actions/classrooms/coodesh/assessments";

import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";

const CoodeshAssessmentsStack = () => {
  const [assessments, setAssessments] = useState<ClassroomCoodeshAssessment[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const handleGetAllCoodeshAssessmentByClassroomId = async (
    classroomId: string
  ) => {
    setLoading(true);
    try {
      if (!classroomId) throw new Error("required fields");

      const allAssessments = await getAllCoodeshAssessment(classroomId);

      if (!allAssessments)
        throw new Error("no assessment created successfully");

      setAssessments(allAssessments);
      return true;
    } catch (error) {
      console.log(error);
      toast.error(
        "Erro ao buscar avaliações da sala de aula! Tente novamente mais tarde!"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoodeshAssessment = async (
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => {
    try {
      if (!assessmentData.classroom_id || !assessmentData.assessment_id)
        throw new Error("required fields");

      const assessmentCreated = await createCoodeshAssessment(assessmentData);
      if (!assessmentCreated)
        throw new Error("no assessment created successfully");

      setAssessments((prevAssessments) => [
        ...prevAssessments,
        assessmentCreated,
      ]);
      toast.success("Avaliação anexada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao anexar a avaliação! Tente novamente mais tarde!");
      return false;
    }
  };

  const handleUpdateCoodeshAssessment = async (
    assessment: ClassroomCoodeshAssessment,
    updatedData: Partial<ClassroomCoodeshAssessment>
  ) => {
    console.log("Updating assessment with data:", updatedData);

    try {
      if (!assessment.id || !updatedData) {
        throw new Error("No assessment ID or update data provided");
      }

      const updatedAssessment = await updateCoodeshAssessment(
        assessment.id,
        updatedData
      );

      if (!updatedAssessment) {
        throw new Error(
          "Failed to update assessment: No data returned from the API"
        );
      }

      setAssessments((prevAssessments) =>
        prevAssessments.map((assessment) =>
          assessment.id === updatedAssessment.id
            ? updatedAssessment
            : assessment
        )
      );

      toast.success("Avaliação atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Erro ao atualizar a avaliação! Tente novamente mais tarde.");
      return false;
    }
  };

  return {
    assessments,
    assessmentsLoading: loading,
    handleGetAllCoodeshAssessmentByClassroomId,
    handleCreateCoodeshAssessment,
    handleUpdateCoodeshAssessment,
  };
};

export default CoodeshAssessmentsStack;

export interface CoodeshAssessmentI {
  assessments: ClassroomCoodeshAssessment[];
  assessmentsLoading: boolean;
  handleGetAllCoodeshAssessmentByClassroomId: (
    classroomId: string
  ) => Promise<boolean>;
  handleCreateCoodeshAssessment: (
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
  handleUpdateCoodeshAssessment: (
    assessment: ClassroomCoodeshAssessment,
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
}
