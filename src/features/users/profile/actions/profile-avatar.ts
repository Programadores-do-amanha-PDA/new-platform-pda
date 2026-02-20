"use server";
import { createClient } from "@/lib/supabase/server";

export const getAvatarUrlById = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from("user_avatar")
      .createSignedUrl(`${userId}/avatar.png`, 60);
    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error("Error fetching avatar URL:", error);
    return null;
  }
};

export const getManyAvatarUrlsByIds = async (userIds: string[]) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("user_avatar")
      .createSignedUrls(
        userIds.map((id) => `${id}/avatar.png`),
        60
      );
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching avatar URLs:", error);
    return null;
  }
};

export const uploadUserAvatar = async (userId: string, base64Image: string) => {
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

    const { data, error } = await supabase.storage
      .from("user_avatar")
      .upload(`${userId}/avatar.png`, file, {
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

export const updateUserAvatar = async (userId: string, base64Image: string) => {
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

    const { data, error } = await supabase.storage
      .from("user_avatar")
      .update(`${userId}/avatar.png`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating metadata:", error);
    return null;
  }
};

export const deleteUserAvatar = async (userId: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from("user_avatar")
      .remove([`${userId}/avatar.png`]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return false;
  }
};
