"use client";
import CreateProjectDialog from "@/components/common/classrooms/projects/create-project-dialog";
import ProjectCard from "@/components/common/classrooms/projects/project-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStackContext } from "@/context/admin/stack-context";
import { Search } from "lucide-react";
import { useState } from "react";

const AllProjectsPage = ({ classroom_id }: { classroom_id: string }) => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const {
    classroomsStack: {
      projects: { projects },
    },
  } = useAdminStackContext();

  const filteredProjects = searchFilter
    ? projects.filter((project) =>
        project.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : projects;

  return (
    <main className="relative w-full h-max p-4 flex flex-col gap-6 overflow-hidden">
      <header className="w-full flex items-center justify-between flex-wrap p-2 gap-4">
        <div className="w-full max-w-xs min-w-72 flex gap-2 items-center shadow-sm rounded-md border px-2">
          <Input
            id="search"
            type="text"
            placeholder="Buscando algo?"
            className="max-w-xs !border-none !ring-0 shadow-none !rounded-none"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <Label htmlFor="search">
            <Search className="size-5 text-primary-foreground" />
          </Label>
        </div>
        <CreateProjectDialog classroom_id={classroom_id} />
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
            />
          ))}
      </ul>
    </main>
  );
};
export default AllProjectsPage;
