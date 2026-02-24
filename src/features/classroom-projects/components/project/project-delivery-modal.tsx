"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { Trash2, Link as LinkIcon, Loader2, CheckCircle, AlertCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsersStore } from "@/features/users/management";
import { useUserProfileStore } from "@/features/users/profile/store";
import { useEnrollmentsManagementStore } from "@/features/enrollments";
import { useClassroomSettingStore } from "@/features/classrooms/settings";
import { MemberSelectionCombobox } from "../deliveries/member-selection-combobox";
import { useClassroomProjectDeliveriesStore } from "../../stores/deliveries";
import { urlRegex } from "../../utils/deliveries/regex";
import { projectTypesLabels } from "../../utils/projects";
import { ClassroomProject } from "../../types/projects/project";
import { ClassroomProjectDelivery } from "../../types/deliveries/delivery";

const log = logger.child({ module: "ProjectDeliveryModal" });

interface LinkType {
    url: string;
}

interface ProjectDeliveryModalProps {
    project: ClassroomProject;
    classroomId: string;
    isOpen: boolean;
    onClose: () => void;
    currentDelivery?: ClassroomProjectDelivery;
}

/**
 * A modal component for managing project deliveries in a classroom setting.
 *
 * Handles both creation and updating of project deliveries, with support for:
 * - Squad member selection (for team-based projects)
 * - Project link attachments with URL validation
 * - Optional observations/notes
 * - Bilingual support (Portuguese/English)
 * - Mobile-responsive dialog layout
 *
 * @component
 * @param {ProjectDeliveryModalProps} props - Component props
 * @param {Project} props.project - The project to deliver
 * @param {string} props.classroomId - The classroom identifier
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Callback to close the modal
 * @param {Delivery | undefined} props.currentDelivery - Existing delivery for editing (undefined for new deliveries)
 *
 * @returns {ReactNode} A Dialog component containing the delivery form or success message
 *
 * @remarks
 * - For end module projects, at least one team member selection is mandatory
 * - All deliveries require at least one project link
 * - Only the assigned delivery author can submit/update the delivery
 * - Success state displays a confirmation message before closing
 * - Form state resets when modal opens or when currentDelivery changes
 *
 * @example
 * ```tsx
 * <ProjectDeliveryModal
 *   project={projectData}
 *   classroomId="cls_123"
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   currentDelivery={existingDelivery}
 * />
 * ```
 */
