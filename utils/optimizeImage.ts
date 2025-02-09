import imageCompression from "browser-image-compression";

export const optimizeImage = async (imageFile: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);

    console.log(compressedFile)
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    return false;
  }
};
