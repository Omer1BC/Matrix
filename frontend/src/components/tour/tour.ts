import "./tour.css";
import Shepherd from "shepherd.js";
import { sawHomepage, sawLearn, sawSolve } from "../../lib/supabase/auth";
import { SeenStatus } from "../../lib/types/types";

type PopperPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

type TourStep = {
  id: string;
  text: string;
  attachTo: {
    element: string;
    on: PopperPlacement;
  };
};

export const allSteps: Record<string, TourStep[]> = {
  "/learn": [
    {
      id: "problems",
      text: "Here you will have some exercises to learn concepts step-by-step.",
      attachTo: { element: ".problemButton", on: "right" },
    },
    {
      id: "problemList",
      text: "You can see your progress as well as click through any other problem in the list.",
      attachTo: { element: ".problemList", on: "right" },
    },
    {
      id: "video",
      text: "We also provide videos for each concept to help you learn.",
      attachTo: { element: ".videos", on: "bottom" },
    },
    {
      id: "learn/editor",
      text: "Here is a code editor that you will use to solve exercises.",
      attachTo: { element: ".editor", on: "top" },
    },
    {
      id: "learn/notes",
      text: "You can also write any notes regarding the exercise/video.",
      attachTo: { element: ".notes", on: "top" },
    },
    {
      id: "tests",
      text: "After writing some code in the editor, you can run some tests against them to ensure you are correct.",
      attachTo: { element: ".tests", on: "left" },
    },
    {
      id: "learn/neo",
      text: "Here you can ask Neo some questions you have regarding the topics for the current exercise or your code.",
      attachTo: { element: ".neo", on: "left" },
    },
  ],
  "/solve": [
    {
      id: "Question",
      text: "Here we will provide a harder question for you to solve.",
      attachTo: { element: ".question", on: "right" },
    },
    {
      id: "editor",
      text: "Here you have access to an editor to solve the problem.",
      attachTo: { element: ".editor", on: "right" },
    },
    {
      id: "neo",
      text: "Clicking this icon will ask the LLM for a hint.",
      attachTo: { element: ".neo", on: "left" },
    },
    {
      id: "timer",
      text: "Here you have acces to a timer, and the LLM will automatically provide hints if you are not making any progress.",
      attachTo: { element: ".timer", on: "left" },
    },
    {
      id: "tools",
      text: "Here you have access to tools that are related to solving the problem.",
      attachTo: { element: ".tools", on: "left" },
    },
    {
      id: "createanimation",
      text: "This allows you to create your own animation regarding one of the specified tools above to learn more about them.",
      attachTo: { element: ".createanimation", on: "left" as const },
    },
    {
      id: "notes",
      text: "Here you can refer back to the notes you took when completing the exercises.",
      attachTo: { element: ".notes", on: "left" as const },
    },
    {
      id: "tests-solve",
      text: "Here you are able to run some tests against your code to see if its correct, get it graded by an LLM, and provide an animation.",
      attachTo: { element: ".tests-solve", on: "left" as const },
    },
    {
      id: "chatbox",
      text: "Here you are able to communicate with the LLM to help you solve the problem. It will repond as if it is was an interviewer.",
      attachTo: { element: ".chatbox", on: "right" as const },
    },
  ],
};

export const createTour = async (pathname: string, seen?: SeenStatus) => {
  const steps = allSteps[pathname];

  if (!steps) return null;

  if (pathname === "/" && seen?.homepage) return null;
  if (pathname === "/learn" && seen?.learn) return null;
  if (pathname === "/solve" && seen?.solve) return null;

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      classes:
        "matrix-tour shadow-lg bg-red backdrop-blur-md border border-primary/20 rounded-2xl text-primary",
      scrollTo: { behavior: "smooth", block: "center" },
    },
  });

  for (const step of steps) {
    await new Promise<void>((resolve) => {
      const waitForElement = () => {
        const el = document.querySelector(step.attachTo.element);
        if (el) {
          tour.addStep({
            ...step,
            buttons: [
              {
                text: "Back",
                classes:
                  "bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-all",
                action: () => {
                  if (step.id !== "problemButton") {
                    tour.back();
                  }
                  if (step.id === "problemList") {
                    window.dispatchEvent(new CustomEvent("switchToRegular"));
                  }
                  if (step.id === "video") {
                    window.dispatchEvent(new CustomEvent("switchToProblems"));
                  }
                  if (step.id === "learn/notes") {
                    window.dispatchEvent(new CustomEvent("switchToEditor"));
                  }
                  if (step.id === "tests") {
                    window.dispatchEvent(new CustomEvent("switchToLearnNotes"));
                  }
                  if (step.id === "tools") {
                    window.dispatchEvent(new CustomEvent("switchToEditor"));
                  }
                  if (step.id === "notes") {
                    window.dispatchEvent(new CustomEvent("switchToTools"));
                  }
                  if (step.id === "tests-solve") {
                    window.dispatchEvent(new CustomEvent("switchToNotes"));
                  }
                  if (step.id === "learn/neo") {
                    window.dispatchEvent(new CustomEvent("switchToTests"));
                  }
                },
              },
              {
                text: "Next",
                classes:
                  "bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-all",
                action: () => {
                  tour.next();
                  if (step.id === "problems") {
                    sawHomepage();
                  }
                  if (step.id === "learn/neo") {
                    sawLearn();
                  }
                  if (step.id === "chatbox") {
                    sawSolve();
                  }
                  if (step.id === "problems") {
                    window.dispatchEvent(new CustomEvent("switchToProblems"));
                  }
                  if (step.id === "problemList") {
                    window.dispatchEvent(new CustomEvent("switchToRegular"));
                  }
                  if (step.id === "learn/editor") {
                    window.dispatchEvent(new CustomEvent("switchToLearnNotes"));
                  }
                  if (step.id === "learn/notes") {
                    window.dispatchEvent(new CustomEvent("switchToEditor"));
                  }
                  if (step.id === "timer") {
                    window.dispatchEvent(new CustomEvent("switchToTools"));
                  }
                  if (step.id === "createanimation") {
                    window.dispatchEvent(new CustomEvent("switchToNotes"));
                  }
                  if (step.id === "notes") {
                    window.dispatchEvent(new CustomEvent("switchToEditor"));
                  }
                  if (step.id == "tests") {
                    window.dispatchEvent(new CustomEvent("switchToNeo"));
                  }
                  if (step.id === "learn/neo") {
                    window.dispatchEvent(new CustomEvent("switchToTests"));
                  }
                },
              },
            ],
          });
          resolve();
        } else setTimeout(waitForElement, 100);
      };
      waitForElement();
    });
  }

  return tour;
};
