import { createClient } from "../client";
import type {
  CategoryPrerequisite,
  CategoryPrerequisiteCreate,
  CategoryPrerequisiteUpdate,
} from "@/lib/types";

export async function createCategoryPrerequisite(
  input: CategoryPrerequisiteCreate
) {
  const supabase = createClient();

  const payload = {
    category_id: input.categoryId,
    required_category_id: input.requiredCategoryId,
    min_completion_percentage: input.minCompletionPercentage ?? 100,
  };

  const { data, error } = await supabase
    .from("category_prerequisites")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as CategoryPrerequisite;
}

export async function getCategoryPrerequisites(opts?: {
  categoryId?: number;
  requiredCategoryId?: number;
}) {
  const supabase = createClient();

  let q = supabase.from("category_prerequisites").select("*").order("id");

  if (opts?.categoryId !== undefined) q = q.eq("category_id", opts.categoryId);
  if (opts?.requiredCategoryId !== undefined)
    q = q.eq("required_category_id", opts.requiredCategoryId);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CategoryPrerequisite[];
}

export async function getCategoryPrerequisitesForCategory(categoryId: number) {
  return getCategoryPrerequisites({ categoryId });
}

export async function getCategoryPrerequisitesForRequirement(
  requiredCategoryId: number
) {
  return getCategoryPrerequisites({ requiredCategoryId });
}

export async function updateCategoryPrerequisite(
  id: number,
  patch: CategoryPrerequisiteUpdate
) {
  const supabase = createClient();

  const payload: Partial<CategoryPrerequisite> = {};

  if (patch.categoryId !== undefined) payload.category_id = patch.categoryId;
  if (patch.requiredCategoryId !== undefined)
    payload.required_category_id = patch.requiredCategoryId;
  if (patch.minCompletionPercentage !== undefined)
    payload.min_completion_percentage = patch.minCompletionPercentage;

  const { data, error } = await supabase
    .from("category_prerequisites")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as CategoryPrerequisite;
}

export async function deleteCategoryPrerequisite(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("category_prerequisites")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
