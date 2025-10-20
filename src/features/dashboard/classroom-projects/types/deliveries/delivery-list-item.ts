import { ProfileT } from "@/types";
import {
  ClassroomProjectCorrectionT,
  ClassroomProjectDeliveryT,
  ClassroomProjectTypeT,
} from "..";

export interface DeliveryListItemProps {
  delivery: ClassroomProjectDeliveryT;
  deliveryIndex: number;
  correction: ClassroomProjectCorrectionT | undefined;
  isSelected: boolean;
  onSelect: (delivery: ClassroomProjectDeliveryT) => void;
}

import { AuthUserWithProfileT } from "@/types/auth";

export interface AuthorListItemProps {
  authorId: string;
  authorProfile?: ProfileT;
  projectType: ClassroomProjectTypeT;
  deliveryCount: number;
  correctionCount: number;
  isSelected: boolean;
  onSelect: (authorId: string) => void;
  classroomUsers?: Partial<AuthUserWithProfileT>[];
  memberIds?: string[]; // For group projects
}
