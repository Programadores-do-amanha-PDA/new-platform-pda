import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserAttributes, UserMetadata } from "@supabase/supabase-js";
import { updateAuthUser } from "@/app/actions/auth";
import { ProfileAvatarPicker } from "./profile-avatar-picker";
import { AuthUserWithProfileT } from "@/types/auth";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { rolesLabelsOptions } from "@/utils/user-roles-labels";
import { Button } from "@/components/ui/button";

const ProfileDataTabs = ({
  currentUser,
  onUpdateUser,
}: {
  currentUser: AuthUserWithProfileT;
  onUpdateUser: () => void;
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFullName(currentUser.profile?.full_name || "");
    setEmail(currentUser.email || "");
    setBio(currentUser.profile?.bio || "");
  }, [currentUser]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const fullNameRegex = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/gm;
      const emailRegex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:'",.<>?/~`-]{7,}$/;

      if (!fullName && !email) throw "fill the fields";
      if (
        fullName !== currentUser.profile?.full_name &&
        !fullNameRegex.test(fullName)
      )
        throw "Invalid full name";
      if (email !== currentUser.email && !emailRegex.test(email))
        throw "Invalid email";

      if (
        newPassword.length > 0 &&
        confirmNewPassword.length > 0 &&
        (newPassword !== confirmNewPassword ||
          (!passwordRegex.test(newPassword) &&
            !passwordRegex.test(confirmNewPassword)))
      )
        throw "Invalid password";
      if (bio !== currentUser.profile?.bio && bio.length > 190)
        throw "Invalid bio";

      const userData: Partial<UserAttributes & { password: string }> = {};

      if (email !== currentUser.email) {
        userData.email = email;
      }

      if (
        newPassword === confirmNewPassword &&
        newPassword.length > 0 &&
        confirmNewPassword.length > 0
      ) {
        userData.password = newPassword;
      }

      const userMetadata: UserMetadata = {};
      if (fullName !== currentUser.profile?.full_name) {
        userMetadata.full_name = fullName;
      }
      if (bio && bio !== currentUser.profile?.bio) {
        userMetadata.bio = bio;
      }

      if (email !== currentUser.email) {
        userMetadata.user_email = email;
      }

      if (Object.keys(userMetadata).length > 0) {
        userData.data = userMetadata;
      }

      const userUpdateResponse = await updateAuthUser(userData);
      if (!userUpdateResponse || !userUpdateResponse.user.id)
        throw "no edit user response";

      toast.success("Sucesso ao editar seus dados!");
      if (email !== currentUser.email) {
        toast.info(
          "Para concluir a troca de E-mail confirme a troca usando o email atual ou o novo e-mail!"
        );
      }
      onUpdateUser();

      setLoading(false);
    } catch (error) {
      console.error(error);
      switch (error) {
        case "fill the fields":
          toast.error("Por favor preencha todos os campos!");
          break;

        case "Invalid full name":
          toast.error("Nome completo inválido!");
          break;

        case "Invalid email":
          toast.error("E-mail inválido!");
          break;

        case "Invalid email":
          toast.error("Senha inválida!");
          break;

        case "Invalid bio":
          toast.error(
            "Bio inválida! A biografia não pode exceder 190 caracteres."
          );
          break;

        case "no edit user response":
          toast.error("Erro ao editar seus dados! Tente novamente mais tarde.");
          break;

        default:
          toast.error(
            "Erro ao atualizar seus dados! Tente novamente mais tarde."
          );
          break;
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between">
      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        onSubmit={(e) => e.preventDefault()}
      >
        <ProfileAvatarPicker user={currentUser} onUpdateUser={onUpdateUser} />
        <Separator className="col-span-1 lg:col-span-2" />
        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="name" className="text-left font-semibold text-base">
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-rows-[20px_1fr] items-center gap-4">
          <Label
            htmlFor="bio"
            className="row-span-1 w-full flex justify-between items-center"
          >
            <p className="w-max font-semibold text-base">Biografia</p>
            <p className="w-max text-sm">{bio.length}/190</p>
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="row-span-1 resize-none"
          />
        </div>

        <Separator className="col-span-1 lg:col-span-2" />

        <div className="col-span-1 lg:col-span-2">
          <p className="text-left h-max font-semibold text-base">
            Alterar email
          </p>
          <span className="text-sm text-muted-foreground">
            Para concluir a alteração de email você deve verificar sua caixa de
            entrada do email atual ou do novo email e aceitar a troca.
          </span>
        </div>

        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="email" className="text-left h-max font-semibold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-3"
          />
        </div>

        <Separator className="col-span-1 lg:col-span-2" />

        <div className="col-span-1 lg:col-span-2">
          <p className="text-left h-max font-semibold text-base">
            Alterar senha
          </p>
          <span className="text-sm text-muted-foreground">
            A senha precisa ter um mínimo de 7 caracteres, incluindo letras
            minúsculas, letras maiúsculas, números e caracteres especiais.
          </span>
        </div>

        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="password" className="text-left h-max font-semibold">
            Nova senha
          </Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-rows-[20px_1fr] items-center gap-4">
          <Label htmlFor="password" className="text-left h-max font-semibold">
            Confirme nova senha
          </Label>
          <Input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="col-span-3"
          />
        </div>

        <Separator className="col-span-1 lg:col-span-2" />
        <div className="grid grid-rows-2 items-center gap-4">
          <Label className="font-semibold text-base">Seus cargos</Label>

          <div className="col-span-3 flex gap-1">
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
      </form>

      <Button
        type="button"
        onClick={() => (!loading ? handleSubmit() : null)}
        className="gap-2 flex font-semibold w-max self-end"
      >
        {loading && <LoaderCircle className="size-5 animate-spin" />}
        {loading ? "Salvando mudanças" : "Salvar mudanças"}
      </Button>
    </div>
  );
};

export default ProfileDataTabs;
