"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, FilePen, MoreHorizontal, Trash2, Users, Edit } from "lucide-react";

import { useUsersStore } from "@/features/users/management";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import { useClassroomProjectDeliveriesStore } from "../../stores/deliveries";
import RenderSquadMembers from "./render-squad-members";
import { groupDeliveriesByIndividual, groupDeliveriesBySquad } from "../../utils/deliveries/delivery-grouping";
import ProjectDeliveryModal from "../project/project-delivery-modal";
import { useClassroomProjectStore } from "../../stores";
import { ClassroomProjectType } from "../../types/projects/project";
import { ClassroomProjectCorrection } from "../../types/corrections/corrections";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";

export function GroupedDeliveryTable({
    deliveries,
    projectType,
    classroomId,
    projectId,
    corrections = [],
}: {
    deliveries: ClassroomProjectDelivery[];
    projectType: ClassroomProjectType;
    classroomId: string;
    projectId: string;
    corrections?: ClassroomProjectCorrection[];
}) {
    const [expandedUsers, setExpandedUsers] = React.useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = React.useState("");
    const [editingDelivery, setEditingDelivery] = React.useState<ClassroomProjectDelivery | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const { users } = useUsersStore();
    const { deleteDelivery } = useClassroomProjectDeliveriesStore();
    const { projects } = useClassroomProjectStore();
    const { getEnrollmentsByClassroom } = useEnrollmentsManagementStore();
    const enrollments = getEnrollmentsByClassroom(classroomId);

    const classroomUsers = users.filter((user) => enrollments.some((enrollment) => enrollment.user_id === user.id));

    // Agrupar entregas por usuário único
    const groupedDeliveries = React.useMemo(() => {
        let grouped;

        if (projectType === "mini_project") {
            grouped = groupDeliveriesByIndividual(deliveries, classroomUsers);
        } else if (projectType === "end_module_project" || projectType === "end_module_english_project") {
            grouped = groupDeliveriesBySquad(deliveries, classroomUsers);
        }

        return grouped;
    }, [classroomUsers, deliveries, projectType]);

    // Filtrar por termo de busca
    const filteredGroups = React.useMemo(() => {
        if (!searchTerm || !groupedDeliveries) return groupedDeliveries;

        return groupedDeliveries.filter((group) => {
            const user = group.user;
            const searchLower = searchTerm.toLowerCase();

            // Buscar por nome, email do usuário principal
            const userMatches =
                user?.full_name?.toLowerCase().includes(searchLower) ||
                user?.email?.toLowerCase().includes(searchLower) ||
                user?.email?.toLowerCase().includes(searchLower);

            // Para projetos finais, buscar também pelos membros da squad
            if (projectType === "end_module_project" || projectType === "end_module_english_project") {
                const squadMatches = group.squadMembers?.some((memberId) => {
                    const member = classroomUsers.find((u) => u.id === memberId);
                    return (
                        member?.full_name?.toLowerCase().includes(searchLower) ||
                        member?.email?.toLowerCase().includes(searchLower)
                    );
                });

                return userMatches || squadMatches;
            }

            return userMatches;
        });
    }, [groupedDeliveries, searchTerm, projectType, classroomUsers]);

    const toggleExpanded = (userId: string) => {
        const newExpanded = new Set(expandedUsers);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedUsers(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date(dateString));
    };

    const handleEditDelivery = (delivery: ClassroomProjectDelivery) => {
        setEditingDelivery(delivery);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDelivery(null);
    };

    const currentProject = projects.find((project) => project.id === projectId);

    const getLatestCorrection = (deliveryId: string): ClassroomProjectCorrection | undefined => {
        const deliveryCorrections = corrections.filter((correction) => correction.delivery_id === deliveryId);

        if (deliveryCorrections.length === 0) return undefined;

        // Ordenar por data de criação (mais recente primeiro) e retornar a primeira
        return deliveryCorrections.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    };

    const getGradeBadgeVariant = (grade: string): "default" | "secondary" | "destructive" | "outline" => {
        const numericGrade = parseFloat(grade);
        if (isNaN(numericGrade)) return "outline";

        if (numericGrade >= 8) return "default"; // Verde para notas altas (8-10)
        if (numericGrade >= 6) return "secondary"; // Amarelo para notas médias (6-7.9)
        return "destructive"; // Vermelho para notas baixas (0-5.9)
    };

    const formatCorrectionDate = (dateString: string): string => {
        try {
            return new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
            }).format(new Date(dateString));
        } catch {
            return "Data inválida";
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Procurando por alguém?"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="max-w-sm"
                />
                <Button asChild>
                    <Link
                        href={`/dashboard/classrooms/${classroomId}/projects/${projectId}/corrections`}
                        className="font-semibold hover:underline"
                    >
                        <FilePen className="w-4 h-4" />
                        Área de correção
                    </Link>
                </Button>
            </div>

            <div className="flex border rounded-lg w-full h-full overflow-hidden">
                <Table>
                    <TableHeader className="top-0 z-10 sticky bg-sidebar p-0! **:font-semibold">
                        <TableRow className="p-0! border-0!">
                            <TableHead className="p-0!">
                                <div className="flex justify-start items-center px-2 border-b w-full h-full">
                                    {projectType === "mini_project" ? "Usuário" : "Squad"}
                                </div>
                            </TableHead>
                            <TableHead className="p-0! text-center">
                                <div className="flex justify-start items-center px-2 border-b w-full h-full">
                                    Total de Entregas
                                </div>
                            </TableHead>
                            <TableHead className="p-0! text-center">
                                <div className="flex justify-start items-center px-2 border-b w-full h-full">
                                    Última Entrega
                                </div>
                            </TableHead>
                            <TableHead className="p-0! text-center">
                                <div className="flex justify-start items-center px-2 border-b w-full h-full">
                                    Última Correção
                                </div>
                            </TableHead>
                            <TableHead className="p-0!">
                                <div className="flex justify-start items-center px-2 border-b w-full h-full"></div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGroups && filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => (
                                <React.Fragment key={group.userId}>
                                    {/* Linha principal do usuário/squad */}
                                    <TableRow
                                        className={cn("hover:bg-muted/25", expandedUsers.has(group.userId) && "bg-muted/40!")}
                                        onClick={() => toggleExpanded(group.userId)}
                                    >
                                        <TableCell>
                                            {projectType === "mini_project" ? (
                                                <div className="flex justify-start items-center gap-2 w-full h-full">
                                                    <Avatar>
                                                        <AvatarImage src={group.user?.avatar_url || ""} />
                                                        <AvatarFallback>
                                                            {getFirstLastInitials(group.user?.full_name || "")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {group.user?.full_name || "Nome não disponível"}
                                                        </div>
                                                        <div className="text-muted-foreground text-sm">
                                                            {group.user?.email || "Email não disponível"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Users className="w-4 h-4" />
                                                        <span className="font-semibold">
                                                            Squad ({group.squadMembers?.length || 0} membros)
                                                        </span>
                                                    </div>
                                                    {group.squadMembers && (
                                                        <RenderSquadMembers
                                                            classroomUsers={classroomUsers}
                                                            squadMembers={group.squadMembers}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-start items-center w-full h-full">
                                                <Badge variant="outline">{group.deliveries.length}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-start items-center w-full h-full">
                                                {group.deliveries.length > 0 && (
                                                    <span className="text-sm">
                                                        {formatDate(
                                                            group.deliveries.sort(
                                                                (a, b) =>
                                                                    new Date(b.created_at).getTime() -
                                                                    new Date(a.created_at).getTime(),
                                                            )[0].created_at,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-start items-center gap-2 w-full h-full">
                                                {(() => {
                                                    // Encontrar a correção mais recente de todas as entregas do grupo
                                                    const allCorrections = group.deliveries
                                                        .map((delivery) => getLatestCorrection(delivery.id))
                                                        .filter(Boolean) as ClassroomProjectCorrection[];

                                                    if (allCorrections.length === 0) {
                                                        return <span className="text-muted-foreground text-sm">Pendente</span>;
                                                    }

                                                    const latestCorrection = allCorrections.sort(
                                                        (a, b) =>
                                                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                                    )[0];

                                                    return (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <Badge variant={getGradeBadgeVariant(latestCorrection.final_note)}>
                                                                {latestCorrection.final_note}
                                                            </Badge>
                                                            <span className="text-muted-foreground text-xs">
                                                                {formatCorrectionDate(latestCorrection.created_at)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpanded(group.userId)}
                                                title={`${expandedUsers.has(group.userId) ? "Ocultar" : "Exibir"}
                        Entregas`}
                                            >
                                                {expandedUsers.has(group.userId) ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {/* Linhas expandidas com entregas individuais */}
                                    {expandedUsers.has(group.userId) && (
                                        <TableRow className="bg-muted/40!">
                                            <TableCell colSpan={5} className="bg-p! p-0">
                                                <div className="bg-transparent! p-4">
                                                    <Table>
                                                        <TableHeader className="**:font-semibold">
                                                            <TableRow className="bg-transparent!">
                                                                <TableHead>ID da Entrega</TableHead>
                                                                <TableHead>Data de Entrega</TableHead>
                                                                <TableHead>Última Correção & Nota</TableHead>
                                                                <TableHead>Links</TableHead>
                                                                <TableHead className="max-w-48!">Observação</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {group.deliveries
                                                                .sort(
                                                                    (a, b) =>
                                                                        new Date(b.created_at).getTime() -
                                                                        new Date(a.created_at).getTime(),
                                                                )
                                                                .map((delivery) => (
                                                                    <TableRow key={delivery.id} className="bg-transparent!">
                                                                        <TableCell className="font-mono text-xs">
                                                                            {delivery.id.slice(0, 8)}...
                                                                        </TableCell>
                                                                        <TableCell>{formatDate(delivery.created_at)}</TableCell>
                                                                        <TableCell>
                                                                            {(() => {
                                                                                const correction = getLatestCorrection(
                                                                                    delivery.id,
                                                                                );
                                                                                if (!correction) {
                                                                                    return (
                                                                                        <span className="text-muted-foreground">
                                                                                            Pendente
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                                return (
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <span className="text-sm">
                                                                                            {formatCorrectionDate(
                                                                                                correction.created_at,
                                                                                            )}
                                                                                        </span>
                                                                                        <Badge
                                                                                            variant={getGradeBadgeVariant(
                                                                                                correction.final_note,
                                                                                            )}
                                                                                            className="w-fit"
                                                                                        >
                                                                                            Nota: {correction.final_note}
                                                                                        </Badge>
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {delivery.links && delivery.links.length > 0 ? (
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {delivery.links.map((link, index) => (
                                                                                        <Badge
                                                                                            key={index}
                                                                                            variant="outline"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            <a
                                                                                                href={link}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="hover:underline"
                                                                                            >
                                                                                                Link {index + 1}
                                                                                            </a>
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-muted-foreground">
                                                                                    Nenhum link
                                                                                </span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="max-w-48! text-sm">
                                                                            {delivery.observation ? (
                                                                                <span className="text-sm text-wrap">
                                                                                    {delivery.observation}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-muted-foreground">
                                                                                    Sem observação
                                                                                </span>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        className="p-0 w-8 h-8"
                                                                                    >
                                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end">
                                                                                    <DropdownMenuItem
                                                                                        onClick={() =>
                                                                                            handleEditDelivery(delivery)
                                                                                        }
                                                                                    >
                                                                                        <Edit className="mr-2 w-4 h-4" />
                                                                                        Editar Entrega
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() =>
                                                                                            deleteDelivery(
                                                                                                delivery.id,
                                                                                                classroomId,
                                                                                            )
                                                                                        }
                                                                                        variant="destructive"
                                                                                    >
                                                                                        <Trash2 className="mr-2 w-4 h-4" />
                                                                                        Deletar Entrega
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhuma entrega encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center text-muted-foreground text-sm">
                <span>
                    {filteredGroups?.length} {projectType === "mini_project" ? "usuários" : "squads"} com entregas
                </span>
                <span>Total de {deliveries.length} entregas</span>
            </div>

            {/* Edit Delivery Modal */}
            {currentProject && (
                <ProjectDeliveryModal
                    project={currentProject}
                    classroomId={classroomId}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    currentDelivery={editingDelivery || undefined}
                />
            )}
        </div>
    );
}
