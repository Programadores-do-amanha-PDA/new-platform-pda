"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@/components/ui/shadcn-io/avatar-group";

import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import { REGEX_FOR_EMAIL_VALIDATION } from "@/utils/regex/user-regex-validations";

const RenderSquadMembers = ({
  squadMembers,
  classroomUsers,
}: {
  squadMembers: string[];
  classroomUsers: Partial<AuthUserWithProfile>[];
}) => {
  const isSquadMembersJustEmails = squadMembers.every(
    (member) =>
      REGEX_FOR_EMAIL_VALIDATION.test(member) || classroomUsers.some((u) => u?.email === member)
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
    <AvatarGroup variant="motion" className="-space-x-3 h-12">
      {squadMembers.map((memberId) => {
        const member = classroomUsers.find((u) => u.id === memberId);
        return (
          <Avatar key={memberId} className="border-3 border-background size-10">
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
