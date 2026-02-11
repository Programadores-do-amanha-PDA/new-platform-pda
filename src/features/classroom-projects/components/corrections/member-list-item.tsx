import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { Profile } from "@/features/users/profile/types/profile";

const MemberListItem = ({ memberId, classroomUsers }: { memberId: string; classroomUsers: Profile[] }) => {
    const member = classroomUsers.find((user) => user.id === memberId);
    if (!member) return null;
    return (
        <div
            className={cn(
                "flex flex-row justify-start items-center gap-2 bg-background hover:bg-muted/50 px-2 border-b w-full h-[57px] truncate",
            )}
        >
            <Avatar>
                <AvatarFallback className="text-sm">
                    {member?.full_name
                        .split(" ")
                        .slice(0, 2)
                        .map((name) => name[0])
                        .join("") || "U"}
                </AvatarFallback>
                <AvatarImage src={member?.avatar_url || ""} />
            </Avatar>
            <div className="flex flex-col justify-center w-full lowercase">
                <p className="font-bold text-sm capitalize">{member?.full_name}</p>
                <p>{member?.email}</p>
            </div>
        </div>
    );
};

export default MemberListItem;
