"use client";

import { DeliveryMemberT } from "../../types/deliveries/delivery-members-data-table";
import { DeliveryMembersDataTable } from "./delivery-members-data-table";

interface SendDeliveryStepContentProps {
    readonly step: 0 | 1 | 2;
    readonly allMembers: DeliveryMemberT[];
    readonly deliveriesSelected: DeliveryMemberT[];
    readonly deliveryStatuses: Record<string, "pending" | "sending" | "sent" | "error">;
    readonly emailsSent: string[];
    readonly onMemberSelect: (member: DeliveryMemberT) => void;
    readonly onSelectAll: () => void;
}

/**
 * Renders the body content of the feedback email modal.
 * Step 0 shows the full member selection table.
 * Steps 1 and 2 show the read-only send-summary table.
 */
export function SendDeliveryStepContent({
    step,
    allMembers,
    deliveriesSelected,
    deliveryStatuses,
    emailsSent,
    onMemberSelect,
    onSelectAll,
}: Readonly<SendDeliveryStepContentProps>) {
    const withStatuses = (members: DeliveryMemberT[]) =>
        members.map((member) => ({
            ...member,
            status: deliveryStatuses[`${member.deliveryId}-${member.email}`] || "pending",
        }));

    if (step === 0) {
        return (
            <div className="space-y-4">
                <DeliveryMembersDataTable
                    members={withStatuses(allMembers)}
                    selectedMembers={deliveriesSelected}
                    onMemberSelect={onMemberSelect}
                    onSelectAll={onSelectAll}
                    emailsSent={emailsSent}
                    showStatus={false}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-sm">Resumo do Envio</h3>
            <DeliveryMembersDataTable
                members={withStatuses(deliveriesSelected)}
                selectedMembers={deliveriesSelected}
                onMemberSelect={() => {}}
                onSelectAll={() => {}}
                emailsSent={emailsSent}
                showStatus={true}
                disableSelection={true}
            />
        </div>
    );
}
