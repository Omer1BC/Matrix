import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

export const allSteps = {
    "/": [
        {
            id: "welcome",
            text: "Welcome to the Matrix Home Page!",
            attachTo: { element: ".matrix-header", on: "bottom" },
        }, 
        {
            id: "demo",
            text: "Here you can watch a demo of Matrix!",
            attachTo: { element: ".demo", on: "left"},
        },
        {
            id: "signup",
            text: "Here you can signup for an account to keep track of progress!",
            attachTo: { element: ".signup", on: "bottom"},
        },
    ]
};

export const createTour = (pathname: string) => {
    const steps = allSteps[pathname] || [];

    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            cancelIcon: { enabled: true },
            classes: "shadow-md bg-purple-50",
            scrollTo: { behavior: "smooth", block: "center" },
        },
    });

    steps.forEach((step) => {
    const waitForElement = () => {
      const el = document.querySelector(step.attachTo.element);
      if (el) {
        tour.addStep({
          ...step,
          buttons: [
            { text: "Back", action: tour.back },
            { text: "Next", action: tour.next },
          ],
        });
      } else {
        // Retry after a short delay
        setTimeout(waitForElement, 100);
      }
    };
    waitForElement();
  });


  return tour;
};