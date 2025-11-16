import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function injectMonacoDecorationStyles() {
  if (document.head.querySelector('[data-monaco-deco-styles="true"]')) return;
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
/* widget stacking */
.monaco-hint-widget.is-hint { z-index: 50; }
.monaco-hint-widget.is-error { z-index: 60; }  /* errors on top */
/* optional: hide when hints toggled off */
.hints-off .monaco-editor .monaco-hint-line,
.hints-off .monaco-editor .monaco-error-line {
  background: transparent !important;
  outline: none !important;
}
`;
  document.head.appendChild(style);
}

export function formatCodeForEditor(code: string) {
  return code
    .replace(/\\n/g, "\n") // convert \n to actual newlines
    .replace(/\\t/g, "\t") // convert \t to actual tabs
    .replace(/\\"/g, '"') // convert \" to actual double quotes
    .replace(/\\'/g, "'"); // convert \' to actual single quotes
}
