"use client";
import { useState, useMemo } from "react";
import { useClassroomStore } from "./stores/classrooms";
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
    <div className="w-full h-max py-4 px-2 flex flex-col gap-6 overflow-hidden">
      <header className="w-full flex items-center justify-between flex-wrap p-2 gap-4">
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

      <ul className="w-full h-full flex flex-wrap items-start gap-4 overflow-y-auto px-2 pb-4">
        {displayedClassrooms.length === 0 && (
          <p className="w-full h-full text-center text-lg font-semibold">
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
