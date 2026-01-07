"use client";
import { useState, useMemo } from "react";
import { useClassroomStore } from "./store";
import { Input } from "@/components/ui/input";
import ClassroomFormDialog from "./components/classroom-form-dialog";
import ClassroomCard from "./components/classroom-card";
import PermissionGuard from "@/components/shared/permission-guard";

const classroomStatusLabels = {
  created: "Criado",
  active: "Em curso",
  finished: "Finalizado",
};

const TeamPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { classrooms } = useClassroomStore();

  const displayedClassrooms = useMemo(() => {
    let filtered = classrooms;

    // Filtro por busca no título
    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [classrooms, searchQuery]);

  return (
    <div className="flex flex-col gap-6 px-2 py-4 w-full h-max overflow-hidden">
      <header className="flex flex-wrap justify-between items-center gap-4 p-2 w-full">
        <Input
          placeholder="Procurando por algo?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <PermissionGuard permission="classrooms.insert">
          <ClassroomFormDialog />
        </PermissionGuard>
      </header>

      <ul className="flex flex-wrap items-start gap-4 px-2 pb-4 w-full h-full overflow-y-auto">
        {displayedClassrooms.length === 0 && (
          <p className="w-full h-full font-semibold text-lg text-center">
            Nenhuma turma encontrada
          </p>
        )}

        {displayedClassrooms.map((classroom, i) => (
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
