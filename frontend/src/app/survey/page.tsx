"use client";

import SurveyForm from "@/components/survey/SurveyForm";

export default function SurveyPage() {
  return (
    <main className="flex h-full overflow-y-auto justify-center p-6 md:p-12 custom-scroll">
      <div className="w-full max-w-2xl my-auto">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8 rounded-full shadow-lg shadow-primary/50" />

        <div className="matrix-border bg-card/30 backdrop-blur-sm rounded-lg p-8 md:p-10 shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold glow-text mb-2">
              Matrix Post-Experience Survey
            </h1>
            <p className="text-primary/70 text-sm">
              Help us improve by sharing your thoughts
            </p>
          </div>

          <SurveyForm />
        </div>
      </div>
    </main>
  );
}
