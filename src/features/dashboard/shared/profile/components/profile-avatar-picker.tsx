"use client";

// Global imports
import { Camera, Trash } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Area, Point } from "react-easy-crop";
import { toast } from "sonner";

// UI Components
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Local imports
import { ProfileAvatarCropper } from "./";
import { ProfileAvatarPickerPropsT } from "../types";
import { getCroppedImageBlob, fileToBase64 } from "../utils";
import { deleteUserAvatar, updateUserAvatar, uploadUserAvatar } from "@/actions/profile-avatar";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";

export const ProfileAvatarPicker = ({ user, onUpdateUser }: ProfileAvatarPickerPropsT): React.JSX.Element => {
    const [newProfileImage, setNewProfileImage] = useState<string>("");
    const [croppedProfileImage, setCroppedProfileImage] = useState<File | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [scale, setScale] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const handleCloseCropper = (): void => {
        setIsCropperOpen(false);
        setCroppedProfileImage(null);
        setNewProfileImage("");
    };

    const handleCreateProfileImage = (e: ChangeEvent<HTMLInputElement>): void => {
        const imageFile = e.target.files?.[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event): void => {
                const imageDataUrl = event.target?.result as string;
                setNewProfileImage(imageDataUrl);
                setIsCropperOpen(true);
            };

            reader.readAsDataURL(imageFile);
        }
    };

    const onCropComplete = async (_: Area, croppedAreaPixels: Area): Promise<void> => {
        try {
            const blob = await getCroppedImageBlob(newProfileImage, croppedAreaPixels);
            if (blob instanceof Blob) {
                const file = new File([blob], "cropped-image.png", {
                    type: "image/png",
                });
                setCroppedProfileImage(file);
            }
        } catch (error) {
            console.error("Error cropping image:", error);
            toast.error("Erro ao processar a imagem. Tente novamente.");
        }
    };

    const handleUploadAvatar = async (): Promise<void> => {
        setLoading(true);
        try {
            if (!croppedProfileImage || !user.id) {
                throw new Error("Imagem cortada e ID do usuário são obrigatórios");
            }

            const base64Image = await fileToBase64(croppedProfileImage);

            if (user.profile?.avatar_url) {
                await updateUserAvatar(user.id, base64Image);
                toast.success("Imagem de perfil atualizada com sucesso!");
            } else {
                await uploadUserAvatar(user.id, base64Image);
                toast.success("Imagem de perfil adicionada com sucesso!");
            }

            onUpdateUser();
        } catch (error) {
            console.error("Error uploading avatar:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao salvar a imagem. Tente novamente mais tarde!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            handleCloseCropper();
        }
    };

    const handleDeleteAvatar = async (): Promise<void> => {
        setLoading(true);
        try {
            if (!user.id) {
                throw new Error("ID do usuário é obrigatório");
            }

            const success = await deleteUserAvatar(user.id);

            if (!success) {
                throw new Error("Falha ao remover a imagem");
            }

            onUpdateUser();
            toast.success("Imagem de perfil removida com sucesso!");
        } catch (error) {
            console.error("Error deleting avatar:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao remover a imagem. Tente novamente mais tarde!";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("profile_image")?.click();
        }
    };

    const userInitials = getFirstLastInitials(user.profile?.full_name || "Usuário");

    const avatarAltText = `${user.profile?.full_name || "Usuário"} - foto de perfil`;

    return (
        <>
            <div className="flex items-center gap-6">
                <Input
                    id="profile_image"
                    onChange={handleCreateProfileImage}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Selecionar imagem de perfil"
                />

                <Avatar className="size-28" role="img" aria-label="Foto de perfil">
                    <AvatarImage src={user.profile?.avatar_url || ""} alt={avatarAltText} />
                    <AvatarFallback aria-label="Iniciais do usuário">{userInitials}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-4">
                    <Label
                        htmlFor="profile_image"
                        className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-sm px-4 py-2 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring h-9 [&_svg]:size-4 font-medium text-primary-foreground text-sm whitespace-nowrap transition-colors cursor-pointer [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0"
                        role="button"
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        aria-label={user.profile?.avatar_url ? "Editar foto de perfil" : "Adicionar foto de perfil"}
                    >
                        <Camera className="stroke-2! stroke-primary-foreground size-5!" />
                        {user.profile?.avatar_url ? "Editar" : "Adicionar"}
                    </Label>

                    {user.profile?.avatar_url && (
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAvatar}
                            disabled={loading}
                            aria-label="Deletar foto de perfil"
                        >
                            <Trash className="stroke-2! size-5!" />
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
