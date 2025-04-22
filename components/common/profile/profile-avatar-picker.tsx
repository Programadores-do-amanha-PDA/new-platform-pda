import { Camera, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { AuthUserWithProfileType } from "@/types/auth";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { ChangeEvent, useState } from "react";

import ProfileAvatarCropper from "./profile-avatar-cropper";
import { Area, Point } from "react-easy-crop";
import {
  deleteUserAvatar,
  updateUserAvatar,
  uploadUserAvatar,
} from "@/app/actions/profile_avatar";
import { toast } from "sonner";
import { Button } from "../../ui/button";

export const ProfileAvatarPicker = ({
  user,
  onUpdateUser,
}: {
  user: AuthUserWithProfileType;
  onUpdateUser: () => void;
}) => {
  const [newProfileImage, setNewProfileImage] = useState<string>("");
  const [croppedProfileImage, setCroppedProfileImage] = useState<File | null>();

  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const [loading, setLoading] = useState<boolean>(false);

  const handleCloseCropper = () => {
    setIsCropperOpen(false);
    setCroppedProfileImage(null);
    setNewProfileImage("");
  };

  const handleCreateProfileImage = (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        setNewProfileImage(imageDataUrl);
        setIsCropperOpen(true);
      };

      reader.readAsDataURL(imageFile);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      console.log(url);
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  async function getCroppedImg(imageSrc: string, pixelCrop: Area) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx?.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }

  const onCropComplete = async (_: Area, croppedAreaPixels: Area) => {
    const blob = await getCroppedImg(newProfileImage, croppedAreaPixels);
    if (blob instanceof Blob) {
      const file = new File([blob], "cropped-image.png", { type: "image/png" });
      setCroppedProfileImage(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadAvatar = async () => {
    setLoading(true);
    try {
      if (!croppedProfileImage || !user.id) {
        throw new Error("cropped profile image and user id is required");
      }
      if (user.profile?.avatarUrl) {
        console.log("update");
        const base64Image = await fileToBase64(croppedProfileImage);
        await updateUserAvatar(user.id, base64Image);

        onUpdateUser();
        toast.success("Imagem de perfil atualizada com sucesso!");
      } else if (!user.profile?.avatarUrl) {
        const base64Image = await fileToBase64(croppedProfileImage);
        await uploadUserAvatar(user.id, base64Image);

        onUpdateUser();
        toast.success("Imagem de perfil adicionada com sucesso!");
      }
    } catch (error) {
      console.error("Error uploading avatar", error);
      toast.error(
        "Erro ao realizar ao salvar a imagem. Tente novamente mais tarde!"
      );
    } finally {
      setLoading(false);
      handleCloseCropper();
    }
  };

  const handleDeleteAvatar = async () => {
    setLoading(true);
    try {
      if (!user.id) {
        throw new Error("user id is required");
      }
      await deleteUserAvatar(user.id);

      onUpdateUser();
      toast.success("Imagem de perfil removida com sucesso!");
    } catch (error) {
      console.error("Error deleting avatar", error);
      toast.error(
        "Erro ao realizar ao remover a imagem. Tente novamente mais tarde!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-6">
        <Input
          id="profile_image"
          onChange={handleCreateProfileImage}
          type="file"
          accept="image/*"
          className="hidden"
        />

        <Avatar className="size-28">
          <AvatarImage src={user.profile?.avatarUrl || ""} alt="" />
          <AvatarFallback>
            {user.profile?.full_name
              ?.split(" ")
              .slice(0, 3)
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-4">
          <Label
            htmlFor="profile_image"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer"
          >
            <Camera className="!size-5 !stroke-2 stroke-primary-foreground" />
            {user.profile?.avatarUrl ? "Editar" : "Adicionar"}
          </Label>
          {user.profile?.avatarUrl && (
            <Button variant="destructive" onClick={handleDeleteAvatar}>
              <Trash className="!size-5 !stroke-2" />
              Deletar
            </Button>
          )}
        </div>
      </div>
      <ProfileAvatarCropper
        isOpen={isCropperOpen}
        onClose={handleCloseCropper}
        loading={loading}
        src={newProfileImage}
        crop={crop}
        onCropChange={setCrop}
        zoom={scale}
        onZoomChange={setScale}
        onCropComplete={onCropComplete}
        handleUploadAvatar={handleUploadAvatar}
      />
    </>
  );
};
