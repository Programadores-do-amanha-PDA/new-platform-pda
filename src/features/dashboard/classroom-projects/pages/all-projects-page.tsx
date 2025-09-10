"use client";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/modules/classrooms/projects";
import { useState } from "react";
import CreateProjectDialog from "../components/create-project-dialog";
import ProjectCard from "../components/project-card";
import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";

const AllProjectsPage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { projects } = useProjectStore();

  const filteredProjects = searchFilter
    ? projects.filter((project) =>
        project.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : projects;

  return (
    <main className="w-full h-max py-4 px-2 flex flex-col gap-6 overflow-hidden">
      <header className="w-full flex items-center justify-between flex-wrap p-2 gap-4">
        <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-xs rounded-md border px-2">
          <Input
            id="search"
            type="text"
            placeholder="Buscando algo?"
            className="border-none! ring-0! shadow-none rounded-none!"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <PermissionGuard permission="classroom_projects.insert">
          <CreateProjectDialog classroom_id={classroom_id} />
        </PermissionGuard>
      </header>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2 pb-4">
        {filteredProjects
          .sort(
            (a, b) =>
              new Date(a.schedule_date?.to ?? 0).getTime() -
              new Date(b.schedule_date?.to ?? 0).getTime()
          )
          .sort((a, b) => Number(a.module) - Number(b.module))
          .map((project, i) => (
            <ProjectCard
              key={`project-${i}`}
              project={project}
              expansive={true}
              classroomId={classroom_id}
            />
          ))}
      </ul>
    </main>
  );
};

export default AllProjectsPage;
