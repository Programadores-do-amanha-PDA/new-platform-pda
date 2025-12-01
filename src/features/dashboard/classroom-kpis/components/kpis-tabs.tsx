"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIsZoomAttendanceTable } from "./zoom-attendance-table";
import { useParams } from "next/navigation";

export const KPIsTabs = () => {
    const { classroom_id } = useParams<{ classroom_id: string }>();
    if (!classroom_id) {
        return <div>Classroom ID not found</div>;
    }

    return (
        <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="zoom-attendance">Presenças</TabsTrigger>
            </TabsList>
            <TabsContent value="zoom-attendance">
                <KPIsZoomAttendanceTable classroomId={classroom_id} />
            </TabsContent>
        </Tabs>
    );
};
