// Global imports
import React from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { ImageUpscale } from "lucide-react";

//  UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";

export const ProfileAvatarCropper = ({
  isOpen,
  onClose,
  src,
  crop,
  onCropChange,
  loading,
  zoom,
  onZoomChange,
  onCropComplete,
  handleUploadAvatar,
}: {
  src: string;
  onClose: () => void;
  crop: Point;
  onCropChange: (c: Point) => void;
  isOpen: boolean;
  loading: boolean;
  zoom: number;
  onZoomChange: (value: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  handleUploadAvatar: () => void;
}) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => (!open ? onClose() : null)}
    >
      <AlertDialogContent className="w-max">
        <AlertDialogHeader>
          <AlertDialogTitle>Ajuste de Imagem</AlertDialogTitle>
          <AlertDialogDescription>
            Ajuste o zoom e a posição de corte de sua imagem de perfil!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center justify-center rounded-lg overflow-hidden bg-card border">
          <div className="w-96 h-96 relative">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={3 / 3}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex w-full gap-4 p-4">
            <ImageUpscale className="stroke-primary" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onValueChange={(value) => onZoomChange(value[0])}
              className="slider"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {!loading && (
            <AlertDialogAction
              className="font-semibold"
              onClick={handleUploadAvatar}
            >
              Aplicar
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
