import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

import { DialogActionsFooterProps } from "./insert-many-activities-dialog.types";

const InsertManyActivitiesActionsFooter = ({
    stage,
    students,
    loading,
    onBackToUpload,
    onSubmitAsync,
    onRetryFailed,
}: Readonly<DialogActionsFooterProps>) => {
    return (
        <DialogFooter className="flex flex-row justify-end gap-2">
            {stage === 0 && (
                <DialogClose>
                    <Button variant="outline" className="font-semibold text-muted-foreground">
                        Cancelar
                    </Button>
                </DialogClose>
            )}

            {stage === 1 && (
                <>
                    <Button onClick={onBackToUpload} variant="outline" className="font-semibold text-muted-foreground">
                        Trocar arquivo CSV
                    </Button>
                    {students.length > 0 && (
                        <Button onClick={() => (!loading ? onSubmitAsync() : null)} className="font-semibold" disabled={loading}>
                            {loading && <LoaderCircle className="size-5 animate-spin" />}
                            Criar atividade com {students.length} participantes
                        </Button>
                    )}
                </>
            )}

            {stage === 2 && (
                <>
                    {students.filter((student) => student.status !== "success").length > 0 && (
                        <Button onClick={onRetryFailed} variant="outline" className="font-semibold text-muted-foreground">
                            Tentar novamente
                        </Button>
                    )}

                    <DialogClose>
                        <Button className="font-semibold">Finalizar</Button>
                    </DialogClose>
                </>
            )}
        </DialogFooter>
    );
};

export default InsertManyActivitiesActionsFooter;
