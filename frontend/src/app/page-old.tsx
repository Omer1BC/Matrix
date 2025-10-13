"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Target, Trophy, Brain } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-1 min-h-0 bg-background text-foreground">
      <div className="matrix-rain" />
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge
            className="mb-6 bg-primary/10 text-primary border-primary/20"
            variant={undefined}
          >
            The Future of Coding Practice
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 glow-text text-balance">
            Welcome to the <span className="text-primary">MATRIX</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-pretty text-primary">
            Enter a new dimension of coding practice. Matrix is an all-in-one
            interview prep tool with an immersive, AI-powered platform that
            adapts to your learning style.
          </p>
          <div className="flex flex-col sm:flex-col gap-4 justify-center">
            <Link
              href="https://www.youtube.com/watch?v=trRO2M6eqnY"
              target="blank"
            >
              <Button
                style={{ cursor: "pointer" }}
                size="lg"
                className="text-lg px-8 py-6 glow-text"
                variant={undefined}
              >
                Watch Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/learn">
              <Button
                style={{ cursor: "pointer" }}
                size="lg"
                className="text-lg px-8 py-6 glow-text"
                variant={undefined}
              >
                Start Learning <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 py-20 px-4 bg-secondary/20"
      >
        <div className="container mx-auto">
          

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">
                  AI-Powered Learning
                </CardTitle>
                <CardDescription className={undefined}>
                  Advanced AI analyzes your coding patterns and creates
                  personalized learning paths.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">
                  Real-time Feedback
                </CardTitle>
                <CardDescription className={undefined}>
                  Get instant feedback on your code quality, performance, and
                  best practices as you type.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">Lesson Plan</CardTitle>
                <CardDescription className={undefined}>
                  Follow our custom exercises to learn all of the skills you
                  need to succeed in coding questions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">
                  Interview Prep
                </CardTitle>
                <CardDescription className={undefined}>
                  Simulate real technical interviews with AI interviewers and
                  get detailed performance analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Active Developers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Coding Problems</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Lessons</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">
                24/7
              </div>
              <div className="text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
