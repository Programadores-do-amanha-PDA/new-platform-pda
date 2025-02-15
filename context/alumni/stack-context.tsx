"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createUserCurriculum,
  getUserCurriculumByUserId,
  updateUserCurriculumById,
} from "@/app/actions/curriculum";
import { getAllJobs } from "@/app/actions/jobs";
import {
  getAllJobApplicationsByUserId,
  createJobApplication,
} from "@/app/actions/job_applications";

import LoadingComponent from "@/components/loading-component";

import { JobApplication, JobType } from "@/types/jobs";
import { AuthUserWithProfileType } from "@/types/auth";
import { CurriculumType } from "@/types/curriculum";

interface AlumniStackContextProps {
  jobsStack: {
    jobs: JobType[];
  };

  jobApplicationStack: {
    jobApplications: JobApplication[];
    handleCreateJobApplication: (
      applicationData: JobApplication
    ) => Promise<boolean>;
  };

  curriculumStack: {
    curriculum: CurriculumType;
    handleCreateCurriculum: (
      curriculumData: CurriculumType
    ) => Promise<boolean>;
    handleUpdateCurriculum: (
      curriculumData: CurriculumType
    ) => Promise<boolean>;
  };

  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AlumniStackContext = createContext<AlumniStackContextProps>({
  jobsStack: {
    jobs: [],
  },
  jobApplicationStack: {
    jobApplications: [],
    handleCreateJobApplication: () => Promise.resolve(false),
  },
  curriculumStack: {
    curriculum: {},
    handleCreateCurriculum: () => Promise.resolve(false),
    handleUpdateCurriculum: () => Promise.resolve(false),
  },
  loading: true,
  setLoading: () => {},
});

export const AlumniStackProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUserWithProfileType;
}) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [curriculum, setAlumniCurriculum] = useState<CurriculumType>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user.id) throw "user id is null";

        const jobResponse = await getAllJobs();
        if (!jobResponse) throw "get all job response is null";
        setJobs(jobResponse);

        const jobApplicationsResponse = await getAllJobApplicationsByUserId(
          user.id
        );
        if (!jobApplicationsResponse)
          throw "get all job applications response is null";
        setJobApplications(jobApplicationsResponse);

        const curriculumResponse = await getUserCurriculumByUserId(user.id);
        if (!curriculumResponse) throw "get user curriculum response is null";
        setAlumniCurriculum(curriculumResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const handleCreateJobApplication = async (
    applicationData: JobApplication
  ) => {
    try {
      if (!user.id || !applicationData.job_id || !applicationData.status)
        throw "user id and job id is required";

      const application = await createJobApplication({
        ...applicationData,
        user_id: user.id,
      });
      if (!application) throw "create job application response is null";

      setJobApplications([...jobApplications, application]);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao declarar a aplicação! Tente recarregar a pagina!");
      return false;
    }
  };

  const handleCreateCurriculum = async (
    curriculumData: CurriculumType
  ): Promise<boolean> => {
    try {
      if (!user.id) throw "user id is required";
      if (
        !curriculumData.location &&
        !curriculumData.studies &&
        !curriculumData.interesting_areas
      )
        throw "location, studies and interesting areas are required";

      const data: CurriculumType = {
        user_id: user.id,
      };

      if (
        curriculumData.location &&
        curriculumData.location.state &&
        curriculumData.location.city
      ) {
        data.location = { ...curriculumData.location };
      }
      if (curriculumData.studies && curriculumData.studies.length > 0) {
        data.studies = [...curriculumData.studies];
      }
      if (
        curriculumData.interesting_areas &&
        curriculumData.interesting_areas.length > 0
      ) {
        data.interesting_areas = [...curriculumData.interesting_areas];
      }

      const curriculum = await createUserCurriculum(data);
      if (!curriculum) throw "create curriculum response is null";
      setAlumniCurriculum(curriculum);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar o currículo! Tente recarregar a pagina!");
      return false;
    }
  };

  const handleUpdateCurriculum = async (
    curriculumData: CurriculumType
  ): Promise<boolean> => {
    try {
      if (!user.id || !curriculum.id) throw "curriculum id is required";
      const updatedCurriculum = await updateUserCurriculumById(
        curriculum.id,
        curriculumData
      );
      if (!updatedCurriculum) throw "update curriculum response is null";
      setAlumniCurriculum(updatedCurriculum);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar o currículo! Tente recarregar a pagina!");
      return false;
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <AlumniStackContext.Provider
      value={{
        jobsStack: {
          jobs,
        },
        jobApplicationStack: {
          jobApplications,
          handleCreateJobApplication,
        },
        curriculumStack: {
          curriculum,
          handleUpdateCurriculum,
          handleCreateCurriculum,
        },
        setLoading,
        loading,
      }}
    >
      {children}
    </AlumniStackContext.Provider>
  );
};

export const useAlumniStack = () => useContext(AlumniStackContext);
