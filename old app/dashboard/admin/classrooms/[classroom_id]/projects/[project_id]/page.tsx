"use client";
import ProjectPageM from "@/modules/projects/project-page-module";
import { useParams } from "next/navigation";

const ProjectPage = () => {
  const { project_id } = useParams<{ project_id: string }>();

  return <ProjectPageM project_id={project_id} />;
};

export default ProjectPage;
