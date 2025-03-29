import {
  createClassroomCoodeshAssessment,
  updateClassroomCoodeshAssessment,
} from "@/app/actions/classrooms/coodesh";
import { ClassroomType } from "@/types/classrooms";
import { ClassroomCoodeshAssessment } from "@/types/coodesh/assessments";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

const CoodeshAssessmentsStack = (
  setClassrooms: Dispatch<SetStateAction<ClassroomType[]>>
) => {
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

      setClassrooms((classrooms) =>
        classrooms.map((classroom) =>
          classroom.id === assessmentData.classroom_id
            ? {
                ...classroom,
                classroom_coodesh_assessments:
                  classroom.classroom_coodesh_assessments
                    ? [
                        ...classroom.classroom_coodesh_assessments,
                        assessmentCreated,
                      ]
                    : [assessmentCreated],
              }
            : classroom
        )
      );
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

      setClassrooms((prevTeams) =>
        prevTeams.map((classroom) =>
          classroom.id === assessment.classroom_id
            ? {
                ...classroom,
                classroom_coodesh_assessments:
                  classroom.classroom_coodesh_assessments?.map((assessment) =>
                    assessment.id === assessment.id
                      ? updatedAssessment
                      : assessment
                  ),
              }
            : classroom
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
    handleCreateCoodeshAssessment,
    handleUpdateCoodeshAssessment,
  };
};

export default CoodeshAssessmentsStack;

export interface CoodeshAssessmentI {
  handleCreateCoodeshAssessment: (
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
  handleUpdateCoodeshAssessment: (
    assessment: ClassroomCoodeshAssessment,
    assessmentData: Partial<ClassroomCoodeshAssessment>
  ) => Promise<boolean>;
}
