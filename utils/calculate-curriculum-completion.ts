import { CurriculumType } from "@/types/curriculum";

export const calculateCurriculumCompletion = (
  curriculum: CurriculumType
): number => {
  const isLocationValid = (): boolean => {
    return (
      !!curriculum.location &&
      curriculum.location.state?.trim() !== "" &&
      curriculum.location.city?.trim() !== ""
    );
  };

  const areInterestingAreasValid = (): boolean => {
    if (
      !curriculum.interesting_areas ||
      curriculum.interesting_areas.length === 0
    ) {
      return false;
    }
    return curriculum.interesting_areas.some((area) => {
      const isAreaValid = area.area?.trim() !== "";
      const areTechnologiesValid =
        (area.technologies?.length ?? 0) > 0 &&
        area.technologies!.every((tech) => tech?.trim() !== "");
      return isAreaValid && areTechnologiesValid;
    });
  };

  const areStudiesValid = (): boolean => {
    if (!curriculum.studies || curriculum.studies.length === 0) {
      return false;
    }
    return curriculum.studies.some((study) => {
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
