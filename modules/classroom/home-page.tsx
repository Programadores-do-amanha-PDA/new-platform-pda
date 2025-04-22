"use client"
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
    <div className="w-full h-full flex flex-col gap-8 p-6 overflow-hidden">
      <header className="w-full flex flex-row flex-nowrap items-center justify-between p-2 gap-4">
        <div className="w-full h-full flex bg-primary/10 rounded-lg"></div>
        <CreateOrEditClassroomDialog currentClassroom={currentClassroom} />
      </header>
      <div className="w-full h-full rounded-lg bg-primary/10"></div>
    </div>
  );
};

export default ClassroomHomePage;
