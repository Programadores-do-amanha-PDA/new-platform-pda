"use client";

import { ChangeEvent, useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { sileo } from "sileo";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useActivityStore } from "../store";
import { ActivityClassTypes } from "../types";
import InsertManyActivitiesActionsFooter from "./insert-many-activities-actions-footer";
import InsertManyActivitiesConfigSection from "./insert-many-activities-config-section";
import InsertManyActivitiesCsvUploadSection from "./insert-many-activities-csv-upload-section";
import { getStageDescription, getTodayDate, parseStudentsFromRows } from "./insert-many-activities-dialog.helpers";
import { ActivityRow, DialogStage, StudentData } from "./insert-many-activities-dialog.types";
import InsertManyActivitiesParticipantsTable from "./insert-many-activities-participants-table";

interface InsertManyActivitiesDialogProps {
    readonly classroomId: string;
}

const InsertManyActivitiesDialog = ({ classroomId }: Readonly<InsertManyActivitiesDialogProps>) => {
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState<StudentData[]>([]);
    const [activityType, setActivityType] = useState<ActivityClassTypes>("programming");
    const [activityVisible, setActivityVisible] = useState<boolean>(true);
    const [activityDate, setActivityDate] = useState<string>(() => getTodayDate());
    const [stage, setStage] = useState<DialogStage>(0);
    const [loading, setLoading] = useState(false);

    const { createMultipleActivities } = useActivityStore();

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

                    const parsedStudents = parseStudentsFromRows(results.data as ActivityRow[]);
                    setStudents(parsedStudents);
                    setStage(1);
                },
                error: (error: Error) => {
                    console.error("Error in parsing file:", error);
                    setStage(0);
                    setStudents([]);
                    sileo.error({
                        title: "Erro ao processar CSV",
                        description: "Ocorreu um erro ao processar o arquivo CSV. Verifique o formato e tente novamente.",
                        position: "top-right",
                    });
                },
            });
        } else {
            setStudents([]);
        }
    };

    const handleSubmitAsync = async () => {
        setLoading(true);

        const activityToCreate = {
            classroom_id: classroomId,
            class_type: activityType,
            participants_email: students.map((student) => student.email),
            is_visible_on_schedule: activityVisible,
            created_at: activityDate,
        };

        try {
            const success = await createMultipleActivities({ activitiesData: [activityToCreate] });

            if (success) {
                setStudents((prevStudents) =>
                    prevStudents.map((student) => ({
                        ...student,
                        status: "success",
                    })),
                );
                sileo.success({
                    title: "Atividade criada com sucesso!",
                    description: `Atividade criada com ${students.length} participantes!`,
                    position: "top-right",
                });
            } else {
                throw new Error("Failed to create activity");
            }
        } catch (error) {
            console.error("Error creating activity:", error);
            setStudents((prevStudents) =>
                prevStudents.map((student) => ({
                    ...student,
                    status: "error",
                })),
            );
            sileo.error({
                title: "Erro ao criar atividade",
                description: "Ocorreu um erro ao criar a atividade. Tente novamente mais tarde.",
                position: "top-right",
            });
        }

        setLoading(false);
        setStage(2);
    };

    const handleStudentEmailChange = (index: number, value: string) => {
        setStudents((prevStudents) => prevStudents.map((student, i) => (index === i ? { ...student, email: value } : student)));
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setStudents([]);
            setActivityType("programming");
            setActivityVisible(true);
            setActivityDate(getTodayDate());
            setStage(0);
            setLoading(false);
        }

        setOpen(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="size-4" />
                    Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="w-max min-w-[50vw] max-w-[85vw] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Importar atividade via CSV</DialogTitle>
                    <DialogDescription>{getStageDescription(stage)}</DialogDescription>
                </DialogHeader>

                {stage === 0 ? (
                    <InsertManyActivitiesCsvUploadSection onFileChange={handleFileChange} />
                ) : (
                    <>
                        <InsertManyActivitiesConfigSection
                            activityType={activityType}
                            onActivityTypeChange={setActivityType}
                            activityDate={activityDate}
                            onActivityDateChange={setActivityDate}
                            activityVisible={activityVisible}
                            onActivityVisibleChange={setActivityVisible}
                        />

                        <InsertManyActivitiesParticipantsTable
                            students={students}
                            stage={stage}
                            onStudentEmailChange={handleStudentEmailChange}
                        />
                    </>
                )}

                <InsertManyActivitiesActionsFooter
                    stage={stage}
                    students={students}
                    loading={loading}
                    onBackToUpload={() => {
                        setStudents([]);
                        setStage(0);
                    }}
                    onSubmitAsync={handleSubmitAsync}
                    onRetryFailed={() => {
                        setStudents((prev) => prev.filter((student) => student.status !== "success"));
                        setStage(1);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default InsertManyActivitiesDialog;
