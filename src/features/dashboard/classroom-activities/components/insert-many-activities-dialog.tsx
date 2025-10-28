import { ChangeEvent, useState } from "react";
import Papa from "papaparse";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ActivityTypeSelector from "./activity-type-selector";
import { Switch } from "@/components/ui/switch";
import { ActivityTClassT } from "../types";
import { emailRegex } from "@/utils/regex/users";
import { useClassroomActivityStore } from "../store";

interface StudentData {
  email: string;
  status?: "success" | "error" | "warning";
}

interface ActivityRow {
  [key: string]: string | undefined;
}

type InsertManyActivitiesDialogProps = {
  classroomId: string;
};

const InsertManyActivitiesDialog = ({
  classroomId,
}: InsertManyActivitiesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [activityType, setActivityType] =
    useState<ActivityTClassT>("programming");
  const [activityVisible, setActivityVisible] = useState<boolean>(true);
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loading, setLoading] = useState(false);

  const { createMultipleActivities } = useClassroomActivityStore();

  const isValidEmail = (email: string): boolean => {
    return !!email && emailRegex.test(email.trim());
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      Papa.parse(file, {
        header: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("Parsing errors:", results.errors);
            setStudents([]);
            return;
          }

          // Extrair todos os emails únicos de todas as colunas
          const uniqueEmails = new Set<string>();

          (results.data as ActivityRow[]).forEach((row: ActivityRow) => {
            // Percorrer todas as colunas da linha
            Object.values(row).forEach((value) => {
              if (value && typeof value === "string") {
                const trimmedValue = value.trim();
                // Verificar se o valor é um email válido
                if (isValidEmail(trimmedValue)) {
                  uniqueEmails.add(trimmedValue);
                }
              }
            });
          });

          // Converter Set para array de objetos StudentData
          const parsedStudents = Array.from(uniqueEmails).map((email) => ({
            email,
          }));

          setStudents(parsedStudents);
          setStage(1);
        },
        error: (error: Error) => {
          console.error("Error in parsing file:", error);
          setStage(0);
          setStudents([]);
          toast.error("Erro ao processar arquivo CSV");
        },
      });
    } else {
      setStudents([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const activityToCreate = {
      classroom_id: classroomId,
      class_type: activityType,
      participants_email: students.map((student) => student.email),
      is_visible_on_schedule: activityVisible,
      created_at: activityDate,
    };

    try {
      const success = await createMultipleActivities([activityToCreate]);

      if (success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            status: "success",
          }))
        );
        toast.success(`Atividade criada com ${students.length} participantes!`);
      } else {
        throw new Error("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      setStudents((prevStudents) =>
        prevStudents.map((student) => ({
          ...student,
          status: "error",
        }))
      );
      toast.error("Erro ao criar atividade! Tente novamente mais tarde.");
    }

    setLoading(false);
    setStage(2);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStudents([]);
      setActivityType("programming");
      setActivityVisible(true);
      setActivityDate(new Date().toISOString().split("T")[0]);
      setStage(0);
      setLoading(false);
    }

    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="size-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[85vw] min-w-[50vw] w-max overflow-hidden">
        <DialogHeader>
          <DialogTitle>Importar atividade via CSV</DialogTitle>
          <DialogDescription>
            {stage === 0 && (
              <>
                Selecione um arquivo CSV para carregar os emails dos
                participantes da atividade
                <p>
                  O sistema irá buscar automaticamente por todos os emails
                  válidos em <b>qualquer coluna</b> do arquivo
                </p>
              </>
            )}
            {stage === 1 && "Configure a atividade e revise os participantes"}
            {stage === 2 && "Resultado da criação da atividade"}
          </DialogDescription>
        </DialogHeader>

        {stage === 0 ? (
          <div className="grid w-full items-center gap-4 my-4">
            <Label
              htmlFor="csv-file"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 w-max cursor-pointer"
            >
              Selecionar arquivo
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <>
            {/* Activity Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-muted/50 rounded-lg mb-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type" className="text-sm font-medium">
                  Tipo da Atividade
                </Label>
                <ActivityTypeSelector
                  value={activityType}
                  handleValueChange={setActivityType}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-date" className="text-sm font-medium">
                  Data da Atividade
                </Label>
                <Input
                  id="activity-date"
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Visível no Cronograma
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={activityVisible}
                    onCheckedChange={setActivityVisible}
                  />
                  <span className="text-sm text-muted-foreground">
                    {activityVisible ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-h-96 flex overflow-y-auto border rounded-lg">
              <Table className="w-full h-full">
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="font-semibold">
                      Email dos Participantes
                    </TableHead>
                    {stage === 2 && (
                      <TableHead className="font-semibold">Status</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students &&
                    students.map((student, index) => (
                      <TableRow
                        key={index}
                        className={
                          student.status === "success"
                            ? "bg-green-100"
                            : student.status === "error"
                            ? "bg-red-100"
                            : ""
                        }
                      >
                        <TableCell>
                          {stage === 2 ? (
                            <p className="text-sm">{student.email}</p>
                          ) : (
                            <Input
                              type="email"
                              value={student.email}
                              className="bg-background"
                              placeholder="email@example.com"
                              onChange={(e) =>
                                setStudents((prevStudents) =>
                                  prevStudents.map((s, i) =>
                                    index === i
                                      ? { ...s, email: e.target.value }
                                      : s
                                  )
                                )
                              }
                            />
                          )}
                        </TableCell>
                        {stage === 2 && (
                          <TableCell>
                            <Badge
                              variant={
                                student.status === "success"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {student.status === "success"
                                ? "Sucesso"
                                : "Erro"}
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2">
          {stage === 0 && (
            <DialogClose>
              <Button
                variant="outline"
                className="font-semibold text-muted-foreground"
              >
                Cancelar
              </Button>
            </DialogClose>
          )}
          {stage === 1 && (
            <>
              <Button
                onClick={() => {
                  setStudents([]);
                  setStage(0);
                }}
                variant="outline"
                className="font-semibold text-muted-foreground"
              >
                Trocar arquivo CSV
              </Button>
              {students.length > 0 && (
                <Button
                  onClick={() => (!loading ? handleSubmit() : null)}
                  className="font-semibold"
                  disabled={loading}
                >
                  {loading && <LoaderCircle className="size-5 animate-spin" />}
                  Criar atividade com {students.length} participantes
                </Button>
              )}
            </>
          )}
          {stage === 2 && (
            <>
              {students.filter((s) => s.status !== "success").length > 0 && (
                <Button
                  onClick={() => {
                    setStudents((prev) =>
                      prev.filter((s) => s.status !== "success")
                    );
                    setStage(1);
                  }}
                  variant="outline"
                  className="font-semibold text-muted-foreground"
                >
                  Tentar novamente
                </Button>
              )}

              <DialogClose>
                <Button className="font-semibold">Finalizar</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsertManyActivitiesDialog;
