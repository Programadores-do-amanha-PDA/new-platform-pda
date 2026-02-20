"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import ProjectCard from "../components/project/project-card";
import ProjectDialog from "../components/project/project-dialog";
import { useClassroomProjectStore } from "../stores";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCurrentModule } from "@/components/shared/date-interval/utils";
import ButtonGroupInput from "@/components/shared/button-group-input";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { getDefaultModules } from "../utils/projects";

const AllProjectsPage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const { settingsByClassroom } = useClassroomSettingStore();
  const { projects } = useClassroomProjectStore();
  const allClassroomProjects = projects
    .filter((project) => project.classroom_id === classroom_id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  const filteredProjects = searchFilter
    ? allClassroomProjects.filter((project) =>
        project.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : allClassroomProjects;

  const DEFAULT_MODULES = getDefaultModules();
  const classroomConfig = settingsByClassroom[classroom_id];
  const classroomConfigModules = classroomConfig?.modules || DEFAULT_MODULES;

  const allProjectsModules = Array.from(
    new Set(allClassroomProjects.map((project) => project.module))
  );

  return (
    <main className="flex flex-col gap-6 px-4 py-6 w-full h-max overflow-y-auto">
      <header className="flex justify-between items-center gap-4 w-full">
        <ButtonGroupInput
          buttonGroupProps={{
            className: "w-full max-w-sm",
            id: "search",
          }}
          inputProps={{
            placeholder: "Buscando algo?",
            value: searchFilter,
            onChange: (e) => setSearchFilter(e.target.value),
          }}
        />
        <PermissionGuard permission="classroom_projects.insert">
          <ProjectDialog classroom_id={classroom_id} />
        </PermissionGuard>
      </header>

      <Accordion
        type="multiple"
        className="space-y-4 w-full"
        defaultValue={[
          classroomConfigModules.length > 0
            ? getCurrentModule(classroomConfigModules)
            : allProjectsModules[allProjectsModules.length - 1],
        ]}
      >
        {allProjectsModules.map((moduleId) => {
          const currentModule =
            classroomConfigModules.find((m) => m.id === moduleId) ||
            DEFAULT_MODULES.find((m) => m.id === moduleId);

          if (!currentModule) return null;
          return (
            <AccordionItem
              value={moduleId}
              key={`module-accordion-item-${moduleId}`}
              className="flex flex-col [&[data-state=open]]:space-y-2 p-0! rounded-lg border!"
            >
              <AccordionTrigger className="px-4 [&[data-state=open]]:border-b rounded-none! font-bold text-base">
                {currentModule.title}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col px-4 text-balance">
                {filteredProjects
                  .filter((project) => project.module === currentModule.id)
                  .sort((a, b) => {
                    const getClosingDateTime = (project: typeof a) => {
                      if (!project.schedule_date?.to) return 0;
                      const date = new Date(project.schedule_date.to);
                      return date.getTime();
                    };

                    return getClosingDateTime(a) - getClosingDateTime(b);
                  })
                  .map((project, i) => (
                    <ProjectCard
                      key={`project-${i}`}
                      project={project}
                      expansive={true}
                      classroomId={classroom_id}
                    />
                  ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </main>
  );
};

export default AllProjectsPage;
