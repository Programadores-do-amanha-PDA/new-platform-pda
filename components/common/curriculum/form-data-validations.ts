"use client";
import {
  ResumeInterestingAreasT,
  ResumeLocationT,
  ResumeStudiesT,
} from "@/types/resume";
import { toast } from "sonner";

export const validateLocation = (location: ResumeLocationT): boolean => {
  if (location.state.trim() && !location.city.trim()) {
    toast.error("Se informar o estado, a cidade é obrigatória");
    return false;
  }
  return true;
};

export const validateInterestingAreas = (
  areas: ResumeInterestingAreasT
): boolean => {
  for (let index = 0; index < areas.length; index++) {
    const area = areas[index];
    if (area.area.trim()) {
      if (area.technologies.length === 0) {
        toast.error(
          `Área ${index + 1}: Pelo menos uma tecnologia é obrigatória`
        );
        return false;
      }

      if (area.technologies.some((tech) => !tech.trim())) {
        toast.error(
          `Área ${index + 1}: Todas as tecnologias devem ser preenchidas`
        );
        return false;
      }
    }
  }
  return true;
};

export const validateStudies = (studies: ResumeStudiesT): boolean => {
  for (let index = 0; index < studies.length; index++) {
    const study = studies[index];

    const requiredFields = [
      {
        field: study.institution,
        message: `Estudo ${index + 1}: Instituição obrigatória`,
      },
      {
        field: study.study_field,
        message: `Estudo ${index + 1}: Área de estudo obrigatória`,
      },
      { field: study.degree, message: `Estudo ${index + 1}: Grau obrigatório` },
      {
        field: study.start_date,
        message: `Estudo ${index + 1}: Data de início obrigatória`,
      },
      {
        field: study.end_date,
        message: `Estudo ${index + 1}: Data de conclusão obrigatória`,
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!field?.trim()) {
        toast.error(message);
        return false;
      }
    }

    if (new Date(study.start_date) > new Date(study.end_date)) {
      toast.error(`Estudo ${index + 1}: Data final deve ser após data inicial`);
      return false;
    }
  }
  return true;
};

export const validateCurriculumForm = (
  location: ResumeLocationT,
  interestingAreas: ResumeInterestingAreasT,
  studies: ResumeStudiesT
): boolean => {
  return (
    validateLocation(location) &&
    validateInterestingAreas(interestingAreas) &&
    validateStudies(studies)
  );
};
