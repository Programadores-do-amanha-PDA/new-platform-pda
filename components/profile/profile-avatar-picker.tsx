import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AuthUserWithProfileType } from "@/types/auth";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ChangeEvent, useState } from "react";

import ProfileAvatarCropper from "./profile-avatar-cropper";
import { Area, Point } from "react-easy-crop";
import { uploadAvatar } from "@/utils/supabase/actions/user_avatar";
import { toast } from "sonner";

export const ProfileAvatarPicker = ({
  user,
}: {
  user: AuthUserWithProfileType;
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
      if (!croppedProfileImage || !user.id)
        throw new Error("cropped profile image and user id is required");
      const base64Image = await fileToBase64(croppedProfileImage);
      await uploadAvatar(user.id, base64Image);
      toast.success("Imagem de perfil adicionada com sucesso!");
      handleCloseCropper();
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

  return (
    <div className="relative">
      <Avatar className="size-28">
        <AvatarImage src="" alt="@shadcn" />
        <AvatarFallback>
          {user.profile?.full_name
            ?.split(" ")
            .slice(0, 3)
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <Label
        htmlFor="profile_image"
        className="absolute bottom-0 right-0 size-max rounded-full p-2 z-10 !bg-primary/70 flex items-center justify-center cursor-pointer"
      >
        <Camera className="!size-5 !stroke-2 stroke-primary-foreground" />
      </Label>
      <Input
        id="profile_image"
        onChange={handleCreateProfileImage}
        type="file"
        accept="image/*"
        className="hidden"
      />
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
    </div>
  );
};
