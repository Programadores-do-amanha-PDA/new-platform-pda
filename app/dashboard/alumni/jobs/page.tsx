"use client";

import { useAlumniStack } from "@/context/alumni/stack-context";

import AllAvailableJobsCard from "@/components/common/cards/alumni/all-avaliable-jobs-card";
import JobsMatchCard from "@/components/common/cards/alumni/jobs-match-card";
import CardShowNewJobsThisWeek from "@/components/common/cards/alumni/card-new-jobs-this-week";
import CardShowAllNewJobsThisWeek from "@/components/common/cards/alumni/card-show-all-new-jobs-this-week";

export default function HomeAdmin() {
  const {
    jobApplicationStack: { jobApplications },
    jobsStack: { jobs },
  } = useAlumniStack();
  return (
    <main className="relative w-full flex flex-col p-6 gap-10 xl:p-8 bg-background h-max overflow-hidden">
      <div className="flex gap-8 flex-wrap h-max">
        <div className="w-full flex flex-wrap justify-center md:justify-between gap-4">
          <CardShowAllNewJobsThisWeek jobs={jobs} />
          <JobsMatchCard jobs={jobs} jobApplications={jobApplications} />
          <CardShowNewJobsThisWeek jobs={jobs} />
          <AllAvailableJobsCard jobs={jobs} jobApplications={jobApplications} />
        </div>
      </div>
    </main>
  );
}
