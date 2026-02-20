"use client";

import * as React from "react";
import Link from "next/link";
import { FilePen } from "lucide-react";

import { useUsersStore } from "@/features/users/management";
import { flexRender } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useClassroomProjectDeliveriesStore } from "../../stores/deliveries";
import { useDeliveryTable } from "./use-delivery-table";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { ClassroomProjectType } from "../../types/projects/project";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";

/**
 * Presentational component for displaying classroom project deliveries in a data table.
 * Delegates table logic to useDeliveryTable hook.
 */
export function DeliveryDataTable({
    deliveries,
    projectType,
    classroomId,
    projectId,
}: {
    deliveries: ClassroomProjectDelivery[];
    projectType: ClassroomProjectType;
    classroomId: string;
    projectId: string;
}) {
    const { users } = useUsersStore();
    const { enrollmentsByUserId } = useEnrollmentsManagementStore();
    const { deleteDelivery } = useClassroomProjectDeliveriesStore();

    const classroomUsers = React.useMemo(
        () =>
            users.filter((user) => enrollmentsByUserId[user.id]?.some((enrollment) => enrollment.classroom_id === classroomId)),
        [users, enrollmentsByUserId, classroomId],
    );

    const handleDeleteDelivery = React.useCallback(
        (deliveryId: string) => deleteDelivery(deliveryId, classroomId),
        [deleteDelivery, classroomId],
    );

    const { table, filterColumnId, columns } = useDeliveryTable({
        deliveries,
        projectType,
        classroomUsers,
        onDeleteDelivery: handleDeleteDelivery,
    });

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Procurando por alguém?"
                    value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""}
                    onChange={(event) => {
                        console.log("Filter change:", {
                            filterColumnId,
                            value: event.target.value,
                            columnExists: !!table.getColumn(filterColumnId),
                        });
                        table.getColumn(filterColumnId)?.setFilterValue(event.target.value);
                    }}
                    className="max-w-sm"
                />
                <Button asChild>
                    <Link
                        href={`/dashboard/classrooms/${classroomId}/projects/${projectId}/corrections`}
                        className="font-semibold hover:underline"
                    >
                        <FilePen className="w-4 h-4" />
                        Area de correção
                    </Link>
                </Button>
            </div>
            <div className="flex border rounded-lg w-full h-full overflow-hidden">
                <Table>
                    <TableHeader className="top-0 z-10 sticky bg-white p-0!">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="shadow p-0! rounded-t-lg! overflow-hidden">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="p-0!">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="p-0! border-0! h-full!"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-0! border-0! h-full!">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhuma entrega encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex justify-end items-center space-x-2 py-4">
                    <div className="flex-1 text-muted-foreground text-sm">
                        {`${table.getFilteredSelectedRowModel().rows.length} linhas selecionadas.`}
                    </div>
                </div>
            )}
        </div>
    );
}
