"use client"
import { Map } from "lucide-react";
import { CoodeshAttemptActionPlanRow } from "../../types";

const AttemptActionPlanCard = ({
  actionPlans,
}: {
  actionPlans: CoodeshAttemptActionPlanRow[];
}) => {
  if (actionPlans.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 px-2 py-4 w-full h-full">
        <Map className="stroke-muted-foreground size-12" />
        <p className="text-muted-foreground text-sm text-center">
          Nenhuma recomendação
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-center gap-4 px-2 py-4 w-full h-full">
      <p className="flex justify-center items-center bg-green-100 p-4 rounded-md size-12 font-bold text-foreground text-2xl">
        {actionPlans.length}
      </p>

      <p className="text-muted-foreground text-sm text-center">
        Recomendações encontradas
      </p>
    </div>
  );
};
export default AttemptActionPlanCard;
