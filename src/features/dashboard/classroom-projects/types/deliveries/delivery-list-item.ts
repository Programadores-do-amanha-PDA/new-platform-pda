import { ProfileT } from "@/types";
import {
  ClassroomProjectCorrectionT,
  ClassroomProjectDeliveryT,
  ClassroomProjectTypeT,
} from "..";

export interface DeliveryListItemProps {
  delivery: ClassroomProjectDeliveryT;
  deliveryIndex: number;
  deliveryAuthor?: ProfileT;
  projectType: ClassroomProjectTypeT;
  correction: ClassroomProjectCorrectionT | undefined;
  isSelected: boolean;
  onSelect: (delivery: ClassroomProjectDeliveryT) => void;
}
