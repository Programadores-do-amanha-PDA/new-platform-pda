import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AuthUserWithProfileT } from "@/types";

const MemberListItem = ({
  memberId,
  classroomUsers,
}: {
  memberId: string;
  classroomUsers: Partial<AuthUserWithProfileT>[];
}) => {
  const member = classroomUsers.find((user) => user.id === memberId);
  if (!member) return;
  return (
    <div
      className={cn(
        "w-full h-[57px] truncate flex flex-row gap-2 justify-start items-center px-2 border-b bg-background hover:bg-muted/50"
      )}
    >
      <Avatar>
        <AvatarFallback className="text-sm">
          {member?.profile?.full_name
            .split(" ")
            .slice(0, 2)
            .map((name) => name[0])
            .join("") || "U"}
        </AvatarFallback>
        <AvatarImage src={member?.profile?.avatar_url || ""} />
      </Avatar>
      <div className="w-full flex flex-col justify-center lowercase">
        <p className="text-sm font-bold capitalize">
          {member?.profile?.full_name}
        </p>
        <p>{member?.profile?.email}</p>
      </div>
    </div>
  );
};

export default MemberListItem;
