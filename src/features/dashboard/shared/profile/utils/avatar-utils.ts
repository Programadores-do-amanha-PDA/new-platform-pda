import { logger } from "@/lib/logger";
import { Area } from "react-easy-crop";

const log = logger.child({ module: "avatar-utils" });

export const createImageFromUrl = (url: string): Promise<HTMLImageElement> => {
    try {
        if (!url) throw new Error("Invalid URL");

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, url, operation: "createImageFromUrl" }, "Error creating image from URL");
        }
        return Promise.reject(error);
    }
};

export const getCroppedImageBlob = async ({
    imageSrc,
    pixelCrop,
}: {
    imageSrc: string;
    pixelCrop: Area;
}): Promise<Blob | null> => {
    try {
        if (!imageSrc || !pixelCrop) throw new Error("Invalid image source or pixel crop");

        const image = await createImageFromUrl(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Could not get canvas context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, props: { imageSrc, pixelCrop }, operation: "getCroppedImageBlob" }, "Error cropping image");
        }
        return null;
    }
};

export const fileToBase64 = (file: File): Promise<string> => {
    try {
        if (!file) throw new Error("Invalid file");

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, fileName: file.name, operation: "fileToBase64" }, "Error converting file to base64");
        }

        return Promise.reject(error);
    }
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    try {
        if (!blob) {
            throw new Error("Invalid blob");
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    } catch (error) {
        if (error instanceof Error) {
            log.error({ err: error, operation: "blobToBase64" }, "Error converting blob to base64");
        }

        return Promise.reject(error);
    }
};
