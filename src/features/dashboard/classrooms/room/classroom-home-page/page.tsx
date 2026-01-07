"use client";

import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import Link from "next/link";
import ClassroomFormDialog from "../../classrooms-homepage/components/classroom-form-dialog";
import { useClassroomStore } from "../../classrooms-homepage/store";

const ClassroomHomePage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { classrooms } = useClassroomStore();

  if (!classroom_id) return null;

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroom_id
  );

  return (
    <div className="flex flex-col gap-8 p-4 w-full h-full overflow-y-auto">
      <PermissionGuard permission="classrooms.update_all">
        <header className="flex flex-row flex-nowrap justify-end items-center gap-4 w-full">
          <ButtonGroup>
            <ClassroomFormDialog currentClassroom={currentClassroom} />
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/classrooms/${classroom_id}/configs`}>
                <Cog />
              </Link>
            </Button>
          </ButtonGroup>
        </header>
      </PermissionGuard>

      <div className="flex justify-center items-center bg-primary/30 rounded-md w-full h-full overflow-hidden font-semibold text-2xl animate-pulse">
        Mais funcionalidades em breve!
      </div>
    </div>
  );
};

export default ClassroomHomePage;
