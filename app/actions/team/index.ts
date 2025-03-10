"use server";
import { TeamType } from "@/types/teams";
import { createClient } from "@/utils/supabase/server";

export const createTeam = async (teamData: Partial<TeamType>) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .insert([teamData])
      .select();

    if (error) throw error;

    return data[0] as TeamType;
  } catch (error) {
    console.error("Error creating team:", error);
    return false;
  }
};

export const getAllTeams = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .select("*, team_coodesh_assessments!inner(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as TeamType[];
  } catch (error) {
    console.error("Error fetching all teams:", error);
    return false;
  }
};

export const getTeamById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .select()
      .eq("id", id)
      .single();

    if (error) throw error;

    return data as TeamType;
  } catch (error) {
    console.error("Error fetching team:", error);
    return false;
  }
};

export const updateTeam = async (id: string, teamData: Partial<TeamType>) => {
  try {
    const supabase = await createClient();

    // Add updated_at timestamp
    const updatedData = {
      ...teamData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("teams")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data[0] as TeamType;
  } catch (error) {
    console.error("Error updating team:", error);
    return false;
  }
};

export const deleteTeam = async (id: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    return false;
  }
};
