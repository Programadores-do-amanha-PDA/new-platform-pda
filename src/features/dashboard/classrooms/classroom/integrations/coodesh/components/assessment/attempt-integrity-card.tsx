"use client";
import { ShieldCheck } from "lucide-react";
import { CoodeshAttemptIntegrityRow } from "../../types";

const AttemptIntegrityCard = ({
  integrityEvents,
}: {
  integrityEvents: CoodeshAttemptIntegrityRow[];
}) => {
  if (integrityEvents.filter((event) => event.suspect === "Yes").length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 px-2 py-4 w-full h-full">
        <ShieldCheck className="stroke-green-400 size-12" />
        <p className="text-muted-foreground text-sm text-center">
          Nenhuma atividade suspeita encontrada
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-center gap-4 px-2 py-4 w-full h-full">
      <p className="flex justify-center items-center bg-red-100 p-4 rounded-md size-12 font-bold text-foreground text-2xl">
        {integrityEvents.filter((event) => event.suspect === "Yes").length}
      </p>

      <p className="text-muted-foreground text-sm text-center">
        Atividades suspeitas encontradas
      </p>
    </div>
  );
};
export default AttemptIntegrityCard;
