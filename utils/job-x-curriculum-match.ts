import { CurriculumType } from "@/types/curriculum";
import { JobType } from "@/types/jobs";

export const areaMatch = (student: CurriculumType, job: JobType) => {
  return (
    student.interesting_areas?.some((ia) => {
      const areaLower = ia.area.toLowerCase();
      return (
        job.title.toLowerCase().includes(areaLower) ||
        job.description?.toLowerCase().includes(areaLower) ||
        false
      );
    }) ?? false
  );
};

// Languages (3 points)
export const languageMatchPercentage = (
  student: CurriculumType,
  job: JobType
) => {
  const studentLanguages = new Set(
    student.interesting_areas
      ?.flatMap((ia) => ia.technologies)
      .map((lang) => lang.toLowerCase()) || []
  );

  const jobLanguages = new Set(
    job.details?.languages?.map((lang) => lang.toLowerCase()) || []
  );

  const matched = [...studentLanguages].filter((lang) =>
    jobLanguages.has(lang)
  ).length;
  const totalJobLanguages = jobLanguages.size || 1;

  return (matched / totalJobLanguages) * 3;
};

// Studies (1 point)
export const studiesMatch = (student: CurriculumType, job: JobType) => {
  const studyKeywords = new Set(
    student.studies
      ?.flatMap((study) => [
        study.study_field.toLowerCase(),
        study.degree.toLowerCase(),
      ])
      .filter(Boolean) || []
  );

  const jobText = [
    job.title,
    job.description,
    ...(job.details?.workplace_type || []),
  ]
    .join(" ")
    .toLowerCase();

  return Array.from(studyKeywords).some((keyword) => jobText.includes(keyword));
};

// Locale (0.5 points)
export const localeMatch = (student: CurriculumType, job: JobType) => {
  const studentLocation = [
    student.location?.city?.toLowerCase(),
    student.location?.state?.toLowerCase(),
  ].filter(Boolean);

  const jobLocations = job.details?.locale?.map((l) => l.toLowerCase()) || [];

  return studentLocation.some((loc) =>
    jobLocations.some((jobLoc) => jobLoc.includes(loc || ""))
  );
};

export const calculateMatchPercentage = (
  student: CurriculumType,
  job: JobType
): number => {
  const matchPoints = [
    areaMatch(student, job) ? 1 : 0,
    languageMatchPercentage(student, job),
    studiesMatch(student, job) ? 1 : 0,
    localeMatch(student, job) ? 0.5 : 0,
  ].reduce((sum, points) => sum + points, 0);

  const totalPossiblePoints = 5.5;
  const percentage = (matchPoints / totalPossiblePoints) * 100;

  return Math.min(Math.round(percentage * 100) / 100, 100);
};
