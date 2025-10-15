import { createClient } from "../client";
import type {
  UserProgress,
  UserProgressCreate,
  UserProgressUpdate,
} from "@/lib/types";

export async function createUserProgress(input: UserProgressCreate) {
  const supabase = createClient();

  const payload = {
    user_id: input.userId,
    total_points: input.totalPoints ?? 0,
    current_level: input.currentLevel ?? 1,
    experience_points: input.experiencePoints ?? 0,
    current_category_id: input.currentCategoryId ?? null,
    current_problem_id: input.currentProblemId ?? null,
    achievements_earned: input.achievementsEarned ?? [],
  };

  const { data, error } = await supabase
    .from("user_progress")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProgress;
}

export async function getUserProgress(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as UserProgress;
}

export async function getUserProgressList(opts?: {
  currentCategoryId?: number | null;
  currentProblemId?: number | null;
}) {
  const supabase = createClient();

  let q = supabase
    .from("user_progress")
    .select("*")
    .order("updated_at", { ascending: false });

  if (opts?.currentCategoryId !== undefined) {
    q = q.eq("current_category_id", opts.currentCategoryId);
  }
  if (opts?.currentProblemId !== undefined) {
    q = q.eq("current_problem_id", opts.currentProblemId);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as UserProgress[];
}

export async function updateUserProgress(
  userId: string,
  patch: UserProgressUpdate
) {
  const supabase = createClient();

  const payload: Partial<UserProgress> & { updated_at?: string } = {};

  if (patch.totalPoints !== undefined) payload.total_points = patch.totalPoints;
  if (patch.currentLevel !== undefined)
    payload.current_level = patch.currentLevel;
  if (patch.experiencePoints !== undefined)
    payload.experience_points = patch.experiencePoints;
  if (patch.currentCategoryId !== undefined)
    payload.current_category_id = patch.currentCategoryId;
  if (patch.currentProblemId !== undefined)
    payload.current_problem_id = patch.currentProblemId;
  if (patch.achievementsEarned !== undefined)
    payload.achievements_earned = patch.achievementsEarned;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("user_progress")
    .update(payload)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProgress;
}

export async function deleteUserProgress(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
