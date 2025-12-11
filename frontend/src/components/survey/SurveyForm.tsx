"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getActiveSurveyQuestions,
  createSurveyResponse,
  createSurveyAnswers,
} from "@/lib/supabase/models/survey";
import { SurveyQuestion } from "@/lib/types/types";
import { getCurrentUser } from "@/lib/supabase/auth";
import { Card } from "../ui/card";

export default function SurveyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
  const [pillChoice, setPillChoice] = useState<"red" | "blue" | null>(null);

  const isFormValid = () => {
    const requiredQuestions = questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      if (
        !answers[question.id] ||
        answers[question.id] === "" ||
        (Array.isArray(answers[question.id]) &&
          answers[question.id].length === 0)
      ) {
        return false;
      }
    }
    return pillChoice !== null;
  };

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getActiveSurveyQuestions();
        console.log("Loaded survey questions:", data);
        setQuestions(data);
      } catch (err: any) {
        console.error("Error loading survey questions:", err);
        toast.error(
          "Failed to load survey questions: " + (err.message || "Unknown error")
        );
      } finally {
        setQuestionsLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const requiredQuestions = questions.filter((q) => q.required);
    for (const question of requiredQuestions) {
      if (!answers[question.id] || answers[question.id] === "") {
        toast.error(`Please answer: ${question.question}`);
        return;
      }
    }

    if (!pillChoice) {
      toast.error("Please choose: Red Pill or Blue Pill?");
      return;
    }

    setLoading(true);
    try {
      const user = await getCurrentUser().catch(() => null);

      const response = await createSurveyResponse({
        userId: user?.id ?? null,
        meta: { pillChoice },
      });

      const answerPayloads = questions
        .filter((q) => answers[q.id] !== undefined && answers[q.id] !== "")
        .map((q) => {
          let valueText = null;
          let valueNumber = null;

          if (q.type === "number" || q.type === "scale") {
            valueNumber = parseFloat(answers[q.id]);
          } else if (q.type === "multiple_choice") {
            const selected = answers[q.id] as string[];
            const finalValues = selected.map((val) => {
              if (q.config.options?.find((opt) => opt.value === val)?.isOther) {
                return otherInputs[`${q.id}_${val}`] || val;
              }
              return val;
            });
            valueText = JSON.stringify(finalValues);
          } else if (q.type === "single_choice") {
            const selectedOption = q.config.options?.find(
              (opt) => opt.value === answers[q.id]
            );
            if (selectedOption?.isOther) {
              valueText =
                otherInputs[`${q.id}_${answers[q.id]}`] || answers[q.id];
            } else {
              valueText = answers[q.id];
            }
          } else {
            valueText = answers[q.id];
          }

          return {
            responseId: response.id,
            questionId: q.id,
            valueText,
            valueNumber,
          };
        });

      await createSurveyAnswers(answerPayloads);
      toast.success("Survey submitted successfully!");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit survey");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleOtherInputChange = (key: string, value: string) => {
    setOtherInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleMultipleChoiceChange = (
    questionId: string,
    optionValue: string,
    checked: boolean
  ) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, optionValue] };
      } else {
        return {
          ...prev,
          [questionId]: current.filter((v) => v !== optionValue),
        };
      }
    });
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case "short_text":
        return (
          <input
            type="text"
            value={answers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
            required={question.required}
          />
        );

      case "long_text":
        return (
          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50 min-h-24"
            required={question.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={answers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            disabled={loading}
            min={question.config.min}
            max={question.config.max}
            step={question.config.step}
            className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
            required={question.required}
          />
        );

      case "scale":
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={answers[question.id] || question.config.min || 0}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              disabled={loading}
              min={question.config.min || 0}
              max={question.config.max || 10}
              step={question.config.step || 1}
              className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
              required={question.required}
            />
            <div className="flex justify-between text-sm text-primary/70">
              <span>{question.config.min || 0}</span>
              <span className="font-medium text-primary">
                {answers[question.id] || question.config.min || 0}
              </span>
              <span>{question.config.max || 10}</span>
            </div>
          </div>
        );

      case "single_choice":
        return (
          <div className="space-y-3">
            {question.config.options?.map((option) => (
              <div key={option.value}>
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                    disabled={loading}
                    className="mt-1 w-4 h-4 text-primary bg-input/50 border-primary/20 focus:ring-primary/30 focus:ring-2 disabled:opacity-50"
                    required={question.required}
                  />
                  <span className="text-foreground/90 group-hover:text-primary transition-colors">
                    {option.label}
                  </span>
                </label>
                {option.isOther && answers[question.id] === option.value && (
                  <input
                    type="text"
                    value={otherInputs[`${question.id}_${option.value}`] || ""}
                    onChange={(e) =>
                      handleOtherInputChange(
                        `${question.id}_${option.value}`,
                        e.target.value
                      )
                    }
                    placeholder="Please specify..."
                    disabled={loading}
                    className="mt-2 ml-7 w-full px-4 py-2 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                    required={question.required}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.config.options?.map((option) => (
              <div key={option.value}>
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={
                      (answers[question.id] as string[])?.includes(
                        option.value
                      ) || false
                    }
                    onChange={(e) =>
                      handleMultipleChoiceChange(
                        question.id,
                        option.value,
                        e.target.checked
                      )
                    }
                    disabled={loading}
                    className="mt-1 w-4 h-4 text-primary bg-input/50 border-primary/20 rounded focus:ring-primary/30 focus:ring-2 disabled:opacity-50"
                  />
                  <span className="text-foreground/90 group-hover:text-primary transition-colors">
                    {option.label}
                  </span>
                </label>
                {option.isOther &&
                  (answers[question.id] as string[])?.includes(
                    option.value
                  ) && (
                    <input
                      type="text"
                      value={
                        otherInputs[`${question.id}_${option.value}`] || ""
                      }
                      onChange={(e) =>
                        handleOtherInputChange(
                          `${question.id}_${option.value}`,
                          e.target.value
                        )
                      }
                      placeholder="Please specify..."
                      disabled={loading}
                      className="mt-2 ml-7 w-full px-4 py-2 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
                    />
                  )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (questionsLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-primary/70">Loading survey...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-primary/70">No survey questions available.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <label className="text-primary/90 font-medium text-md">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.helper_text && (
            <p className="text-xs text-primary/60 -mt-1">
              {question.helper_text}
            </p>
          )}
          {renderQuestion(question)}
        </div>
      ))}

      {/* Matrix Pill Choice */}
      <Card className="flex flex-col items-center gap-8 p-8">
        <Image
          src="/morpheus.png"
          alt="Morpheus"
          width={300}
          height={300}
          className="rounded-lg shadow-2xl shadow-primary/30"
        />
        <p className="text-xl md:text-2xl font-bold glow-text text-center">
          Okay, one last question
        </p>
        <div className="flex gap-6">
          <Button
            type="button"
            onClick={() => setPillChoice("blue")}
            disabled={loading}
            className={`px-12 py-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 ${
              pillChoice === "blue"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 hover:bg-blue-600/40"
                : "bg-blue-600/20 text-blue-400 border-2 border-blue-600 hover:bg-blue-600/40"
            }`}
          >
            Blue Pill
          </Button>
          <Button
            type="button"
            onClick={() => setPillChoice("red")}
            disabled={loading}
            className={`px-12 py-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 ${
              pillChoice === "red"
                ? "bg-red-600 text-white shadow-lg shadow-red-500/50 ring-2 ring-red-400 hover:bg-red-600/40"
                : "bg-red-600/20 text-red-400 border-2 border-red-600 hover:bg-red-600/40"
            }`}
          >
            Red Pill
          </Button>
        </div>
      </Card>

      <div className="flex flex-row justify-between mt-8">
        <Button
          disabled={loading}
          type="reset"
          className="px-8"
          variant={"destructive"}
          onClick={() => {
            setAnswers({});
            setOtherInputs({});
            setPillChoice(null);
          }}
        >
          Clear Form
        </Button>
        <Button
          disabled={loading || !isFormValid()}
          type="submit"
          className="glow-text hover:shadow-lg hover:shadow-primary/30 transition-all px-8"
          style={{ cursor: "pointer" }}
          variant={undefined}
          size={undefined}
        >
          {loading ? "Submitting..." : "Submit Survey"}
        </Button>
      </div>
    </form>
  );
}
