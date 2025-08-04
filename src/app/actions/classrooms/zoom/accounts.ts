"use server";
import { createClient } from "@/lib/supabase/server";
import { ZoomAccountT } from "@/types";

const getAllZoomAccountsByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_accounts")
      .select()
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching all classroom zoom accounts:", error);
    return false;
  }
};

const getZoomAccountById = async (accountId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_accounts")
      .select()
      .eq("id", accountId)
      .single();

    if (error) throw error;
    return data as ZoomAccountT;
  } catch (error) {
    console.error("Error fetching zoom account by ID:", error);
    return false;
  }
};

const createZoomAccountByClassroomId = async (
  accountData: Partial<ZoomAccountT>
) => {
  try {
    const supabase = await createClient();
    if (
      !accountData.classroom_id ||
      !accountData.account_id ||
      !accountData.client_id ||
      !accountData.client_secret
    ) {
      throw new Error("Missing required fields");
    }

    const { data, error } = await supabase
      .from("classroom_zoom_accounts")
      .insert(accountData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating zoom account:", error);
    return false;
  }
};

const updateZoomAccountById = async (
  accountId: string,
  updates: Partial<ZoomAccountT>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_accounts")
      .update(updates)
      .eq("id", accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating zoom account:", error);
    return false;
  }
};

const deleteZoomAccountById = async (accountId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_zoom_accounts")
      .delete()
      .eq("id", accountId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting zoom account:", error);
    return false;
  }
};

export {
  getAllZoomAccountsByClassroomId,
  getZoomAccountById,
  createZoomAccountByClassroomId,
  updateZoomAccountById,
  deleteZoomAccountById,
};
