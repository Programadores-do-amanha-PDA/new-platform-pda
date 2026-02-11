"use client";

import { useParams } from "next/navigation";
import { FolderX } from "lucide-react";

import EmptyState from "@/components/shared/empty-states/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIsZoomSatisfactionTable } from "./zoom-satisfaction-kpis";
import { ProjectsKPIsTable } from "./classroom-projects-kpis";
import { KPIsZoomAttendanceTable } from "./zoom-attendance-kpis/zoom-attendance-table";

export const KPIsTabs = () => {
    const { classroom_id } = useParams<{ classroom_id: string }>();
    if (!classroom_id) {
        return (
            <EmptyState
                action={null}
                title="Nenhuma turma selecionada"
                description="Selecione uma turma para visualizar os dados"
                icon={<FolderX />}
            />
        );
    }

    return (
        <Tabs defaultValue="zoom-attendance" className="w-full h-full overflow-hidden">
            <TabsList className="**:font-semibold *:cursor-pointer *:hover:bg-background/50">
                <TabsTrigger value="zoom-attendance">Presenças</TabsTrigger>
                <TabsTrigger value="zoom-satisfaction">Satisfação</TabsTrigger>
                <TabsTrigger value="classroom-projects">Projetos</TabsTrigger>
            </TabsList>
            <TabsContent value="zoom-attendance" className="w-full h-full overflow-hidden">
                <KPIsZoomAttendanceTable classroomId={classroom_id} />
            </TabsContent>
            <TabsContent value="zoom-satisfaction" className="w-full h-full overflow-hidden">
                <KPIsZoomSatisfactionTable classroomId={classroom_id} />
            </TabsContent>
            <TabsContent value="classroom-projects" className="w-full h-full overflow-hidden">
                <ProjectsKPIsTable classroomId={classroom_id} />
            </TabsContent>
        </Tabs>
    );
};
