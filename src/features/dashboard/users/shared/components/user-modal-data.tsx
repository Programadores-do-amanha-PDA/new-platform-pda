import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LoaderCircle, Sparkles, X, CheckCircle, AlertCircle } from "lucide-react";

import { UserMetadata } from "@supabase/supabase-js";
import { DialogClose } from "@radix-ui/react-dialog";
import { ClassroomCombobox } from "./classroom-combobox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import BadgeSelector from "@/components/shared/badge-selector";
import { generateRandomPassword } from "@/utils/password-generator";
import { userFormSchema, newUserFormSchema, UserFormData, NewUserFormData } from "../schemas/user-form-schema";
import { cn } from "@/lib/utils";
import { useClassroomStore } from "../../../classrooms/home-page/store";
import { Enrollment, useEnrollmentsStore } from "@/features/dashboard/shared/enrollments";
import { AuthUserWithProfile } from "@/features/dashboard/profile";
import { Role } from "@/types";

import { useRolesStore } from "../../stores/user-role";
import { useUsersStore } from "@/features/dashboard/shared/users";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "user-sheet-data" });

type UserModalDataProps = {
    mode: "new" | "edit";
    currentUser?: Partial<AuthUserWithProfile>;
    excludeRoles?: Role[];
};

const UserModalData = ({ mode, currentUser, excludeRoles }: UserModalDataProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { classrooms } = useClassroomStore();
    const { createNewUser, updateUser } = useUsersStore();
    const { addUserRole, updateUserRole, deleteUserRole } = useRolesStore();
    const { createNewEnrollments, removeEnrollmentsByUserAndClassrooms } = useEnrollmentsStore();

    const form = useForm({
        resolver: zodResolver(mode === "new" ? newUserFormSchema : userFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            userRole: "",
            enrollments: [],
        },
    });

    const { watch, setValue, reset, handleSubmit: formHandleSubmit } = form;
    const userRole = watch("userRole");
    const enrollments = watch("enrollments");

    useEffect(() => {
        if (mode === "edit" && isOpen && currentUser) {
            reset({
                fullName: currentUser.profile?.full_name || "",
                email: currentUser.email || "",
                password: "",
                userRole: currentUser.profile?.user_role.role || "",
                enrollments:
                    classrooms && classrooms.length > 0
                        ? currentUser.profile?.enrollments?.map((enrollment) => enrollment.classroom_id) || []
                        : [],
            });
        } else if (mode === "new" && isOpen) {
            reset({
                fullName: "",
                email: "",
                password: "",
                userRole: "",
                enrollments: [],
            });
        }
    }, [mode, isOpen, currentUser, reset, classrooms]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            form.clearErrors();
        }
    };

    const handleSetUserRoles = (newRole: string | null) => {
        if (newRole === null) {
            setValue("userRole", "");
            return;
        }

        const currentRole = userRole || "";
        if (!currentRole.includes(newRole as Role)) {
            setValue("userRole", newRole);
        } else {
            setValue("userRole", "");
        }
    };

    const handleGeneratePassword = () => {
        const newPassword = generateRandomPassword();
        setValue("password", newPassword);
        toast.success("Senha gerada com sucesso!", {
            description: "Uma nova senha segura foi gerada automaticamente.",
            icon: <CheckCircle className="size-4" />,
        });
    };

    const showSuccessToast = (message: string, description?: string) => {
        toast.success(message, {
            description,
            icon: <CheckCircle className="size-4" />,
            duration: 4000,
        });
    };

    const showErrorToast = (message: string, description?: string) => {
        toast.error(message, {
            description,
            icon: <AlertCircle className="size-4" />,
            duration: 5000,
        });
    };

    const handleUserCreation = async (data: UserFormData | NewUserFormData) => {
        try {
            const userData: Partial<AuthUserWithProfile & { password: string }> = {
                email: data.email,
                password: data.password,
                user_metadata: {
                    full_name: data.fullName,
                    user_email: data.email,
                },
            };

            const userCreatedId = await createNewUser({ userData });
            if (!userCreatedId) {
                throw new Error("Error on creating user");
            }

            // Handle roles
            if (data.userRole) {
                const role = data.userRole as Role;
                const roleSuccess = await addUserRole(userCreatedId, role);
                if (!roleSuccess) {
                    throw new Error("Failed to assign role");
                }
            }

            // Handle classroom enrollments
            if (classrooms && classrooms.length > 0 && createNewEnrollments && data.enrollments.length > 0) {
                const enrollmentsData: Omit<Enrollment, "short_id" | "mode">[] = data.enrollments.map((id) => ({
                    user_id: userCreatedId,
                    classroom_id: id,
                }));

                const enrollmentSuccess = await createNewEnrollments({ enrollments: enrollmentsData });
                if (!enrollmentSuccess) {
                    throw new Error("Failed to associate classes");
                }
            }

            showSuccessToast("Usuário criado com sucesso!");
        } catch (error) {
            log.error({ err: error, data, operation: "handleUserCreation" });
            throw error;
        }
    };

    const handleUserUpdate = async (data: UserFormData) => {
        try {
            if (!currentUser?.id) {
                throw new Error("User ID not found");
            }

            const userId = currentUser.id;
            const updateData: Partial<AuthUserWithProfile & { password: string }> = {};
            const userMetadata: UserMetadata = {};

            // Check what needs to be updated
            if (data.email !== currentUser.email) {
                updateData.email = data.email;
                userMetadata.user_email = data.email;
            }

            if (data.password) {
                updateData.password = data.password;
            }

            if (data.fullName !== currentUser.profile?.full_name) {
                userMetadata.full_name = data.fullName;
            }

            if (Object.keys(userMetadata).length > 0) {
                updateData.user_metadata = userMetadata;
            }

            // Update user data if there are changes
            if (Object.keys(updateData).length > 0) {
                const userUpdateResponse = await updateUser({ id: userId, updates: updateData });
                if (!userUpdateResponse) {
                    throw new Error("Failed to update user data");
                }
            }

            // Handle role updates
            const currentUserRole = currentUser?.profile?.user_role?.role || "";

            if (!currentUserRole && data.userRole) {
                const roleSuccess = await addUserRole(userId, data.userRole as Role);
                if (!roleSuccess) throw new Error("Failed to assign role");
            } else if (currentUserRole && data.userRole && currentUserRole !== data.userRole) {
                const roleSuccess = await updateUserRole(userId, data.userRole as Role);
                if (!roleSuccess) throw new Error("Failed to update role");
            } else if (currentUserRole && !data.userRole) {
                const roleSuccess = await deleteUserRole(userId);
                if (!roleSuccess) throw new Error("Failed to remove role");
            }

            // Handle enrollments updates
            if (classrooms && classrooms.length > 0 && createNewEnrollments && removeEnrollmentsByUserAndClassrooms) {
                const currentClassrooms = currentUser.profile?.enrollments?.map((c) => c.classroom_id) || [];

                if (currentClassrooms.length === 0 && data.enrollments.length > 0) {
                    const enrollmentsData: Omit<Enrollment, "short_id" | "mode">[] = data.enrollments.map((uc) => ({
                        user_id: userId,
                        classroom_id: uc,
                    }));
                    const enrollmentSuccess = await createNewEnrollments({ enrollments: enrollmentsData });
                    if (!enrollmentSuccess) {
                        throw new Error("Failed to create enrollments");
                    }
                } else {
                    // Check if there are any changes (additions or deletions)
                    const deleteClassrooms = currentClassrooms.filter((c) => !data.enrollments.includes(c));
                    const addClassrooms: Omit<Enrollment, "short_id" | "mode">[] = data.enrollments
                        .filter((c) => !currentClassrooms.includes(c))
                        .map((uc) => ({
                            user_id: userId,
                            classroom_id: uc,
                        }));

                    if (deleteClassrooms.length > 0) {
                        const removeSuccess = await removeEnrollmentsByUserAndClassrooms({
                            userId,
                            classroomIds: deleteClassrooms,
                        });
                        if (!removeSuccess) {
                            throw new Error("Failed to remove enrollments");
                        }
                    }
                    if (addClassrooms.length > 0) {
                        const addSuccess = await createNewEnrollments({ enrollments: addClassrooms });
                        if (!addSuccess) {
                            throw new Error("Failed to add enrollments");
                        }
                    }
                }
            }

            showSuccessToast("Usuário atualizado com sucesso!");
        } catch (error) {
            log.error({ err: error, data, userId: currentUser?.id, operation: "handleUserUpdate" });
            throw error;
        }
    };

    const onSubmit = async (data: UserFormData | NewUserFormData) => {
        setLoading(true);

        try {
            if (mode === "new") {
                await handleUserCreation(data);
            } else {
                await handleUserUpdate(data as UserFormData);
            }

            handleOpenChange(false);
        } catch (error) {
            log.error({ err: error, data, mode, operation: "onSubmit" });

            if (error instanceof Error) {
                showErrorToast(error.message, "Verifique os dados e tente novamente.");
            } else {
                showErrorToast(
                    mode === "new" ? "Erro ao criar usuário" : "Erro ao atualizar usuário",
                    "Tente novamente mais tarde.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange} open={isOpen}>
            <DialogTrigger className="w-full!">
                <Button
                    variant={mode === "new" ? "default" : "ghost"}
                    className={cn(
                        "cursor-pointer",
                        mode === "new"
                            ? "px-4! w-max items-start justify-start font-semibold"
                            : "px-2! w-full! h-max items-start justify-start text-start",
                    )}
                >
                    {mode === "new" ? "Adicionar usuário" : "Editar usuário"}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-[45vw]">
                <DialogHeader>
                    <DialogTitle>{mode === "new" ? "Criar Novo Usuário" : "Editar Dados do Usuário"}</DialogTitle>
                    <DialogDescription>
                        {mode === "new"
                            ? "Insira os dados do usuário e seu cargo"
                            : "Modifique os dados do usuário e seu cargo"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={formHandleSubmit(onSubmit)} className="flex gap-4 py-4 w-full h-full overflow-hidden">
                        <div className="flex flex-col gap-4 w-2/3 h-full grow">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Nome</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="text" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">
                                            {mode === "new" ? "Senha" : "Nova senha"}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex justify-between gap-2">
                                                <Input {...field} type="password" />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex justify-center items-center"
                                                    title="Gerar senha aleatória"
                                                    onClick={handleGeneratePassword}
                                                >
                                                    <Sparkles className="size-5" />
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="mx-4" orientation="vertical" />

                        <div className="flex flex-col gap-4 w-1/3 h-full grow">
                            <div className="flex flex-col gap-4">
                                <p className="peer-disabled:opacity-70 font-semibold text-sm text-left leading-none peer-disabled:cursor-not-allowed">
                                    Cargo
                                </p>

                                <div className="flex flex-wrap gap-1 col-span-3">
                                    {userRole && (
                                        <Badge
                                            variant="secondary"
                                            className="flex justify-between gap-2"
                                            onClick={() => handleSetUserRoles(null)}
                                        >
                                            <p className="font-semibold">
                                                {rolesLabelsOptions.find((role) => role.value === userRole)?.label || userRole}
                                            </p>

                                            <X
                                                className="size-3.5! text-destructive hover:text-destructive cursor-pointer!"
                                                strokeWidth={2}
                                            />
                                        </Badge>
                                    )}
                                    {!userRole && (
                                        <BadgeSelector
                                            excludeItens={excludeRoles || []}
                                            label="Adicionar cargo"
                                            value={userRole}
                                            onChange={handleSetUserRoles}
                                            items={rolesLabelsOptions}
                                        />
                                    )}
                                </div>
                            </div>

                            {classrooms && classrooms?.length > 0 && (
                                <div className="flex flex-col gap-4 mt-4">
                                    <p className="peer-disabled:opacity-70 font-semibold text-sm text-left leading-none peer-disabled:cursor-not-allowed">
                                        Turmas
                                    </p>

                                    <div className="flex gap-1 col-span-3">
                                        <ClassroomCombobox
                                            itens={classrooms?.map((c) => ({
                                                label: c.name,
                                                value: c.id,
                                            }))}
                                            value={enrollments}
                                            onChange={(newClassroom) => setValue("enrollments", [...newClassroom])}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </Form>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="font-semibold text-muted-foreground">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={formHandleSubmit(onSubmit)}
                        disabled={loading}
                        className="flex gap-2 font-semibold"
                    >
                        {loading && <LoaderCircle className="size-5 animate-spin" />}
                        {mode === "new" ? "Adicionar Usuário" : "Editar Usuário"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserModalData;
