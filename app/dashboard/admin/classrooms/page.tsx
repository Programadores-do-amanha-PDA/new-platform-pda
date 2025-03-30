"use client";
import { useState } from "react";

import { useAdminStackContext } from "@/context/admin/stack-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CreateClassroomDialog } from "@/components/classrooms/create-classroom-dialog";
import ClassroomCard from "@/components/classrooms/classroom-card";

import { ClassroomTypeStatus } from "@/types/classrooms";

const classroomStatusLabels = {
  created: "Criado",
  active: "Em curso",
  finished: "Finalizado",
};

const TeamPage = () => {
  const [statusFilter, setStatusFilter] = useState<ClassroomTypeStatus | "all">(
    "all"
  );
  const {
    classroomsStack: { classrooms },
  } = useAdminStackContext();

  const filteredClassrooms =
    statusFilter === "all"
      ? classrooms
      : classrooms.filter((c) => c.status === statusFilter);

  return (
    <div className="relative w-full h-max flex flex-col gap-10 px-4">
      <header className="w-full flex justify-between gap-4">
        <div className="w-full h-9 flex gap-4 border-b border-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            <p
              className={`text-sm font-semibold ${
                statusFilter === "all" && "text-primary"
              }`}
            >
              Todas
            </p>
            <Badge variant={statusFilter === "all" ? "default" : "outline"}>
              {classrooms.length}
            </Badge>
          </Button>
          <div className="h-full w-px border-l border-sidebar-accent" />

          {classrooms.length > 0 &&
            classrooms
              .map((c) => c.status)
              .map((classroomStatus, i) => (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter(classroomStatus)}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        statusFilter === classroomStatus && "text-primary"
                      }`}
                    >
                      {classroomStatusLabels[classroomStatus]}
                    </p>
                    <Badge
                      variant={
                        statusFilter === classroomStatus ? "default" : "outline"
                      }
                    >
                      {
                        classrooms.filter((t) => t.status === classroomStatus)
                          .length
                      }
                    </Badge>
                  </Button>
                  {i < classrooms.length - 1 && (
                    <div className="h-full w-px border-l border-sidebar-accent" />
                  )}
                </>
              ))}
        </div>
          <CreateClassroomDialog />
      </header>

      <ul className="w-full h-full flex flex-row flex-wrap justify-start gap-4 py-4">
        {filteredClassrooms.length === 0 && (
          <p className="text-center text-lg font-semibold">
            Nenhuma turma encontrada
          </p>
        )}

        {filteredClassrooms.map((classroom, i) => (
          <ClassroomCard
            key={i}
            classroom={classroom}
            classroomStatusLabels={classroomStatusLabels}
          />
        ))}
      </ul>
    </div>
  );
};

export default TeamPage;
