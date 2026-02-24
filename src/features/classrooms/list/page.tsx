"use client";

import { Input } from "@/components/ui/input";
import PermissionGuard from "@/components/shared/permission-guard";

import ClassroomCard from "./components/classroom-card";
import ClassroomFormDialog from "./components/classroom-form-dialog";
import { useClassroomListData } from "./use-classroom-list-data";
import { Suspense } from "react";

const classroomStatusLabels = {
    created: "Criado",
    active: "Em curso",
    finished: "Finalizado",
};

const ClassroomsPage = () => {
    const { searchQuery, setSearchQuery, displayedClassrooms } = useClassroomListData();

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

            <Suspense fallback={<p className="w-full h-full font-semibold text-lg text-center">Carregando turmas...</p>}>
                <ul className="flex flex-wrap items-start gap-4 px-2 pb-4 w-full h-full overflow-y-auto">
                    {displayedClassrooms.map((classroom) => (
                        <ClassroomCard key={classroom.id} classroom={classroom} classroomStatusLabels={classroomStatusLabels} />
                    ))}
                </ul>
            </Suspense>
        </div>
    );
};

export default ClassroomsPage;
