import { JobT } from "@/features/dashboard/jobs/types";
import { ResumeT } from "@/types/resume";

export const areaMatch = (student: ResumeT, job: JobT) => {
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
  student: ResumeT,
  job: JobT
) => {
  const studentLanguages = new Set(
    student.interesting_areas
      ?.flatMap((ia) => ia.technologies)
      .map((lang) => lang.toLowerCase()) || []
  );

  const jobLanguages = new Set(
    job.details?.languages?.map((lang) => lang.toLowerCase()) || []
  );

  const matched = Array.from(studentLanguages).filter((lang) =>
    jobLanguages.has(lang)
  ).length;
  const totalJobLanguages = jobLanguages.size || 1;

  return (matched / totalJobLanguages) * 3;
};

// Studies (1 point)
export const studiesMatch = (student: ResumeT, job: JobT) => {
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
export const localeMatch = (student: ResumeT, job: JobT) => {
  const isRemote = job.details?.workplace_type?.some(
    (wt) => typeof wt === "string" && wt.toLowerCase() === "remote"
  );

  if (isRemote) {
    return true;
  }

  const studentLocation = [
    student.location?.city?.toLowerCase(),
    student.location?.state?.toLowerCase(),
  ].filter(Boolean);

  const jobLocations =
    job.details?.locale?.map((l) =>
      typeof l === "string" ? l.toLowerCase() : ""
    ) || [];

  return studentLocation.some((loc) =>
    jobLocations.some(
      (jobLoc) => typeof jobLoc === "string" && jobLoc.includes(loc as string)
    )
  );
};

export const calculateMatchPercentage = (
  student: ResumeT,
  job: JobT
) => {
  const area = areaMatch(student, job);
  const language = languageMatchPercentage(student, job);
  const studies = studiesMatch(student, job);
  const local = localeMatch(student, job);

  const matchPoints = [
    area ? 1 : 0,
    language,
    studies ? 1 : 0,
    local ? 0.5 : 0,
  ].reduce((sum, points) => sum + points, 0);

  const totalPossiblePoints = 5.5;
  const percentage = (matchPoints / totalPossiblePoints) * 100;

  return {
    area: area ? 1 : 0,
    language,
    studies: studies ? 1 : 0,
    local: local ? 0.5 : 0,
    total: Math.min(Math.round(percentage * 100) / 100, 100),
  };
};
