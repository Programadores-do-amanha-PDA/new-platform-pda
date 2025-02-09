"use server";
import { createClient } from "../server";

export const getAvatarUrl = async (userId: string) => {
  try {
    const supabase = await createClient();

    const {
      data: { publicUrl },
    } = await supabase.storage
      .from("user_profile")
      .getPublicUrl(`${userId}/avatar`);

    return publicUrl;
  } catch (error) {
    console.error("Error fetching avatar URL:", error);
    return null;
  }
};

export const uploadAvatar = async (userId: string, base64Image: string) => {
  try {
    const byteCharacters = atob(base64Image.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    const file = new File([blob], "avatar.png", { type: "image/png" });

    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("user_avatar")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;
    return data.path;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
};

export const updateAvatarMetadata = async (userId: string, file: File) => {
  try {
    const supabase = await createClient();

    const { data: list } = await supabase.storage
      .from("user_profile")
      .list(userId);

    if (!list || list.length === 0) throw new Error("No avatar found");

    const latestAvatar = list[0].name;

    const { data, error } = await supabase.storage
      .from("user_profile")
      .update(`${userId}/${latestAvatar}`, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating metadata:", error);
    return null;
  }
};

export const deleteAvatar = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data: list } = await supabase.storage
      .from("user_profile")
      .list(userId);

    if (!list) return true;

    const filesToDelete = list.map((file) => `${userId}/${file.name}`);
    const { error } = await supabase.storage
      .from("user_profile")
      .remove(filesToDelete);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return false;
  }
};
