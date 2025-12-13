"use client";

// Global imports
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

// UI components
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Local imports
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import { updateAuthUser } from "@/actions";
import { ProfileAvatarPicker } from "./profile-avatar-picker";
import { ProfileDataTabsPropsT, ProfileFormSchemaT } from "../types";
import {
  profileFormSchema,
  buildUserUpdateData,
  isEmailChanged,
} from "../utils";

export const ProfileDataTabs = ({
  currentUser,
  onUpdateUser,
}: ProfileDataTabsPropsT): React.JSX.Element => {
  const form = useForm<ProfileFormSchemaT>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      newPassword: "",
      confirmNewPassword: "",
      bio: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
    setError,
  } = form;

  const currentBio = watch("bio");

  useEffect(() => {
    setValue("fullName", currentUser.profile?.full_name || "");
    setValue("email", currentUser.email || "");
    setValue("bio", currentUser.profile?.bio || "");
  }, [currentUser, setValue]);

  const onSubmit = async (data: ProfileFormSchemaT): Promise<void> => {
    try {
      const userData = buildUserUpdateData(data, currentUser);

      if (Object.keys(userData).length === 0) {
        toast.info("Nenhuma alteração foi feita.");
        return;
      }

      const userUpdateResponse = await updateAuthUser(userData);

      if (
        !userUpdateResponse ||
        typeof userUpdateResponse === "boolean" ||
        !userUpdateResponse.user?.id
      ) {
        throw new Error("Falha ao atualizar dados do usuário");
      }

      toast.success("Sucesso ao editar seus dados!");

      if (isEmailChanged(data.email, currentUser.email)) {
        toast.info(
          "Para concluir a troca de E-mail confirme a troca usando o email atual ou o novo e-mail!"
        );
      }

      onUpdateUser();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar seus dados! Tente novamente mais tarde.";

      toast.error(errorMessage);
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="flex flex-col justify-between w-full">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="gap-8 grid grid-cols-1 lg:grid-cols-2"
        >
          <ProfileAvatarPicker user={currentUser} onUpdateUser={onUpdateUser} />
          <Separator className="col-span-1 lg:col-span-2" />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="items-center gap-4 grid grid-rows-[20px_1fr]">
                <FormLabel className="font-semibold text-base text-left">
                  Nome completo
                </FormLabel>
                <FormControl>
                  <Input type="text" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 lg:col-span-2">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="items-center gap-4 grid grid-rows-[20px_1fr]">
                  <FormLabel className="flex justify-between items-center row-span-1 w-full">
                    <span className="w-max font-semibold text-base">
                      Biografia
                    </span>
                    <span className="w-max text-sm">
                      {(currentBio || "").length}/190
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      className="row-span-1 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="col-span-1 lg:col-span-2" />

          <div className="col-span-1 lg:col-span-2">
            <p className="h-max font-semibold text-base text-left">
              Alterar email
            </p>
            <span className="text-muted-foreground text-sm">
              Para concluir a alteração de email você deve verificar sua caixa
              de entrada do email atual ou do novo email e aceitar a troca.
            </span>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="items-center gap-4 grid grid-rows-[20px_1fr]">
                <FormLabel className="h-max font-semibold text-left">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={isSubmitting}
                    className="col-span-3"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-1 lg:col-span-2" />

          <div className="col-span-1 lg:col-span-2">
            <p className="h-max font-semibold text-base text-left">
              Alterar senha
            </p>
            <span className="text-muted-foreground text-sm">
              A senha precisa ter um mínimo de 7 caracteres, incluindo letras
              minúsculas, letras maiúsculas, números e caracteres especiais.
            </span>
          </div>

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="items-center gap-4 grid grid-rows-[20px_1fr]">
                <FormLabel className="h-max font-semibold text-left">
                  Nova senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isSubmitting}
                    className="col-span-3"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="items-center gap-4 grid grid-rows-[20px_1fr]">
                <FormLabel className="h-max font-semibold text-left">
                  Confirme nova senha
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isSubmitting}
                    className="col-span-3"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="col-span-1 lg:col-span-2" />

          <div className="items-center gap-4 grid grid-rows-2">
            <Label className="font-semibold text-base">Seus cargos</Label>
            <div className="flex gap-1 col-span-3">
              {currentUser.profile?.user_roles?.map((r, i) => (
                <Badge variant="default" key={i}>
                  {
                    rolesLabelsOptions.find((role) => role.value === r.role)
                      ?.label
                  }
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex self-end gap-2 col-span-1 lg:col-span-2 w-max font-semibold"
          >
            {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
            {isSubmitting ? "Salvando mudanças" : "Salvar mudanças"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
