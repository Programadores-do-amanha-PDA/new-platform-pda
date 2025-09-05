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

import { ParticipantDataT } from "@/types";

interface DataReviewStageProps {
  participantData: ParticipantDataT[];
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
      <div className="w-full max-h-96 flex overflow-y-auto my-4 border rounded-lg">
        <Table className="w-full h-full">
          <TableHeader className="sticky top-0 bg-sidebar z-10 border-0!">
            <TableRow className="border-0!">
              <TableHead className="max-w-56 w-56 truncate font-semibold p-0! border-0!">
                <div className="w-full h-full p-2 flex justify-start items-center border-r border-b">
                  Nome
                </div>
              </TableHead>
              <TableHead className="max-w-56 w-56 truncate font-semibold p-0! border-0!">
                <div className="w-full h-full p-2 flex justify-start items-center border-r border-b">
                  Email
                </div>
              </TableHead>
              <TableHead className="max-w-32 w-32 truncate font-semibold p-0! border-0!">
                <div className="w-full h-full p-2 flex justify-center items-center border-r border-b">
                  Respostas
                </div>
              </TableHead>
              <TableHead className="max-w-32 w-32 truncate font-semibold p-0! border-0!">
                <div className="w-full h-full p-2 flex justify-center items-center border-r border-b">
                  Integridade
                </div>
              </TableHead>
              <TableHead className="max-w-32 w-32 truncate font-semibold p-0! border-0">
                <div className="w-full h-full p-2 flex justify-center items-center border-b">
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
                    <div className="h-14! flex justify-start items-center border-r border-b p-2 truncate">
                      {participant.name}
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="h-14! flex justify-start items-center border-r border-b p-2 truncate">
                      {participant.email}
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="h-14! flex justify-center items-center border-r border-b p-2">
                      <span className="font-semibold">
                        {participant.results.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="h-14! flex justify-center items-center border-r border-b p-2">
                      <span className="font-semibold">
                        {participant.integrityEvents.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-0!">
                    <div className="h-14! flex justify-center items-center border-b p-2">
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