const ProjectDeliveryModal = ({ project, classroomId, isOpen, onClose, currentDelivery }: ProjectDeliveryModalProps) => {
    const { profile } = useUserProfileStore();
    const { createDelivery, updateDelivery } = useClassroomProjectDeliveriesStore();
    const { users } = useUsersStore();
    const { getEnrollmentsByClassroom } = useEnrollmentsManagementStore();
    const enrollments = getEnrollmentsByClassroom(classroomId);
    const isMobile = useIsMobile();

    const squadRef = useRef<HTMLDivElement>(null);
    const membersRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    const [isProjectDelivered, setIsProjectDelivered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const classroomUsers = users.filter((u) => enrollments?.some((c) => c.user_id === u.id)).filter(Boolean);

    // Form states
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [url, setUrl] = useState("");
    const [links, setLinks] = useState<LinkType[]>([]);
    const [observation, setObservation] = useState("");

    const { settingsByClassroom } = useClassroomSettingStore();
    const classroomModules = settingsByClassroom[project.classroom_id].modules || [];
    const projectModule = classroomModules.find((module) => module.id === project.module)?.title || `M${project.module}`;
    const deliveryAuthor = currentDelivery?.id ? classroomUsers.find((u) => u.id === currentDelivery.user_id) : profile;

    // Reset form when modal opens or populate with current delivery data
    useEffect(() => {
        if (isOpen) {
            setIsProjectDelivered(false);

            if (currentDelivery) {
                setSelectedMemberIds(currentDelivery.members_id || []);
                setUrl("");
                setLinks(currentDelivery.links.map((url) => ({ url })));
                setObservation(currentDelivery.observation || "");
            } else {
                setSelectedMemberIds([]);
                setUrl("");
                setLinks([]);
                setObservation("");
            }
        }
    }, [isOpen, currentDelivery]);

    const handleAddLink = (): void => {
        if (urlRegex.test(url)) {
            setLinks([...links, { url: url }]);
            setUrl("");
            toast.success({
                title: "Link anexado com sucesso!",
                description: `O link "${url}" foi anexado com sucesso!`,
            });
        } else {
            toast.error({
                title: "Link inválido!",
                description: "Por favor, insira um link válido!",
            });
        }
    };

    const handleRemoveLink = (index: number) => {
        if (index < links.length) {
            setLinks(links.filter((_, i) => i !== index));
            toast.success({
                title: "Link removido com sucesso!",
            });
        }
    };

    const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    const handleSubmitDelivery = async () => {
        if (!project || !deliveryAuthor) return;

        // Validations
        if (project.project_type === "end_module_project" && !currentDelivery) {
            toast.error({
                title: "Selecione sua Squad!",
            });
            scrollToRef(squadRef);
            return;
        }

        // Para projetos finais, pelo menos um membro é obrigatório
        if (project.project_type === "end_module_project" && selectedMemberIds.length === 0) {
            toast.error({
                title: "Erro ao selecionar membros!",
                description: "Por favor, selecione pelo menos um membro da equipe.",
            });
            scrollToRef(membersRef);
            return;
        }

        if (links.length === 0) {
            toast.error({
                title: "Erro ao adicionar links!",
                description: "Por favor, anexe pelo menos um link do seu projeto para realizar a entrega.",
            });
            scrollToRef(linksRef);
            return;
        }

        setIsLoading(true);

        try {
            const deliveryData = {
                project_id: project.id,
                user_id: deliveryAuthor.id,
                members_id: selectedMemberIds,
                links: links.map((l) => l.url),
                observation: observation.trim(),
                classroom_id: classroomId,
            };

            let success = false;

            if (currentDelivery) {
                // Update existing delivery
                success = await updateDelivery(currentDelivery.id, deliveryData, classroomId);
            } else {
                // Create new delivery
                success = await createDelivery(deliveryData, classroomId);
            }

            if (success) {
                setIsProjectDelivered(true);
            }
        } catch (error) {
            log.error(
                { err: error, operation: currentDelivery ? "update_project_delivery" : "create_project_delivery" },
                "Error submitting project delivery",
            );
            toast.error({
                title: "Erro ao entregar projeto!",
                description: `Erro ao ${currentDelivery ? "atualizar" : "criar"} entrega`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isEnglishProject = project.project_type === "end_module_english_project";
    const isMiniProject = project.project_type === "mini_project";

    if (isProjectDelivered) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className={cn(
                        "bg-green-50",
                        isMobile ? "w-full h-full max-w-none m-0 rounded-none" : "max-h-[90vh] overflow-y-auto",
                    )}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700!">
                            <CheckCircle className="w-6 h-6 text-green-700!" />
                            {currentDelivery
                                ? isEnglishProject
                                    ? `${projectModule} Final Project updated successfully!`
                                    : `Entrega do ${
                                          projectTypesLabels[project.project_type].label
                                      } do ${projectModule} atualizada com sucesso!`
                                : isEnglishProject
                                  ? `${projectModule} Final Project Delivery was successful!`
                                  : `Entrega do ${
                                        projectTypesLabels[project.project_type].label
                                    } do ${projectModule} feita com sucesso!`}
                        </DialogTitle>
                        <DialogDescription>
                            <p className="text-base">
                                {isEnglishProject
                                    ? "We will correct it and all members will receive feedback on the project in their emails!"
                                    : isMiniProject
                                      ? selectedMemberIds.length > 0
                                          ? "Iremos corrigir e todos os integrantes receberão o feedback do projeto em seus emails!"
                                          : "Iremos corrigir e você receberá o feedback do seu projeto em seu email!"
                                      : "Iremos corrigir e todos os integrantes receberão o feedback do projeto em seus emails!"}
                            </p>
                            <p className="text-base">
                                {isEnglishProject ? "Stay tuned and see you next time!" : "Fique ligado e até próxima!"}
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={
                    isMobile
                        ? "w-full h-full max-w-none m-0 rounded-none overflow-hidden overflow-y-auto"
                        : "max-w-[700px]! max-h-[90vh] overflow-hidden overflow-y-auto"
                }
            >
                <DialogHeader>
                    <DialogTitle>
                        {currentDelivery
                            ? isEnglishProject
                                ? `Edit ${project.module} Final Project Delivery`
                                : `Editar Entrega do ${projectTypesLabels[project.project_type].label} do ${projectModule}`
                            : isEnglishProject
                              ? `${project.module} Final Project Delivery`
                              : `Entrega do ${projectTypesLabels[project.project_type].label} do ${projectModule}`}
                    </DialogTitle>
                </DialogHeader>

                {/* Header */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground">
                            {isEnglishProject ? "Hello, hello! 🆙" : "Salve Salve, queridíssimos e queridíssimas!"}
                        </p>
                        <p>
                            {isEnglishProject
                                ? "How were your projects? 🙆🏿‍♀️ We are really excited!"
                                : "Arrasaram aí no projeto? 😎 Temos certeza que sim! "}
                        </p>
                        {!isMiniProject && (
                            <p>
                                {isEnglishProject
                                    ? "Each SQUAD will have 7 minutes to present their Project"
                                    : "Cada SQUAD terá 7 minutos para apresentar seu Projeto!"}
                            </p>
                        )}

                        {!currentDelivery && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertCircleIcon />
                                <AlertTitle className="font-semibold">
                                    {isEnglishProject
                                        ? "EACH SQUAD MUST DELIVER THE PROJECT ONLY ONCE."
                                        : isMiniProject
                                          ? "A entrega deve ser feita de forma unitária"
                                          : "Somente um integrante da Squad deve realizar a entrega"}
                                </AlertTitle>
                                {isMiniProject && (
                                    <AlertDescription>
                                        <p>Por favor antes de entregar revise as seguintes regras:</p>
                                        <ul className="text-sm list-disc list-inside">
                                            <li>
                                                Seu projeto só é considerado entregue se a sua Parceria PdA também entregar o
                                                dele/a.
                                            </li>
                                        </ul>
                                    </AlertDescription>
                                )}
                            </Alert>
                        )}
                    </div>

                    {/* Members Section */}
                    {!isMiniProject && (
                        <section ref={membersRef} className="flex flex-col">
                            <header>
                                <h3 className="font-bold">{isEnglishProject ? "*List Members" : "*Listar Integrantes"}</h3>
                            </header>
                            <div className="space-y-4 mt-2">
                                <p className="font-medium text-primary-foreground text-sm">Membro responsável pela entrega</p>
                                <div className="p-4 border border-primary rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={deliveryAuthor?.avatar_url || ""} />
                                            <AvatarFallback>
                                                {deliveryAuthor?.full_name
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="font-bold text-sm">{deliveryAuthor?.full_name}</p>
                                            <p className="text-muted-foreground text-sm">{deliveryAuthor?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <MemberSelectionCombobox
                                    label="Adicione os outros membros da Squad:"
                                    placeholder={
                                        isEnglishProject ? "Select team members..." : "Selecionar membros da equipe..."
                                    }
                                    users={classroomUsers}
                                    selectedUserIds={selectedMemberIds}
                                    currentUserId={profile?.id || ""}
                                    onChange={setSelectedMemberIds}
                                />
                            </div>
                        </section>
                    )}

                    {/* Members Section for Mini Projects */}
                    {isMiniProject && (
                        <section ref={membersRef} className="flex flex-col">
                            <header>
                                <h3 className="font-bold">*Integrantes</h3>
                            </header>
                            <div className="space-y-4 mt-2">
                                <p className="font-medium text-primary-foreground text-sm">Responsável pela entrega</p>
                                <div className="p-4 border border-primary rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={deliveryAuthor?.avatar_url || ""} />
                                            <AvatarFallback>
                                                {deliveryAuthor?.full_name
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="font-bold text-sm">{deliveryAuthor?.full_name}</p>
                                            <p className="text-muted-foreground text-sm">{deliveryAuthor?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Members Selection */}
                                <div className="space-y-2">
                                    <MemberSelectionCombobox
                                        label="Parcerias (opcional)"
                                        placeholder="Selecione seus/as parceiros/as..."
                                        users={classroomUsers}
                                        selectedUserIds={selectedMemberIds}
                                        currentUserId={deliveryAuthor?.id || ""}
                                        onChange={setSelectedMemberIds}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Links Section */}
                    <section ref={linksRef} className="flex flex-col gap-2">
                        <header>
                            <h3 className="font-semibold">{isEnglishProject ? "*Attach Links" : "*Anexar Links"}</h3>
                        </header>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://"
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddLink}>
                                    <LinkIcon className="mr-2 w-4 h-4" />
                                    {isEnglishProject ? "Add Link" : "Anexar Link"}
                                </Button>
                            </div>

                            {links.length > 0 && (
                                <div className="flex flex-col space-y-4 w-full">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" />
                                        <span className="font-semibold text-sm">
                                            {links.length} {isEnglishProject ? "Links added" : "Links adicionados"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col space-y-2 w-full overflow-hidden">
                                        {links.map((link, index) => (
                                            <div
                                                key={link.url}
                                                className="flex justify-between items-center p-2 border rounded-lg w-full truncate"
                                            >
                                                <p className="mr-2 text-sm">{link.url}</p>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon-sm"
                                                    onClick={() => handleRemoveLink(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Observation Section */}
                    <section className="flex flex-col gap-2">
                        <header>
                            <h3 className="font-semibold text-base">
                                {isEnglishProject ? "(Optional) Note" : "(Opcional) Observação"}
                            </h3>
                        </header>
                        <div className="flex flex-col gap-1 space-y-2">
                            <Label htmlFor="observation">
                                {isEnglishProject
                                    ? "Is there anything we need to know when correcting?"
                                    : "Tem algo que precisamos saber na hora da correção?"}
                            </Label>
                            <Textarea
                                id="observation"
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={3}
                                placeholder=""
                            />
                        </div>
                    </section>

                    {/* Submit Section */}
                    <section className="mt-4">
                        <div className="space-y-4">
                            <p className="font-medium">
                                {currentDelivery
                                    ? isEnglishProject
                                        ? "Please, check all fields before updating your project!"
                                        : "Verifique todos os campos antes de atualizar seu projeto!"
                                    : isEnglishProject
                                      ? "Please, check all fields before submitting your project!"
                                      : "Verifique todos os campos antes de entregar seu projeto!"}
                            </p>
                            <Button
                                onClick={handleSubmitDelivery}
                                disabled={isLoading}
                                className="w-full md:w-auto font-semibold"
                                size="lg"
                            >
                                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                {isLoading
                                    ? currentDelivery
                                        ? isEnglishProject
                                            ? "Updating..."
                                            : "Atualizando..."
                                        : isEnglishProject
                                          ? "Submitting..."
                                          : "Entregando..."
                                    : currentDelivery
                                      ? isEnglishProject
                                          ? "Update"
                                          : "Atualizar Entrega"
                                      : isEnglishProject
                                        ? "Submit"
                                        : "Entregar Projeto"}
                            </Button>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectDeliveryModal;
