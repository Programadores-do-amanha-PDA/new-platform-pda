"use server";

import { createClient } from "@/lib/supabase/server";
import { ZoomMeetingPastInstanceT } from "@/features/dashboard/classroom-zoom/types";

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
    return null;
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

const upsertMultiplePastInstances = async (
  pastInstancesData: Partial<
    Omit<ZoomMeetingPastInstanceT, "id | create_at">
  >[],
  options: { preserveUserData?: boolean } = { preserveUserData: true }
) => {
  try {
    const supabase = await createClient();

    // Checking all required fields
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

    let dataToUpsert = pastInstancesData;

    // If preserveUserData is true, merge with existing data
    if (options.preserveUserData) {
      // Get existing records to preserve important fields like justifications
      const ids = pastInstancesData
        .map((instance) => instance.id)
        .filter(Boolean);
      const { data: existingRecords } = await supabase
        .from("classroom_zoom_meeting_past_instancies")
        .select("*")
        .in("id", ids);

      // Create a map of existing records by ID for quick lookup
      const existingRecordsMap = new Map(
        (existingRecords || []).map((record) => [record.id, record])
      );

      // Merge new data with existing data, preserving important fields
      dataToUpsert = pastInstancesData.map((newInstance) => {
        const existingInstance = existingRecordsMap.get(newInstance.id!);

        if (existingInstance) {
          // For existing records, preserve important fields and update API data
          return {
            // Start with existing record to preserve all fields
            ...existingInstance,
            // Update only specific fields from API
            participants:
              newInstance.participants || existingInstance.participants || [],
            poll_results:
              newInstance.poll_results || existingInstance.poll_results || [],
            synchronized_at: new Date().toISOString(),
            // Update other fields only if they have new values
            start_time: newInstance.start_time || existingInstance.start_time,
            // Preserve justifications - never overwrite them
            justifications: existingInstance.justifications || [],
            // Preserve class_type unless explicitly provided
            class_type: newInstance.class_type || existingInstance.class_type,
            // Preserve visibility setting unless explicitly provided
            is_visible_on_schedule:
              newInstance.is_visible_on_schedule !== undefined
                ? newInstance.is_visible_on_schedule
                : existingInstance.is_visible_on_schedule,
          };
        } else {
          // New record, use provided data with safe defaults
          return {
            ...newInstance,
            justifications: newInstance.justifications || [],
            participants: newInstance.participants || [],
            poll_results: newInstance.poll_results || [],
            synchronized_at: new Date().toISOString(),
          };
        }
      });
    } else {
      // If not preserving user data, just ensure defaults for new records
      dataToUpsert = pastInstancesData.map((instance) => ({
        ...instance,
        justifications: instance.justifications || [],
        participants: instance.participants || [],
        poll_results: instance.poll_results || [],
        synchronized_at: new Date().toISOString(),
      }));
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meeting_past_instancies")
      .upsert(dataToUpsert, {
        onConflict: "id", // Use ID as unique identifier for upsert
        ignoreDuplicates: false, // Update existing records
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error upserting multiple past instances:", error);
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
  upsertMultiplePastInstances,
  updatePastInstanceById,
  updatePastInstanceByUuid,
  deletePastInstanceById,
};
