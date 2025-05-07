import { useState } from "react";
import { toast } from "sonner";

import {
  JobApplicationStatusT,
  JobApplicationT,
  JobApplicationWithJobT,
} from "@/types/jobs";

import {
  createJobApplication,
  updateJobApplicationById,
  deleteJobApplicationById,
  getAllJobApplicationsByUserId,
  getAllJobApplications,
} from "@/app/actions/job_applications";
import { AuthUserWithProfileType } from "@/types/auth";

const useJobApplicationsStack = () => {
  const [jobApplications, setJobApplications] = useState<
    JobApplicationWithJobT[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllJobsApplications = async () => {
    setLoading(true);

    try {
      const JobApplicationsResponse = await getAllJobApplications();
      if (!JobApplicationsResponse)
        throw "get all job applications response is null";
      setJobApplications(JobApplicationsResponse);

      return true;
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao buscar as candidaturas. Tente novamente mais tarde!"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllJobsApplicationsByUserId = async (
    user: AuthUserWithProfileType
  ) => {
    setLoading(true);

    try {
      if (!user.id) throw "user id is null";

      const JobApplicationsResponse = await getAllJobApplicationsByUserId(
        user.id
      );
      if (!JobApplicationsResponse)
        throw "get all job applications response is null";
      setJobApplications(JobApplicationsResponse);

      return true;
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao buscar as candidaturas. Tente novamente mais tarde!"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobApplication = async (
    applicationData: Partial<JobApplicationT>,
    user: AuthUserWithProfileType
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
      toast.error("Erro ao declarar a candidatura! Tente recarregar a pagina!");
      return false;
    }
  };

  const handleUpdateJobApplicationStatus = async (
    applicationId: number,
    status: JobApplicationStatusT
  ): Promise<boolean> => {
    try {
      if (!applicationId) throw "application id is required";

      const application: JobApplicationT | undefined = jobApplications.find(
        (application) => application.id === applicationId
      );
      if (!application || !status) throw "job application not found";

      const updatedApplication: JobApplicationT | undefined =
        await updateJobApplicationById(applicationId, {
          status,
          updated_at: JSON.stringify(new Date()),
        });
      if (!updatedApplication) throw "update job application response is null";

      setJobApplications([
        ...jobApplications.filter(
          (application) => application.id !== applicationId
        ),
        updatedApplication,
      ]);

      toast.success("Status da candidatura foi atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar o status da candidatura!");
      return false;
    }
  };

  const handleDeleteJobApplication = async (
    applicationId: number
  ): Promise<boolean> => {
    try {
      if (!applicationId) throw "application id is required";

      const application: JobApplicationT | undefined = jobApplications.find(
        (application) => application.id === applicationId
      );
      if (!application) throw "job application not found";

      const deletedApplication = await deleteJobApplicationById(applicationId);
      if (!deletedApplication) throw "delete job application response is null";

      setJobApplications([
        ...jobApplications.filter(
          (application) => application.id !== applicationId
        ),
      ]);

      toast.success("Candidatura deletada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar a candidatura!");
      return false;
    }
  };

  return {
    jobApplications,
    jobsApplicationLoading: loading,
    handleGetAllJobsApplications,
    handleGetAllJobsApplicationsByUserId,
    handleCreateJobApplication,
    handleUpdateJobApplicationStatus,
    handleDeleteJobApplication,
  };
};

export default useJobApplicationsStack;

export interface useJobApplicationsStackI {
  jobApplications: JobApplicationT[];
  jobsApplicationLoading: boolean;
  handleGetAllJobsApplications: () => Promise<boolean>;
  handleGetAllJobsApplicationsByUserId: (
    user: AuthUserWithProfileType
  ) => Promise<boolean>;
  handleCreateJobApplication: (
    applicationData: Partial<JobApplicationT>,
    user: AuthUserWithProfileType
  ) => Promise<boolean>;
  handleUpdateJobApplicationStatus: (
    applicationId: number,
    status: JobApplicationStatusT
  ) => Promise<boolean>;
  handleDeleteJobApplication: (applicationId: number) => Promise<boolean>;
}
