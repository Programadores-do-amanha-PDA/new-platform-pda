import { Profile } from "@/features/users/profile/types/profile";
import { ClassroomProjectType } from "../projects/project";
import { ClassroomProjectDelivery } from "./delivery";
import { ClassroomProjectCorrection } from "../corrections/corrections";


export interface DeliveryListItemProps {
  delivery: ClassroomProjectDelivery;
  deliveryIndex: number;
  correction: ClassroomProjectCorrection | undefined;
  isSelected: boolean;
  onSelect: (delivery: ClassroomProjectDelivery) => void;
}


export interface AuthorListItemProps {
  authorId: string;
  authorProfile?: Profile;
  projectType: ClassroomProjectType;
  deliveryCount: number;
  correctionCount: number;
  isSelected: boolean;
  onSelect: (authorId: string) => void;
  classroomUsers?: Profile[];
  memberIds?: string[]; // For group projects
}
