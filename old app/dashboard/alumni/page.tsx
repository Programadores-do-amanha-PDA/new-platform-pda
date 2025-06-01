"use client";

import { useAlumniStack } from "@/context/alumni/stack-context";

import AllAvailableJobsCard from "@/components/common/cards/alumni/all-avaliable-jobs-card";
import AlumniAllJobApplicationTsCard from "@/components/common/cards/alumni/all-job-aplications-card";
import JobsMatchCard from "@/components/common/cards/alumni/jobs-match-card";
import CardCollectPublicFeedback from "@/components/common/cards/card-collect-public-feedback";
import AlumniPercentCompletedResumeCard from "@/components/common/cards/alumni/percent-completed-resume-card";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import LoadingComponent from "@/components/common/loading-component";

export default function HomeAdmin() {
  const { user } = useAuth();
  const {
    jobApplicationStack: {
      jobApplications,
      jobsApplicationLoading,
      handleGetAllJobsApplicationsByUserId,
    },
    jobsStack: { jobs, handleGetAllCuratedJobs, jobsLoading },
    resumeStack: { resumes, resumesLoading, handleGetResumeByUserId },
  } = useAlumniStack();

  useEffect(() => {
    if (user && user.id) {
      if (jobApplications.length === 0) {
        handleGetAllJobsApplicationsByUserId(user);
      }

      if (jobs.length === 0) {
        handleGetAllCuratedJobs();
      }
      if (resumes.length === 0) {
        handleGetResumeByUserId(user);
      }
    }
  }, []);

  if (jobsApplicationLoading || jobsLoading || resumesLoading)
    return <LoadingComponent />;

  return (
    <main className="relative w-full h-full flex flex-col p-4 gap-10 bg-background">
      <AlumniAllJobApplicationTsCard
        jobApplications={jobApplications}
        jobs={jobs}
      />

      <div className="w-full flex flex-wrap justify-center md:justify-between gap-4">
        {resumes.length > 0 && (
          <AlumniPercentCompletedResumeCard resumes={resumes} />
        )}
        <AllAvailableJobsCard jobs={jobs} jobApplications={jobApplications} />
        <JobsMatchCard jobs={jobs} jobApplications={jobApplications} />
        <CardCollectPublicFeedback />
      </div>
    </main>
  );
}
