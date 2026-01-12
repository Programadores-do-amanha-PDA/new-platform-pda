import { Profile } from "@/features/dashboard/profile";
import {
  ClassroomProjectCorrection,
  ClassroomProjectDelivery,
  ClassroomProjectTypeT,
} from "..";

export interface DeliveryListItemProps {
  delivery: ClassroomProjectDelivery;
  deliveryIndex: number;
  correction: ClassroomProjectCorrection | undefined;
  isSelected: boolean;
  onSelect: (delivery: ClassroomProjectDelivery) => void;
}

import { AuthUserWithProfile } from "@/features/dashboard/profile";

export interface AuthorListItemProps {
  authorId: string;
  authorProfile?: Profile;
  projectType: ClassroomProjectTypeT;
  deliveryCount: number;
  correctionCount: number;
  isSelected: boolean;
  onSelect: (authorId: string) => void;
  classroomUsers?: Partial<AuthUserWithProfile>[];
  memberIds?: string[]; // For group projects
}
