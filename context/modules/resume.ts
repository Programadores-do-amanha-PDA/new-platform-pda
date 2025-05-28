import { useState } from "react";
import { toast } from "sonner";
import { ResumeT } from "@/types/resume";
import {
  createUserResume,
  getAllUserResume,
  getUserResumeByUserId,
  updateUserResumeById,
  deleteUserResumeById,
} from "@/app/actions/resume";
import { AuthUserWithProfileType } from "@/types/auth-types";

const useResumesStack = () => {
  const [resumes, setResumes] = useState<ResumeT[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllResumes = async () => {
    setLoading(true);
    try {
      const response = await getAllUserResume();
      if (!response) throw "Failed to fetch resumes";
      setResumes(response);
      return true;
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast.error("Failed to load resumes. Please try again later.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetResumeByUserId = async (user: AuthUserWithProfileType) => {
    setLoading(true);
    try {
      if (!user.id) throw "User ID is required";
      const response = await getUserResumeByUserId(user.id);
      if (!response) throw "Resume not found";
      setResumes([response]);
      return true;
    } catch (error) {
      console.error("Error fetching user resume:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (
    resumeData: ResumeT,
    user: AuthUserWithProfileType
  ) => {
    try {
      if (!user.id) throw "User ID is required";
      const response = await createUserResume({
        ...resumeData,
        user_id: user.id,
      });
      if (!response) throw "Failed to create resume";
      setResumes([...resumes, response]);
      toast.success("Resume created successfully");
      return true;
    } catch (error) {
      console.error("Error creating resume:", error);
      toast.error("Failed to create resume. Please try again.");
      return false;
    }
  };

  const handleUpdateResume = async (
    id: string,
    resumeData: Partial<ResumeT>
  ) => {
    try {
      const response = await updateUserResumeById(id, {
        ...resumeData,
        updated_at: new Date(),
      });
      if (!response) throw "Failed to update resume";
      setResumes(
        resumes.map((resume) =>
          resume.id === id ? { ...resume, ...response } : resume
        )
      );
      toast.success("Resume updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error("Failed to update resume. Please try again.");
      return false;
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      const success = await deleteUserResumeById(id);
      if (!success) throw "Failed to delete resume";
      setResumes(resumes.filter((resume) => resume.id !== id));
      toast.success("Resume deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume. Please try again.");
      return false;
    }
  };

  return {
    resumes,
    resumesLoading: loading,
    handleGetAllResumes,
    handleGetResumeByUserId,
    handleCreateResume,
    handleUpdateResume,
    handleDeleteResume,
  };
};

export default useResumesStack;

export interface useResumesStackI {
  resumes: ResumeT[];
  resumesLoading: boolean;
  handleGetAllResumes: () => Promise<boolean>;
  handleGetResumeByUserId: (user: AuthUserWithProfileType) => Promise<boolean>;
  handleCreateResume: (
    resumeData: ResumeT,
    user: AuthUserWithProfileType
  ) => Promise<boolean>;
  handleUpdateResume: (
    id: number,
    resumeData: Partial<ResumeT>
  ) => Promise<boolean>;
  handleDeleteResume: (id: number) => Promise<boolean>;
}

export interface useResumesStackAlumniI {
  resumes: ResumeT[];
  resumesLoading: boolean;
  handleGetResumeByUserId: (user: AuthUserWithProfileType) => Promise<boolean>;
  handleCreateResume: (
    resumeData: ResumeT,
    user: AuthUserWithProfileType
  ) => Promise<boolean>;
  handleUpdateResume: (
    id: string,
    resumeData: Partial<ResumeT>
  ) => Promise<boolean>;
  handleDeleteResume: (id: string) => Promise<boolean>;
}
