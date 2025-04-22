"use client";
import { useAdminStackContext } from "@/context/admin/stack-context";

const projectTypesLabels = {
  mini_project: "Mini projeto",
  end_module_project: "Projeto final",
  end_module_english_project: "English final project",
};

const ProjectPageM = ({ project_id }: { project_id: string }) => {
  const {
    classroomsStack: {
      projects: { projects },
    },
  } = useAdminStackContext();
  const currentProject = projects.find((project) => project.id === project_id);

  if (!currentProject) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 py-6 overflow-hidden">
        <h2 className="font-bold text-2xl text-foreground">
          Projeto não encontrado.
        </h2>
        <p className="text-muted-foreground">
          Verifique se o ID do projeto está correto ou se o projeto existe no
          sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 py-6 overflow-hidden">
      <header className="w-full flex flex-col gap-2">
        <div>
          <p className="text-muted-foreground font-semibold">
            {projectTypesLabels[currentProject?.project_type]}
          </p>
        </div>
        {/* <div className="flex gap-2">
          <p className="text-muted-foreground font-semibold">Testes:</p>
          <div className="flex gap-1" title="Duração do teste">
            <Timer className="size-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {?.duration}{" "}
              {assessment?.duration_unit === "hour" ? "horas" : "minutos"}
            </span>
          </div>
          {assessment?.default_locale && (
            <div className="flex gap-1" title="Idioma">
              <Languages className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {
                  defaultLocations[
                    assessment.default_locale as keyof DefaultLocations
                  ]
                }
              </span>
            </div>
          )}
          {
            <div className="flex gap-1" title="Questões">
              <FileSearch className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {assessment?.questions.length}
              </span>
            </div>
          }
        </div> */}
      </header>
    </div>
  );
};
export default ProjectPageM;
