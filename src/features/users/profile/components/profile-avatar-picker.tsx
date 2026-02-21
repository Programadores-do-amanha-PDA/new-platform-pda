"use client";

// Global imports
import { Camera, Trash } from "lucide-react";
import { ChangeEvent, useReducer } from "react";
import { Area, Point } from "react-easy-crop";
import { sileo } from "sileo";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { deleteUserAvatar, updateUserAvatar, uploadUserAvatar } from "@/features/users/profile/actions/profile-avatar";
import { getFirstLastInitials } from "@/utils/get-first-last-initials";
import { ProfileAvatarPickerPropsT } from "../types/profile-avatar-picker";
import { getCroppedImageBlob, fileToBase64 } from "../utils/avatar-utils";
import { ProfileAvatarCropper } from "./profile-avatar-cropper";
import { logger } from "@/lib/logger";

interface AvatarPickerState {
    newProfileImage: string;
    croppedProfileImage: File | null;
    isCropperOpen: boolean;
    crop: Point;
    scale: number;
    loading: boolean;
}

const log = logger.child({ module: "ProfileAvatarPicker" });

type AvatarPickerAction =
    | { type: "SET_NEW_IMAGE"; payload: string }
    | { type: "SET_CROPPED_IMAGE"; payload: File | null }
    | { type: "SET_CROP"; payload: Point }
    | { type: "SET_SCALE"; payload: number }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "RESET_CROPPER" };

const initialState: AvatarPickerState = {
    newProfileImage: "",
    croppedProfileImage: null,
    isCropperOpen: false,
    crop: { x: 0, y: 0 },
    scale: 1,
    loading: false,
};

function avatarPickerReducer(state: AvatarPickerState, action: AvatarPickerAction): AvatarPickerState {
    switch (action.type) {
        case "SET_NEW_IMAGE":
            return { ...state, newProfileImage: action.payload, isCropperOpen: true };
        case "SET_CROPPED_IMAGE":
            return { ...state, croppedProfileImage: action.payload };
        case "SET_CROP":
            return { ...state, crop: action.payload };
        case "SET_SCALE":
            return { ...state, scale: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "RESET_CROPPER":
            return { ...state, isCropperOpen: false, croppedProfileImage: null, newProfileImage: "" };
        default:
            return state;
    }
}

export const ProfileAvatarPicker = ({ userProfile, onUpdateUser }: ProfileAvatarPickerPropsT): React.JSX.Element => {
    const [state, dispatch] = useReducer(avatarPickerReducer, initialState);
    const { newProfileImage, croppedProfileImage, isCropperOpen, crop, scale, loading } = state;

    const handleCloseCropper = (): void => {
        dispatch({ type: "RESET_CROPPER" });
    };

    const handleCreateProfileImage = (e: ChangeEvent<HTMLInputElement>): void => {
        const imageFile = e.target.files?.[0];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event): void => {
                const imageDataUrl = event.target?.result as string;
                dispatch({ type: "SET_NEW_IMAGE", payload: imageDataUrl });
            };

            reader.readAsDataURL(imageFile);
        }
    };

    const onCropComplete = async (_: Area, croppedAreaPixels: Area): Promise<void> => {
        try {
            const blob = await getCroppedImageBlob({ imageSrc: newProfileImage, pixelCrop: croppedAreaPixels });
            if (blob instanceof Blob) {
                const file = new File([blob], "cropped-image.png", {
                    type: "image/png",
                });
                dispatch({ type: "SET_CROPPED_IMAGE", payload: file });
            }
        } catch (error) {
            log.error({ err: error, operation: "crop_image" }, "Error cropping image");
            sileo.error({
                title: "Erro ao processar a imagem",
                description: "Tente novamente.",
                position: "top-right",
            });
        }
    };

    const handleUploadAvatar = async (): Promise<void> => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const userId = userProfile?.id;
            if (!croppedProfileImage || !userId) {
                throw new Error("Imagem cortada e ID do usuário são obrigatórios");
            }

            const base64Image = await fileToBase64(croppedProfileImage);

            if (userProfile?.avatar_url) {
                await updateUserAvatar(userId, base64Image);
                sileo.success({
                    title: "Imagem de perfil atualizada com sucesso!",
                    position: "top-right",
                });
            } else {
                await uploadUserAvatar(userId, base64Image);
                sileo.success({
                    title: "Imagem de perfil adicionada com sucesso!",
                    position: "top-right",
                });
            }

            onUpdateUser();
        } catch (error) {
            log.error({ err: error, operation: "upload_avatar" }, "Error uploading avatar");
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao salvar a imagem. Tente novamente mais tarde!";
            sileo.error({
                title: errorMessage,
                position: "top-right",
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
            handleCloseCropper();
        }
    };

    const handleDeleteAvatar = async (): Promise<void> => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            if (!userProfile.id) {
                throw new Error("ID do usuário é obrigatório");
            }

            const success = await deleteUserAvatar(userProfile.id);

            if (!success) {
                throw new Error("Falha ao remover a imagem");
            }

            onUpdateUser();
            sileo.success({
                title: "Imagem de perfil removida com sucesso!",
                position: "top-right",
            });
        } catch (error) {
            log.error({ err: error, operation: "delete_avatar" }, "Error deleting avatar");
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao remover a imagem. Tente novamente mais tarde!";
            sileo.error({
                title: errorMessage,
                position: "top-right",
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("profile_image")?.click();
        }
    };

    const userInitials = getFirstLastInitials(userProfile?.full_name || "Usuário");

    const avatarAltText = `${userProfile?.full_name || "Usuário"} - foto de perfil`;

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
                    <AvatarImage src={userProfile?.avatar_url || ""} alt={avatarAltText} />
                    <AvatarFallback aria-label="Iniciais do usuário">{userInitials}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-4">
                    <Label
                        htmlFor="profile_image"
                        className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-sm px-4 py-2 rounded-md focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring h-9 [&_svg]:size-4 font-medium text-primary-foreground text-sm whitespace-nowrap transition-colors cursor-pointer [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0"
                        role="button"
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        aria-label={userProfile?.avatar_url ? "Editar foto de perfil" : "Adicionar foto de perfil"}
                    >
                        <Camera className="stroke-2! stroke-primary-foreground size-5!" />
                        {userProfile?.avatar_url ? "Editar" : "Adicionar"}
                    </Label>

                    {userProfile?.avatar_url && (
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
                onCropChange={(point) => dispatch({ type: "SET_CROP", payload: point })}
                zoom={scale}
                onZoomChange={(zoom) => dispatch({ type: "SET_SCALE", payload: zoom })}
                onCropComplete={onCropComplete}
                handleUploadAvatar={handleUploadAvatar}
            />
        </>
    );
};
