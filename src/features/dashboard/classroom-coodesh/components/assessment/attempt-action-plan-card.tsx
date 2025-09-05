"use client"
import { Map } from "lucide-react";
import { ActionPlanRowT } from "@/types";

const AttemptActionPlanCard = ({
  actionPlans,
}: {
  actionPlans: ActionPlanRowT[];
}) => {
  if (actionPlans.length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-4 py-4 px-2">
        <Map className="size-12 stroke-muted-foreground" />
        <p className="text-muted-foreground text-sm text-center">
          Nenhuma recomendação
        </p>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 py-4 px-2">
      <p className="text-foreground text-2xl font-bold p-4 size-12 rounded-md bg-green-100 flex items-center justify-center">
        {actionPlans.length}
      </p>

      <p className="text-muted-foreground text-sm text-center">
        Recomendações encontradas
      </p>
    </div>
  );
};
export default AttemptActionPlanCard;
