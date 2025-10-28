"use client";

import { useParams } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { useClassroomStore } from "../classrooms/stores/classrooms";
import ClassroomFormDialog from "../classrooms/components/classroom-form-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import Link from "next/link";

const ClassroomHomePage = () => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const { classrooms } = useClassroomStore();

  if (!classroom_id) return null;

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroom_id
  );

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 overflow-y-auto">
      <PermissionGuard permission="classrooms.update_all">
        <header className="w-full flex flex-row flex-nowrap items-center justify-end gap-4">
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

      <div className="w-full h-full rounded-md bg-primary/30 overflow-hidden flex items-center justify-center text-2xl font-semibold animate-pulse">
        Mais funcionalidades em breve!
      </div>
    </div>
  );
};

export default ClassroomHomePage;
