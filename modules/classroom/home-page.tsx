"use client";
import ClassroomGeneralViewDataTable from "@/components/common/classrooms/classroom-general-view-data-table";
import CreateOrEditClassroomDialog from "@/components/common/classrooms/create-classroom-dialog";
import { useAdminStackContext } from "@/context/admin/stack-context";

const ClassroomHomePage = ({ classroom_id }: { classroom_id: string }) => {
  const {
    classroomsStack: { classrooms },
  } = useAdminStackContext();

  const currentClassroom = classrooms.find(
    (classroom) => classroom.id === classroom_id
  );

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 pb-0 overflow-hidden">
      <header className="w-full flex flex-row flex-nowrap items-center justify-between gap-4">
        <p className="w-full h-full flex items-center justify-start font-bold text-2xl">
          Visão geral
        </p>
        <CreateOrEditClassroomDialog currentClassroom={currentClassroom} />
      </header>

      <div className="w-full h-full overflow-hidden flex relative">
        <ClassroomGeneralViewDataTable classroom_id={classroom_id} />
      </div>
    </div>
  );
};

export default ClassroomHomePage;
