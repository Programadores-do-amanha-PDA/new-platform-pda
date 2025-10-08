import { ProfileT } from "@/types";
import { ClassroomProjectDeliveryT, ClassroomProjectTypeT } from ".";

export interface DeliveryListItemProps {
  delivery: ClassroomProjectDeliveryT;
  deliveryIndex: number;
  deliveryAuthor?: ProfileT;
  projectType: ClassroomProjectTypeT;
  hasCorrection: boolean;
  isSelected: boolean;
  onSelect: (delivery: ClassroomProjectDeliveryT) => void;
}
