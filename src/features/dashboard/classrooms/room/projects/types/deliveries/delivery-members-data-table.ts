export interface DeliveryMemberT {
  email: string;
  name: string;
  avatar_url?: string;
  deliveryId: string;
  status?: "sent" | "pending" | "error" | "sending";
  deliveryData: {
    id: string;
    final_note?: string;
    final_considerations?: string;
    teacher_name: string;
    teacher_email?: string;
    rules_selected: { label: string; text: string }[];
    hits_itens: { emoji: string; text: string }[];
    improvements_itens: { emoji: string; text: string }[];
    next_itens: { emoji: string; text: string }[];
  };
}

export interface DeliveryMembersDataTablePropsT {
  members: DeliveryMemberT[];
  selectedMembers: DeliveryMemberT[];
  onMemberSelect: (member: DeliveryMemberT) => void;
  onSelectAll: () => void;
  emailsSent?: string[];
  showStatus?: boolean;
  disableSelection?: boolean;
}
