"use client";
import { useState } from "react";
import { toast } from "sonner";

import {
  createClassroomCoodeshAssessment,
  getAllClassroomCoodeshAssessment,
  updateClassroomCoodeshAssessment,
} from "@/app/actions/classrooms/coodesh";

import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";

const CoodeshAssessmentsStack = () => {
  const [assessments, setAssessments] = useState<ClassroomCoodeshAssessment[]>(
    []
  );

  const handleGetAllCoodeshAssessmentByClassroomId = async (
    classroomId: string
  ) => {
    try {
      if (!classroomId) throw new Error("required fields");

      const allAssessments = await getAllClassroomCoodeshAssessment(
        classroomId
      );

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
    }
  };

  const handleCreateCoodeshAssessment = async (
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => {
    try {
      if (!assessmentData.classroom_id || !assessmentData.assessment_id)
        throw new Error("required fields");

      const assessmentCreated = await createClassroomCoodeshAssessment(
        assessmentData
      );
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
    try {
      if (!assessment.id) throw new Error("no assessment id provided");
      if (!updatedData) throw new Error("no updated data provided");

      const updatedAssessment = await updateClassroomCoodeshAssessment(
        assessment.id,
        updatedData
      );
      if (!updatedAssessment)
        throw new Error("no assessment updated successfully");

      setAssessments((prevAssessments) =>
        prevAssessments.map((assmt) =>
          assmt.id === updatedAssessment.id ? updatedAssessment : assmt
        )
      );
      toast.success("Avaliação atualizada com sucesso!");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar a avaliação! Tente novamente mais tarde!");
      return false;
    }
  };

  return {
    assessments,
    handleGetAllCoodeshAssessmentByClassroomId,
    handleCreateCoodeshAssessment,
    handleUpdateCoodeshAssessment,
  };
};

export default CoodeshAssessmentsStack;

export interface CoodeshAssessmentI {
  assessments: ClassroomCoodeshAssessment[];
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
