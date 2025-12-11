import { createClient } from "../client";
import type {
  SurveyQuestion,
  SurveyResponse,
  SurveyAnswer,
  SurveyResponseCreate,
  SurveyAnswerCreate,
} from "@/lib/types/types";

export async function getActiveSurveyQuestions() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SurveyQuestion[];
}

export async function getSurveyQuestionByKey(key: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data as SurveyQuestion;
}

export async function createSurveyResponse(input: SurveyResponseCreate) {
  const supabase = createClient();

  const payload = {
    user_id: input.userId ?? null,
    name: input.name ?? null,
    email: input.email ?? null,
    meta: input.meta ?? {},
  };

  const { data, error } = await supabase
    .from("survey_responses")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as SurveyResponse;
}

export async function createSurveyAnswer(input: SurveyAnswerCreate) {
  const supabase = createClient();

  const payload = {
    response_id: input.responseId,
    question_id: input.questionId,
    value_text: input.valueText ?? null,
    value_number: input.valueNumber ?? null,
  };

  const { data, error } = await supabase
    .from("survey_answers")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as SurveyAnswer;
}

export async function createSurveyAnswers(inputs: SurveyAnswerCreate[]) {
  const supabase = createClient();

  const payload = inputs.map((input) => ({
    response_id: input.responseId,
    question_id: input.questionId,
    value_text: input.valueText ?? null,
    value_number: input.valueNumber ?? null,
  }));

  const { data, error } = await supabase
    .from("survey_answers")
    .insert(payload)
    .select("*");

  if (error) throw error;
  return (data ?? []) as SurveyAnswer[];
}

export async function getSurveyResponsesByUser(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SurveyResponse[];
}

export async function getSurveyAnswersByResponse(responseId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("survey_answers")
    .select("*")
    .eq("response_id", responseId);

  if (error) throw error;
  return (data ?? []) as SurveyAnswer[];
}
