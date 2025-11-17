import type * as monaco from "monaco-editor";
import { createClient } from "./client";

const supabase = createClient();

export async function getAllCategories() {
  const { data, error } = await supabase.from("problem_categories").select("*");

  if (error) throw error;

  return data;
}

export async function getAllUserProblems() {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("user_id", user.user.id)
      .order("problem_id", { ascending: true });
    if (problem_error) throw problem_error;
    return data;
  }
  return [];
}

export async function getUserProblemById(problem_id: string) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  if (user) {
    const { data, error: problem_error } = await supabase
      .from("problem_completions")
      .select("*")
      .eq("problem_id", problem_id)
      .eq("user_id", user.user.id)
      .maybeSingle();
    if (problem_error) throw problem_error;
    return data;
  }

  if (error) throw error;

  return null;
}

export async function getProblemById(problem_id: string) {
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_id", problem_id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function saveNotes(payload: {
  user_id: string;
  problem_id: string;
  notes: string;
}) {
  const res = await fetch("http://localhost:8000/api/save-notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (data as any)?.error || `save_notes failed (${res.status})`
    );
  return data;
}

export async function updateUserProblemCompletion(
  id: number,
  problem_id: string,
  category_id: string,
  test_cases: number,
  current: monaco.editor.IStandaloneCodeEditor
) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  const { error: update_error } = await supabase
    .from("problem_completions")
    .update({
      is_completed: true,
      test_cases_passed: test_cases,
      total_test_cases: test_cases,
      user_solution: current,
      completion_date: new Date().toISOString(),
    })
    .eq("problem_id", problem_id)
    .eq("user_id", user.user.id);

  if (update_error) throw error;

  const { error: update_next_problem_error } = await supabase
    .from("problem_completions")
    .update({ is_unlocked: true })
    .eq("prerequisite", problem_id)
    .eq("user_id", user.user.id)
    .eq("category_id", category_id);

  if (update_next_problem_error) throw update_next_problem_error;

  return null;
}

export async function calculateProblemCompletion(): Promise<number> {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) throw error;

  const { data: problems, error: retrieve_error } = await supabase
    .from("problem_completions")
    .select("*")
    .eq("user_id", user.user.id);

  if (retrieve_error) throw retrieve_error;

  const total_problems = problems.length;

  const completed_problems = problems.filter((problem) => problem.is_completed);

  return (completed_problems.length / total_problems) * 100;
}
