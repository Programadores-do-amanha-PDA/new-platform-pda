"use server";
import { ZoomMeetingPastInstancesType } from "@/types/zoom/meetings";
import { createClient } from "@/utils/supabase/server";

const getAllZoomPastInstancesByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ZoomMeetingPastInstancesType[];
  } catch (error) {
    console.error("Error fetching past instances:", error);
    return false;
  }
};

const getZoomPastInstanceById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ZoomMeetingPastInstancesType;
  } catch (error) {
    console.error("Error fetching past instance by ID:", error);
    return false;
  }
};

const createZoomPastInstance = async (
  instanceData: Partial<ZoomMeetingPastInstancesType>
) => {
  try {
    const supabase = await createClient();

    if (
      !instanceData.classroom_id ||
      !instanceData.account_id ||
      !instanceData.uuid
    ) {
      throw new Error(
        "Missing required fields: classroom_id, account_id, or uuid"
      );
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .insert(instanceData)
      .select()
      .single();

    if (error) throw error;
    return data as ZoomMeetingPastInstancesType;
  } catch (error) {
    console.error("Error creating past instance:", error);
    return false;
  }
};

const createManyZoomPastInstance = async (
  instancesData: Partial<ZoomMeetingPastInstancesType>[]
) => {
  try {
    const supabase = await createClient();

    console.log(instancesData)
    if (!instancesData.length) {
      throw new Error("No instances provided");
    }

    if (
      instancesData.some(
        (instance) =>
          !instance.classroom_id || !instance.account_id || !instance.uuid || !instance.meeting_id
      )
    ) {
      throw new Error("Missing required fields instances");
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .insert(instancesData)
      .select();

    if (error) throw error;
    return data as ZoomMeetingPastInstancesType[];
  } catch (error) {
    console.error("Error creating past instance:", error);
    return false;
  }
};

const updateZoomPastInstanceById = async (
  id: string,
  updates: Partial<ZoomMeetingPastInstancesType>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ZoomMeetingPastInstancesType;
  } catch (error) {
    console.error("Error updating past instance:", error);
    return false;
  }
};

const deleteZoomPastInstanceById = async (id: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting past instance:", error);
    return false;
  }
};

export {
  getAllZoomPastInstancesByClassroomId,
  getZoomPastInstanceById,
  createZoomPastInstance,
  createManyZoomPastInstance,
  updateZoomPastInstanceById,
  deleteZoomPastInstanceById,
};
