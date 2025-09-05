"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, FileCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

interface FileUploadStageProps {
  resultsCsv: string | null;
  integrityCsv: string | null;
  actionPlansCsv: string | null;
  setResultsCsv: (value: string | null) => void;
  setIntegrityCsv: (value: string | null) => void;
  setActionPlansCsv: (value: string | null) => void;
  onExtractData: () => void;
}

interface FileInputProps {
  id: string;
  label: string;
  onChange: (file: string | null) => void;
}

const FileInput = ({ id, label, onChange }: FileInputProps) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
          setSelectedFileName(file.name);
          toast.success(`${label} carregado com sucesso.`);
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Selecione um arquivo válido.");
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    setSelectedFileName(null);
    // Reset the input value
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <Label className="font-semibold" htmlFor={id}>
        {label}
      </Label>

      <input
        id={id}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFileName ? (
        <Label
          htmlFor={id}
          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Clique para selecionar arquivo CSV
          </span>
        </Label>
      ) : (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center gap-2">
            <FileCheck className="size-5 text-primary-foreground" />
            <span className="text-sm font-medium max-w-48">
              {selectedFileName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="h-full w-6 p-0 hover:bg-destructive/10"
          >
            <X className="size-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
};

const FileUploadStage = ({
  resultsCsv,
  integrityCsv,
  actionPlansCsv,
  setResultsCsv,
  setIntegrityCsv,
  setActionPlansCsv,
  onExtractData,
}: FileUploadStageProps) => {
  const allFilesSelected = resultsCsv && integrityCsv && actionPlansCsv;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        <FileInput
          id="resultsFile"
          label="Respostas"
          onChange={setResultsCsv}
        />
        <FileInput
          id="integrityFile"
          label="Integridade"
          onChange={setIntegrityCsv}
        />
        <FileInput
          id="actionPlanFile"
          label="Plano de ação"
          onChange={setActionPlansCsv}
        />
      </div>

      <DialogFooter className="!flex flex-row! justify-end gap-2">
        <DialogClose>
          <Button
            variant="outline"
            className="font-semibold text-muted-foreground"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          onClick={onExtractData}
          disabled={!allFilesSelected}
          className="font-semibold"
        >
          Extrair dados
        </Button>
      </DialogFooter>
    </>
  );
};

export default FileUploadStage;
