import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ParticipantsTableProps } from "./insert-many-activities-dialog.types";

const InsertManyActivitiesParticipantsTable = ({
    students,
    stage,
    onStudentEmailChange,
}: Readonly<ParticipantsTableProps>) => {
    return (
        <div className="flex border rounded-lg w-full max-h-96 overflow-y-auto">
            <Table className="w-full h-full">
                <TableHeader className="top-0 z-10 sticky bg-background shadow-sm">
                    <TableRow>
                        <TableHead className="font-semibold">Email dos Participantes</TableHead>
                        {stage === 2 && <TableHead className="font-semibold">Status</TableHead>}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {students.map((student, index) => (
                        <TableRow
                            key={student.email}
                            className={
                                student.status === "success" ? "bg-green-100" : student.status === "error" ? "bg-red-100" : ""
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
                                        onChange={(e) => onStudentEmailChange(index, e.target.value)}
                                    />
                                )}
                            </TableCell>
                            {stage === 2 && (
                                <TableCell>
                                    <Badge variant={student.status === "success" ? "default" : "destructive"}>
                                        {student.status === "success" ? "Sucesso" : "Erro"}
                                    </Badge>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InsertManyActivitiesParticipantsTable;
