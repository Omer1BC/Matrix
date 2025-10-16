import { createClient } from "../client";
import type {
  ProblemCategory,
  ProblemCategoryCreate,
  ProblemCategoryUpdate,
} from "@/lib/types";

export async function createProblemCategory(input: ProblemCategoryCreate) {
  const supabase = createClient();

  const payload = {
    key: input.key,
    title: input.title,
    icon: input.icon,
    order: input.order ?? 0,
    description: input.description ?? "",
    is_locked_by_default: input.isLockedByDefault ?? false,
  };

  const { data, error } = await supabase
    .from("problem_categories")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCategory;
}

export async function getProblemCategories(opts?: { key?: string }) {
  const supabase = createClient();

  let q = supabase
    .from("problem_categories")
    .select("*")
    .order("order", { ascending: true });

  if (opts?.key) q = q.eq("key", opts.key);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProblemCategory[];
}

export async function getProblemCategoryByKey(key: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("problem_categories")
    .select("*")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data as ProblemCategory;
}

export async function updateProblemCategory(
  id: number,
  patch: ProblemCategoryUpdate
) {
  const supabase = createClient();

  const payload: Partial<ProblemCategory> & { updated_at?: string } = {};

  if (patch.key !== undefined) payload.key = patch.key;
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.icon !== undefined) payload.icon = patch.icon;
  if (patch.order !== undefined) payload.order = patch.order;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.isLockedByDefault !== undefined)
    payload.is_locked_by_default = patch.isLockedByDefault;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("problem_categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCategory;
}

export async function deleteProblemCategory(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("problem_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
