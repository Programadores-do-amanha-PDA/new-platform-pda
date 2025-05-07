import { ResumeT } from "@/types/resume";

export const calculateResumeCompletion = (
  resume: ResumeT
): number => {
  const isLocationValid = (): boolean => {
    return (
      !!resume.location &&
      resume.location.state?.trim() !== "" &&
      resume.location.city?.trim() !== ""
    );
  };

  const areInterestingAreasValid = (): boolean => {
    if (
      !resume.interesting_areas ||
      resume.interesting_areas.length === 0
    ) {
      return false;
    }
    return resume.interesting_areas.some((area) => {
      const isAreaValid = area.area?.trim() !== "";
      const areTechnologiesValid =
        (area.technologies?.length ?? 0) > 0 &&
        area.technologies!.every((tech) => tech?.trim() !== "");
      return isAreaValid && areTechnologiesValid;
    });
  };

  const areStudiesValid = (): boolean => {
    if (!resume.studies || resume.studies.length === 0) {
      return false;
    }
    return resume.studies.some((study) => {
      return (
        study.institution?.trim() !== "" &&
        study.degree?.trim() !== "" &&
        study.study_field?.trim() !== "" &&
        study.start_date?.trim() !== "" &&
        study.end_date?.trim() !== ""
      );
    });
  };

  const validSections = [
    isLocationValid(),
    areInterestingAreasValid(),
    areStudiesValid(),
  ].filter((valid) => valid).length;

  const totalSections = 3;
  return Math.round((validSections / totalSections) * 100);
};
