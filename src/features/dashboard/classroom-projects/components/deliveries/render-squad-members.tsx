"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/ui/shadcn-io/avatar-group";

import { AuthUserWithProfileT } from "@/types";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import { emailRegex } from "@/utils/regex/users";

const RenderSquadMembers = ({
  squadMembers,
  classroomUsers,
}: {
  squadMembers: string[];
  classroomUsers: Partial<AuthUserWithProfileT>[];
}) => {
  const isSquadMembersJustEmails = squadMembers.every(
    (member) =>
      emailRegex.test(member) || classroomUsers.some((u) => u?.email === member)
  );

  if (isSquadMembersJustEmails) {
    return (
      <div className="flex flex-wrap gap-1">
        {squadMembers.map((member) => (
          <Badge key={member} variant="outline" className="text-xs">
            {member}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <AvatarGroup variant="motion" className="h-12 -space-x-3">
      {squadMembers.map((memberId) => {
        const member = classroomUsers.find((u) => u.id === memberId);
        return (
          <Avatar key={memberId} className="size-10 border-3 border-background">
            <AvatarImage src={member?.profile?.avatar_url || ""} />
            <AvatarGroupTooltip>
              <p>
                {member?.profile?.full_name ||
                  memberId ||
                  "Participante Desconhecido"}
              </p>
            </AvatarGroupTooltip>
            <AvatarFallback>
              {getFirstLastInitials(member?.profile?.full_name || "") ||
                memberId}
            </AvatarFallback>
          </Avatar>
        );
      })}
    </AvatarGroup>
  );
};

export default RenderSquadMembers;
