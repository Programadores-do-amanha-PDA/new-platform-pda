"use client";

import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Clock, MailCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item";

import { DeliveryListItemProps } from "../../types/deliveries/delivery-list-item";

export function DeliveryListItem({
  delivery,
  deliveryIndex,
  correction,
  isSelected,
  onSelect,
}: DeliveryListItemProps) {
  const cardTitle = `Entrega ${deliveryIndex + 1}`;

  const formattedDate = formatDate(delivery.created_at, "dd/MM/yy", {
    locale: ptBR,
  });

  return (
    <Item
      variant="outline"
      className={cn(
        "min-w-xs max-w-xs cursor-pointer hover:bg-accent/50 transition-colors",
        isSelected && correction?.id
          ? correction.has_feedback_sent
            ? "border-2 border-blue-200!"
            : "border-2 border-green-200!"
          : isSelected && "border-2 border-amber-200!"
      )}
      onClick={() => onSelect(delivery)}
    >
      <ItemContent className="truncate">
        <ItemTitle className="truncate font-semibold">{cardTitle}</ItemTitle>
        <ItemDescription className="text-xs font-semibold">
          {formattedDate}
        </ItemDescription>
      </ItemContent>
      <ItemMedia
        className={cn("size-10 flex items-center justify-center rounded-xl")}
        title={
          correction?.id
            ? correction.has_feedback_sent
              ? "Feedback enviado"
              : "Corrigido"
            : "Correção pendente"
        }
      >
        {correction?.id ? (
          correction.has_feedback_sent ? (
            <MailCheck className="size-5 stroke-blue-600 stroke-2" />
          ) : (
            <Check className="size-5 stroke-green-600 stroke-2" />
          )
        ) : (
          <Clock className="size-5 stroke-amber-400 stroke-2" />
        )}
      </ItemMedia>
    </Item>
  );
}
