import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  LoaderCircle,
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { UserMetadata } from "@supabase/supabase-js";
import { DialogClose } from "@radix-ui/react-dialog";
import { ClassroomCombobox } from "./classroom-combobox";
import { AuthUserWithProfileT, RolesT, UserClassroomT } from "@/types/auth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import BadgeSelector from "@/components/shared/badge-selector";
import { generateRandomPassword } from "@/utils/password-generator";
import {
  userFormSchema,
  newUserFormSchema,
  UserFormData,
  NewUserFormData,
} from "../schemas/user-form-schema";
import { useUsersCombinedStore } from "@/stores/modules/users/users-combined-store";
import { cn } from "@/lib/utils";
import { useClassroomStore } from "../../classrooms/stores/classrooms";

type UserSheetDataProps = {
  mode: "new" | "edit";
  currentUser?: Partial<AuthUserWithProfileT>;
  excludeRoles?: RolesT[];
};

const UserSheetData = ({
  mode,
  currentUser,
  excludeRoles,
}: UserSheetDataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { classrooms } = useClassroomStore();
  const {
    createNewUser,
    updateUser,
    createUserClassrooms,
    deleteUserClassroom,
    addUserRole,
    updateUserRole,
    deleteUserRole,
  } = useUsersCombinedStore();

  const form = useForm({
    resolver: zodResolver(mode === "new" ? newUserFormSchema : userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      userRoles: [],
      userClassrooms: [],
    },
  });

  const { watch, setValue, reset, handleSubmit: formHandleSubmit } = form;
  const userRoles = watch("userRoles");
  const userClassrooms = watch("userClassrooms");

  useEffect(() => {
    if (mode === "edit" && isOpen && currentUser) {
      reset({
        fullName: currentUser.profile?.full_name || "",
        email: currentUser.email || "",
        password: "",
        userRoles:
          currentUser.profile?.user_roles?.map((role) => role.role) || [],
        userClassrooms:
          classrooms && classrooms.length > 0
            ? currentUser.profile?.classrooms?.map((c) => c.classroom_id) || []
            : [],
      });
    } else if (mode === "new" && isOpen) {
      reset({
        fullName: "",
        email: "",
        password: "",
        userRoles: [],
        userClassrooms: [],
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
      setValue("userRoles", []);
      return;
    }

    const currentRoles = userRoles || [];
    if (!currentRoles.includes(newRole as RolesT)) {
      setValue("userRoles", [...currentRoles, newRole as RolesT]);
    } else {
      setValue(
        "userRoles",
        currentRoles.filter((role) => role !== (newRole as RolesT))
      );
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
    const userData: Partial<AuthUserWithProfileT & { password: string }> = {
      email: data.email,
      password: data.password,
      user_metadata: {
        full_name: data.fullName,
        user_email: data.email,
      },
    };

    const userCreatedId = await createNewUser(userData);
    if (!userCreatedId) {
      throw new Error("Falha ao criar usuário");
    }

    // Handle roles
    if (data.userRoles.length > 0) {
      try {
        const role = data.userRoles[0] as RolesT;
        const roleSuccess = await addUserRole(userCreatedId, role);
        if (!roleSuccess) {
          throw new Error("Falha ao atribuir cargo");
        }
      } catch {
        throw new Error("Erro ao atribuir cargo ao usuário");
      }
    }

    // Handle classrooms
    if (
      classrooms &&
      classrooms.length > 0 &&
      createUserClassrooms &&
      data.userClassrooms.length > 0
    ) {
      try {
        const uClassroom: UserClassroomT[] = data.userClassrooms.map((id) => ({
          user_id: userCreatedId,
          classroom_id: id,
        }));
        const classroomSuccess = await createUserClassrooms(uClassroom);
        if (!classroomSuccess) {
          throw new Error("Falha ao associar turmas");
        }
      } catch {
        throw new Error("Erro ao associar usuário às turmas");
      }
    }

    showSuccessToast(
      "Usuário criado com sucesso!",
      "O novo usuário foi adicionado ao sistema."
    );
  };

  const handleUserUpdate = async (data: UserFormData) => {
    if (!currentUser?.id) {
      throw new Error("ID do usuário não encontrado");
    }

    const userId = currentUser.id;
    const updateData: Partial<AuthUserWithProfileT & { password: string }> = {};
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
      const userUpdateResponse = await updateUser(userId, updateData);
      if (!userUpdateResponse) {
        throw new Error("Falha ao atualizar dados do usuário");
      }
    }

    // Handle role updates
    const currentUserRoles =
      currentUser?.profile?.user_roles?.map((r) => r.role) || [];

    if (currentUserRoles.length === 0 && data.userRoles.length === 1) {
      const roleSuccess = await addUserRole(
        userId,
        data.userRoles[0] as RolesT
      );
      if (!roleSuccess) throw new Error("Erro ao atribuir cargo");
    } else if (
      currentUserRoles.length === 1 &&
      data.userRoles.length === 1 &&
      !currentUserRoles.includes(data.userRoles[0] as RolesT)
    ) {
      const roleSuccess = await updateUserRole(
        userId,
        data.userRoles[0] as RolesT
      );
      if (!roleSuccess) throw new Error("Erro ao atualizar cargo");
    } else if (currentUserRoles.length === 1 && data.userRoles.length === 0) {
      const roleSuccess = await deleteUserRole(userId);
      if (!roleSuccess) throw new Error("Erro ao remover cargo");
    }

    // Handle classroom updates
    if (
      classrooms &&
      classrooms.length > 0 &&
      createUserClassrooms &&
      deleteUserClassroom
    ) {
      const currentClassrooms =
        currentUser.profile?.classrooms?.map((c) => c.classroom_id) || [];

      if (currentClassrooms.length === 0 && data.userClassrooms.length > 0) {
        const uClassroom: UserClassroomT[] = data.userClassrooms.map((uc) => ({
          user_id: userId,
          classroom_id: uc,
        }));
        await createUserClassrooms(uClassroom);
      } else if (
        !currentClassrooms.every((c) => data.userClassrooms.includes(c))
      ) {
        const deleteClassrooms = currentClassrooms.filter(
          (c) => !data.userClassrooms.includes(c)
        );
        const addClassrooms: UserClassroomT[] = data.userClassrooms
          .filter((c) => !currentClassrooms.includes(c))
          .map((uc) => ({
            user_id: userId,
            classroom_id: uc,
          }));

        if (deleteClassrooms.length > 0) {
          await deleteUserClassroom(userId, deleteClassrooms);
        }
        if (addClassrooms.length > 0) {
          await createUserClassrooms(addClassrooms);
        }
      }
    }

    showSuccessToast(
      "Usuário atualizado com sucesso!",
      "As alterações foram salvas no sistema."
    );
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
      console.error("Form submission error:", error);

      if (error instanceof Error) {
        showErrorToast(error.message, "Verifique os dados e tente novamente.");
      } else {
        showErrorToast(
          mode === "new"
            ? "Erro ao criar usuário"
            : "Erro ao atualizar usuário",
          "Tente novamente mais tarde."
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
              : "px-2! w-full! h-max items-start justify-start text-start"
          )}
        >
          {mode === "new" ? "Adicionar usuário" : "Editar usuário"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[45vw] w-full">
        <DialogHeader>
          <DialogTitle>
            {mode === "new" ? "Criar Novo Usuário" : "Editar Dados do Usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "new"
              ? "Insira os dados do usuário e seu cargo"
              : "Modifique os dados do usuário e seu cargo"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={formHandleSubmit(onSubmit)}
            className="w-full h-full flex gap-4 py-4 overflow-hidden"
          >
            <div className="w-2/3 h-full flex flex-col gap-4 grow">
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
                          className="flex items-center justify-center"
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

            <div className="w-1/3 h-full flex flex-col gap-4 grow">
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
                  Cargo
                </p>

                <div className="col-span-3 flex gap-1 flex-wrap">
                  {userRoles &&
                    userRoles.map((r, i) => (
                      <Badge
                        variant="secondary"
                        key={i}
                        className="flex justify-between gap-2"
                        onClick={() => handleSetUserRoles(null)}
                      >
                        <p className="font-semibold">
                          {rolesLabelsOptions.find((role) => role.value === r)
                            ?.label || r}
                        </p>

                        <X
                          className="size-3.5! text-destructive hover:text-destructive !cursor-pointer"
                          strokeWidth={2}
                        />
                      </Badge>
                    ))}
                  {userRoles &&
                    userRoles.length < 1 &&
                    rolesLabelsOptions.filter(
                      (role) => !userRoles.includes(role.value)
                    ).length > 0 && (
                      <BadgeSelector
                        excludeItens={userRoles.concat(excludeRoles || [])}
                        label="Adicionar cargo"
                        value={userRoles[0]}
                        onChange={handleSetUserRoles}
                        items={rolesLabelsOptions}
                      />
                    )}
                </div>
              </div>

              {classrooms && classrooms?.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                  <p className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left">
                    Turmas
                  </p>

                  <div className="col-span-3 flex gap-1">
                    <ClassroomCombobox
                      itens={classrooms?.map((c) => ({
                        label: c.name,
                        value: c.id,
                      }))}
                      value={userClassrooms}
                      onChange={(newClassroom) =>
                        setValue("userClassrooms", [...newClassroom])
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="text-muted-foreground font-semibold"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={formHandleSubmit(onSubmit)}
            disabled={loading}
            className="gap-2 flex font-semibold"
          >
            {loading && <LoaderCircle className="size-5 animate-spin" />}
            {mode === "new" ? "Adicionar Usuário" : "Editar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSheetData;
