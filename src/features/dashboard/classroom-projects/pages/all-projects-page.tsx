"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import PermissionGuard from "@/components/shared/permission-guard";
import ProjectCard from "../components/project/project-card";
import ProjectDialog from "../components/project/project-dialog";
import { useProjectStore } from "../stores";
import { useClassroomConfigStore } from "@/stores/modules/classrooms/configs";

const AllProjectsPage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { configsByClassroom } = useClassroomConfigStore();
  const { projects } = useProjectStore();

  const filteredProjects = searchFilter
    ? projects.filter((project) =>
        project.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : projects;

    const classroomConfig = configsByClassroom[classroom_id as string];


  return (
    <main className="w-full h-max py-4 px-2 flex flex-col overflow-hidden">
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
          <ProjectDialog classroom_id={classroom_id} />
        </PermissionGuard>
      </header>

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2 py-6">
        {filteredProjects
          .sort((a, b) => {
            // Criar datas de fechamento
            const getClosingDateTime = (project: typeof a) => {
              if (!project.schedule_date?.to) return 0;
              const date = new Date(project.schedule_date.to);
              return date.getTime();
            };

            return getClosingDateTime(a) - getClosingDateTime(b);
          })
          .sort((a, b) => Number(a.module) - Number(b.module))
          .map((project, i) => (
            <ProjectCard
              key={`project-${i}`}
              project={project}
              expansive={true}
              classroomId={classroom_id}
              classroomConfig={classroomConfig}
            />
          ))}
      </ul>
    </main>
  );
};

export default AllProjectsPage;
