"use server";
import { createClient } from "@/lib/supabase/server";
import { ZoomMeetingPastInstanceT } from "@/types";

const getAllPastInstancesByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("classroom_id", classroomId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching past instances by classroom ID:", error);
    return false;
  }
};

const getAllPastInstancesByMeetingId = async (meetingId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("meeting_id", meetingId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching past instances by meeting ID:", error);
    return false;
  }
};

const getPastInstanceById = async (pastInstanceId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("id", pastInstanceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching past instance by ID:", error);
    return false;
  }
};

const getPastInstanceByUuid = async (uuid: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .select()
      .eq("uuid", uuid)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching past instance by UUID:", error);
    return false;
  }
};

const createPastInstance = async (
  pastInstanceData: Partial<Omit<ZoomMeetingPastInstanceT, "id | create_at">>
) => {
  try {
    const supabase = await createClient();

    if (
      !pastInstanceData.classroom_id ||
      !pastInstanceData.meeting_id ||
      !pastInstanceData.uuid
    ) {
      throw new Error(
        "Missing required fields: classroom_id, meeting_id, or uuid"
      );
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .insert(pastInstanceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating past instance:", error);
    return false;
  }
};

const updatePastInstanceById = async (
  pastInstanceId: string,
  updates: Partial<Omit<ZoomMeetingPastInstanceT, "id | create_at">>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .update(updates)
      .eq("id", pastInstanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating past instance:", error);
    return false;
  }
};

const updatePastInstanceByUuid = async (
  uuid: string,
  updates: Partial<Omit<ZoomMeetingPastInstanceT, "id | create_at">>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .update(updates)
      .eq("uuid", uuid)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating past instance by UUID:", error);
    return false;
  }
};

const createMultiplePastInstances = async (
  pastInstancesData: Partial<Omit<ZoomMeetingPastInstanceT, "id | create_at">>[]
) => {
  try {
    const supabase = await createClient();

    // Validar se todos os itens têm os campos obrigatórios
    for (const pastInstanceData of pastInstancesData) {
      if (
        !pastInstanceData.classroom_id ||
        !pastInstanceData.meeting_id ||
        !pastInstanceData.uuid
      ) {
        throw new Error(
          "Missing required fields: classroom_id, meeting_id, or uuid in one or more instances"
        );
      }
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .insert(pastInstancesData)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating multiple past instances:", error);
    return false;
  }
};

const deletePastInstanceById = async (pastInstanceId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .delete()
      .eq("id", pastInstanceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting past instance:", error);
    return false;
  }
};

export {
  getAllPastInstancesByClassroomId,
  getAllPastInstancesByMeetingId,
  getPastInstanceById,
  getPastInstanceByUuid,
  createPastInstance,
  createMultiplePastInstances,
  updatePastInstanceById,
  updatePastInstanceByUuid,
  deletePastInstanceById,
};
