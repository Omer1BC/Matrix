import { createClient } from "../client";
import type {
  Problem,
  ProblemCreate,
  ProblemUpdate,
  Difficulty,
} from "@/lib/types/types";

export async function createProblem(input: ProblemCreate) {
  const supabase = createClient();

  const payload = {
    category_id: input.categoryId,
    problem_id: input.problemId,
    title: input.title,
    description: input.description,
    method_stub: input.methodStub,
    difficulty: input.difficulty,
    order: input.order,
    is_locked_by_default: input.isLockedByDefault,
    points_reward: input.pointsReward,
    solution: input.solution ?? null,
    test_cases: input.testCases ?? [],
    input_args: input.inputArgs ?? [],
    tools: input.tools ?? {},
  };

  const { data, error } = await supabase
    .from("problems")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;

  return data as Problem;
}

export async function getProblemBySlug(problemId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_id", problemId)
    .single();

  if (error) throw error;
  return data as Problem;
}

export async function getProblems(opts?: {
  categoryId?: number;
  difficulty?: Difficulty;
}) {
  const supabase = createClient();

  let q = supabase
    .from("problems")
    .select("*")
    .order("category_id")
    .order("order");

  if (opts?.categoryId != null) q = q.eq("category_id", opts.categoryId);
  if (opts?.difficulty) q = q.eq("difficulty", opts.difficulty);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Problem[];
}

export async function getProblemsByCategoryId(
  categoryId: number,
  opts?: { difficulty?: Difficulty }
) {
  const supabase = createClient();

  let q = supabase
    .from("problems")
    .select("*")
    .eq("category_id", categoryId)
    .order("order", { ascending: true });

  if (opts?.difficulty) q = q.eq("difficulty", opts.difficulty);

  const { data, error } = await q;

  if (error) throw error;
  return (data ?? []) as Problem[];
}

export async function updateProblem(id: number, patch: ProblemUpdate) {
  const supabase = createClient();

  const payload: Partial<Problem> & { updated_at?: string } = {};

  if (patch.categoryId !== undefined) payload.category_id = patch.categoryId;
  if (patch.problemId !== undefined) payload.problem_id = patch.problemId;
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.methodStub !== undefined) payload.method_stub = patch.methodStub;
  if (patch.difficulty !== undefined) payload.difficulty = patch.difficulty;
  if (patch.order !== undefined) payload.order = patch.order;
  if (patch.isLockedByDefault !== undefined)
    payload.is_locked_by_default = patch.isLockedByDefault;
  if (patch.pointsReward !== undefined)
    payload.points_reward = patch.pointsReward;
  if (patch.solution !== undefined) payload.solution = patch.solution;
  if (patch.testCases !== undefined) payload.test_cases = patch.testCases;
  if (patch.inputArgs !== undefined) payload.input_args = patch.inputArgs;
  if (patch.tools !== undefined) payload.tools = patch.tools;

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("problems")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Problem;
}

export async function deleteProblem(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from("problems").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Provides all of the rows in problems table in supabase
 * @returns Array of json objects
 */
export async function getAllProblems() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("type", "Learn")
    .order("order", { ascending: true });
  if (error) throw error;

  return data || [];
}

/**
 * Provides problem using a specified id
 * @param problem_id Problem id
 * @returns Json Object
 */
export async function getProblemById(problem_id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_id", problem_id)
    .maybeSingle();

  if (error) throw error;

  return data;
}
