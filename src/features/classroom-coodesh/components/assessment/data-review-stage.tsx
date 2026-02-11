"use client";

import { LoaderCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CoodeshAttemptParticipantData } from "../../types";


interface DataReviewStageProps {
  participantData: CoodeshAttemptParticipantData[];
  loading: boolean;
  onSubmit: () => void;
  onBackToFileSelection: () => void;
}

const DataReviewStage = ({
  participantData,
  loading,
  onSubmit,
  onBackToFileSelection,
}: DataReviewStageProps) => {
  return (
    <>
      <div className="flex my-4 border rounded-lg w-full max-h-96 overflow-y-auto">
        <Table className="w-full h-full">
          <TableHeader className="top-0 z-10 sticky bg-sidebar border-0!">
            <TableRow className="border-0!">
              <TableHead className="p-0! border-0! w-56 max-w-56 font-semibold truncate">
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                  Nome
                </div>
              </TableHead>
              <TableHead className="p-0! border-0! w-56 max-w-56 font-semibold truncate">
                <div className="flex justify-start items-center p-2 border-r border-b w-full h-full">
                  Email
                </div>
              </TableHead>
              <TableHead className="p-0! border-0! w-32 max-w-32 font-semibold truncate">
                <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
                  Respostas
                </div>
              </TableHead>
              <TableHead className="p-0! border-0! w-32 max-w-32 font-semibold truncate">
                <div className="flex justify-center items-center p-2 border-r border-b w-full h-full">
                  Integridade
                </div>
              </TableHead>
              <TableHead className="p-0! border-0 w-32 max-w-32 font-semibold truncate">
                <div className="flex justify-center items-center p-2 border-b w-full h-full">
                  Planos de ação
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participantData
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((participant) => (
                <TableRow key={participant.email} className="p-0! border-0!">
                  <TableCell className="p-0! border-0!">
                    <div className="flex justify-start items-center p-2 border-r border-b h-14! truncate">
                      {participant.name}
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="flex justify-start items-center p-2 border-r border-b h-14! truncate">
                      {participant.email}
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="flex justify-center items-center p-2 border-r border-b h-14!">
                      <span className="font-semibold">
                        {participant.results.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="flex justify-center items-center p-2 border-r border-b h-14!">
                      <span className="font-semibold">
                        {participant.integrityEvents.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="flex justify-center items-center p-2 border-b h-14!">
                      <span className="font-semibold">
                        {participant.actionPlans.length}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBackToFileSelection}
          variant="outline"
          className="font-semibold text-muted-foreground"
        >
          Trocar arquivos CSV
        </Button>
        
        {participantData.length > 0 && (
          <Button
            onClick={onSubmit}
            className="font-semibold"
            disabled={loading}
          >
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            Inserir {participantData.length} dados
          </Button>
        )}
      </div>
    </>
  );
};

export default DataReviewStage;