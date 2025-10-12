import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function injectMonacoDecorationStyles() {
  const style = document.createElement("style");
  style.setAttribute("data-monaco-deco-styles", "true");
  style.textContent = `
/* whole-line hint */
.monaco-editor .monaco-hint-line {
  background-color: rgba(255, 234, 0, 0.40);
  outline: 1px solid rgba(255, 234, 0, 0.55);
}
/* whole-line error */
.monaco-editor .monaco-error-line {
  background-color: rgba(255, 0, 0, 0.40);
  outline: 1px solid rgba(255, 0, 0, 0.55);
}
/* optional: hide when hints toggled off if your editor root carries .hints-off */
.hints-off .monaco-editor .monaco-hint-line,
.hints-off .monaco-editor .monaco-error-line {
  background: transparent !important;
  outline: none !important;
}
`;
  document.head.appendChild(style);
}
