import { IntegrityRowT } from "@/types/classroom-coodesh/attempts";
import { ShieldCheck } from "lucide-react";

const AttemptIntegrityCard = ({
  integrityEvents,
}: {
  integrityEvents: IntegrityRowT[];
}) => {
  if (integrityEvents.filter((event) => event.suspect === "Yes").length === 0) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-4 py-4 px-2">
        <ShieldCheck className="size-12 stroke-green-400" />
        <p className="text-muted-foreground text-sm text-center">
          Nenhuma atividade suspeita encontrada
        </p>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 py-4 px-2">
      <p className="text-foreground text-2xl font-bold p-4 size-12 rounded-md bg-red-100 flex items-center justify-center">
        {integrityEvents.filter((event) => event.suspect === "Yes").length}
      </p>

      <p className="text-muted-foreground text-sm text-center">
        Atividades suspeitas encontradas
      </p>
    </div>
  );
};
export default AttemptIntegrityCard;
