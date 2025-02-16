import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";

const JobMatchTable = ({
  matchStatistics,
}: {
  matchStatistics: {
    area: number;
    language: number;
    studies: number;
    local: number;
    total: number;
  };
}) => {
  return (
    <Table className="rounded-md truncate bg-primary">
      <TableBody>
        <TableRow className="border-primary-foreground">
          <TableCell className="font-bold text-start w-max border-r">
            Tecnologias
          </TableCell>
          <TableCell className="flex gap-1 text-muted-foreground">
            <p className="font-bold text-primary-foreground">
              {Math.min(
                Math.round(matchStatistics.language /3 * 100 * 100) / 100,
                100
              ).toFixed()}{" "}
            </p>
            / 100
          </TableCell>
        </TableRow>
        <TableRow className="border-primary-foreground">
          <TableCell className="font-bold text-start w-max border-r">
            Area
          </TableCell>
          <TableCell>
            {matchStatistics.area === 1 ? (
              <Check className="size-5 stroke-primary-foreground stroke-2" />
            ) : (
              <X className="size-5 stroke-destructive stroke-2" />
            )}
          </TableCell>
        </TableRow>
        <TableRow className="border-primary-foreground">
          <TableCell className="font-bold text-start w-max border-r">
            Estudos
          </TableCell>
          <TableCell>
            {matchStatistics.studies === 1 ? (
              <Check className="size-5 stroke-primary-foreground stroke-2" />
            ) : (
              <X className="size-5 stroke-destructive stroke-2" />
            )}
          </TableCell>
        </TableRow>
        <TableRow className="border-primary-foreground">
          <TableCell className="font-bold text-start w-max border-r">
            Localização
          </TableCell>
          <TableCell>
            {matchStatistics.local === 0.5 ? (
              <Check className="size-5 stroke-primary-foreground stroke-2" />
            ) : (
              <X className="size-5 stroke-destructive stroke-2" />
            )}
          </TableCell>
        </TableRow>
        <TableRow className="!bg-primary-foreground">
          <TableCell className="font-bold text-primary text-start w-max border-r">
            Total
          </TableCell>
          <TableCell className="flex gap-1 text-muted-foreground">
            <p className="font-bold text-primary">{matchStatistics.total.toFixed()}</p>/
            100
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default JobMatchTable;
