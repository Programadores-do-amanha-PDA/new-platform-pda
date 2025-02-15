"use client";
import { AppBar } from "@/components/app-bar";

import { useAlumniStack } from "@/context/alumni/stack-context";

import AllAvailableJobsCard from "@/components/cards/alumni/all-avaliable-jobs-card";
import AlumniAllJobApplicationsCard from "@/components/cards/alumni/all-job-aplications-card";
import JobsMatchCard from "@/components/cards/alumni/jobs-match-card";
import AlumniPercentCompletedCurriculumCard from "@/components/cards/alumni/percent-completed-curriculum-card";
import CardCollectPublicFeedback from "@/components/cards/card-collect-public-feedback";

export default function HomeAdmin() {
  const {
    jobApplicationStack: { jobApplications },
    jobsStack: { jobs },
  } = useAlumniStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8 bg-background h-max">
      <AppBar />

      <div className="flex gap-8 flex-wrap h-max">
        <AlumniAllJobApplicationsCard
          jobApplications={jobApplications}
          jobs={jobs}
        />

        <div className="w-full flex flex-wrap justify-center md:justify-between gap-4">
          <AlumniPercentCompletedCurriculumCard />
          <AllAvailableJobsCard jobs={jobs} jobApplications={jobApplications} />
          <JobsMatchCard jobs={jobs} jobApplications={jobApplications} />
          <CardCollectPublicFeedback />
        </div>
      </div>
    </main>
  );
}
