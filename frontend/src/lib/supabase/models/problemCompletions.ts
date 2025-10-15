import { createClient } from "../client";
import type {
  ProblemCompletion,
  ProblemCompletionCreate,
  ProblemCompletionUpdate,
} from "@/lib/types";

export async function createProblemCompletion(input: ProblemCompletionCreate) {
  const supabase = createClient();

  const payload = {
    user_id: input.userId,
    problem_id: input.problemId,
    is_completed: input.isCompleted ?? false,
    is_attempted: input.isAttempted ?? false,
    completion_date: input.completionDate ?? null,
    // first_attempt_date: input.firstAttemptDate,
    user_solution: input.userSolution ?? "",
    attempts_count: input.attemptsCount ?? 0,
    hints_used: input.hintsUsed ?? 0,
    time_spent_seconds: input.timeSpentSeconds ?? 0,
    test_cases_passed: input.testCasesPassed ?? 0,
    total_test_cases: input.totalTestCases ?? 0,
    points_earned: input.pointsEarned ?? 0,
    efficiency_score: input.efficiencyScore ?? 0.0,
  };

  const { data, error } = await supabase
    .from("problem_completions")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function getProblemCompletions(opts?: {
  userId?: string;
  problemId?: number;
  isCompleted?: boolean;
  isAttempted?: boolean;
}) {
  const supabase = createClient();

  let q = supabase
    .from("problem_completions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (opts?.userId !== undefined) q = q.eq("user_id", opts.userId);
  if (opts?.problemId !== undefined) q = q.eq("problem_id", opts.problemId);
  if (opts?.isCompleted !== undefined)
    q = q.eq("is_completed", opts.isCompleted);
  if (opts?.isAttempted !== undefined)
    q = q.eq("is_attempted", opts.isAttempted);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ProblemCompletion[];
}

export async function getProblemCompletionForUserProblem(
  userId: string,
  problemId: number
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("problem_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function updateProblemCompletion(
  id: number,
  patch: ProblemCompletionUpdate
) {
  const supabase = createClient();

  const payload: Partial<ProblemCompletion> & { updated_at?: string } = {};

  if (patch.isCompleted !== undefined) payload.is_completed = patch.isCompleted;
  if (patch.isAttempted !== undefined) payload.is_attempted = patch.isAttempted;
  if (patch.completionDate !== undefined)
    payload.completion_date = patch.completionDate;
  if (patch.userSolution !== undefined)
    payload.user_solution = patch.userSolution;
  if (patch.attemptsCount !== undefined)
    payload.attempts_count = patch.attemptsCount;
  if (patch.hintsUsed !== undefined) payload.hints_used = patch.hintsUsed;
  if (patch.timeSpentSeconds !== undefined)
    payload.time_spent_seconds = patch.timeSpentSeconds;
  if (patch.testCasesPassed !== undefined)
    payload.test_cases_passed = patch.testCasesPassed;
  if (patch.totalTestCases !== undefined)
    payload.total_test_cases = patch.totalTestCases;
  if (patch.pointsEarned !== undefined)
    payload.points_earned = patch.pointsEarned;
  if (patch.efficiencyScore !== undefined)
    payload.efficiency_score = patch.efficiencyScore;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("problem_completions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ProblemCompletion;
}

export async function deleteProblemCompletion(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("problem_completions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
