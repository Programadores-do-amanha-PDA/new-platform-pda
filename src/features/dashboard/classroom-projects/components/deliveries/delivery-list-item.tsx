"use client";

import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
} from "@/components/ui/item";

import { DeliveryListItemProps } from "../../types/delivery-list-item";

export function DeliveryListItem({
  delivery,
  deliveryIndex,
  deliveryAuthor,
  projectType,
  hasCorrection,
  isSelected,
  onSelect,
}: DeliveryListItemProps) {
  const displayName =
    projectType === "mini_project"
      ? deliveryAuthor?.full_name || "Autor desconhecido"
      : `Squad ${deliveryIndex + 1}`;

  const formattedDate = formatDate(delivery.created_at, "dd/MM/yy", {
    locale: ptBR,
  });

  return (
    <Item
      variant="outline"
      className={cn(
        "min-w-xs max-w-xs cursor-pointer hover:bg-accent/50 transition-colors",
        isSelected && hasCorrection
          ? "border-2 border-green-200!"
          : isSelected && "border-2 border-amber-200!"
      )}
      onClick={() => onSelect(delivery)}
    >
      <ItemContent className="truncate">
        <ItemTitle className="truncate font-semibold">{displayName}</ItemTitle>
        <ItemDescription className="text-xs font-semibold">
          {formattedDate}
        </ItemDescription>
      </ItemContent>
      <ItemMedia
        className={cn("size-10 flex items-center justify-center rounded-xl")}
        title={hasCorrection ? "Corrigido" : "Correção pendente"}
      >
        {hasCorrection ? (
          <Check className="size-5 stroke-green-600 stroke-3" />
        ) : (
          <Clock className="size-5 stroke-amber-400 stroke-3" />
        )}
      </ItemMedia>
    </Item>
  );
}
