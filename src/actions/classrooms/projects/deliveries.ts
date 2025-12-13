"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomProjectDeliveryT } from "@/features/dashboard/classroom-projects/types";

export const createClassroomProjectDelivery = async (
  deliveryData: Omit<Partial<ClassroomProjectDeliveryT>, "id" | "created_at">
): Promise<ClassroomProjectDeliveryT | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_deliveries")
      .insert([deliveryData])
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomProjectDeliveryT;
  } catch (error) {
    console.error("Error creating classroom project delivery:", error);
    return null;
  }
};

export const getAllDeliveriesByProjectId = async (
  projectId: string
): Promise<ClassroomProjectDeliveryT[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_deliveries")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomProjectDeliveryT[];
  } catch (error) {
    console.error("Error fetching all classroom project deliveries:", error);
    return null;
  }
};

export const getAllDeliveriesByClassroomId = async (
  classroomId: string
): Promise<ClassroomProjectDeliveryT[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_deliveries")
      .select(
        `
        *,
        classroom_projects!inner(classroom_id)
      `
      )
      .eq("classroom_projects.classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomProjectDeliveryT[];
  } catch (error) {
    console.error("Error fetching all classroom deliveries:", error);
    return null;
  }
};

export const getClassroomProjectDeliveryById = async (
  id: string
): Promise<ClassroomProjectDeliveryT | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_project_deliveries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ClassroomProjectDeliveryT;
  } catch (error) {
    console.error("Error fetching classroom project delivery:", error);
    return null;
  }
};

export const updateClassroomProjectDeliveryById = async (
  id: string,
  deliveryData: Partial<ClassroomProjectDeliveryT>
): Promise<ClassroomProjectDeliveryT | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_project_deliveries")
      .update({ ...deliveryData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomProjectDeliveryT;
  } catch (error) {
    console.error("Error updating classroom project delivery:", error);
    return null;
  }
};

export const deleteDeliveryById = async (id: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_project_deliveries")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting classroom project delivery:", error);
    return false;
  }
};
