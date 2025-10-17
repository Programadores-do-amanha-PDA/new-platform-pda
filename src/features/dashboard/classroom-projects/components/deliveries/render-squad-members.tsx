"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { AuthUserWithProfileT } from "@/types";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";

const RenderSquadMembers = ({
  squadMembers,
  classroomUsers,
}: {
  squadMembers: string[];
  classroomUsers: Partial<AuthUserWithProfileT>[];
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      {squadMembers.map((memberId) => {
        const member = classroomUsers.find((u) => u.id === memberId);
        if (!member)
          return (
            <Badge key={memberId} variant="outline" className="text-xs">
              {memberId}
            </Badge>
          );
        return (
          <Badge
            key={memberId}
            variant="outline"
            className="text-xs pl-0.5 rounded-full"
          >
            <Avatar>
              <AvatarImage src={member.profile?.avatar_url || ""} />
              <AvatarFallback>
                {getFirstLastInitials(member.profile?.full_name || "")}
              </AvatarFallback>
            </Avatar>
            {member?.profile?.email ||
              member?.email ||
              "Usuário não encontrado"}
          </Badge>
        );
      })}
    </div>
  );
};

export default RenderSquadMembers;
