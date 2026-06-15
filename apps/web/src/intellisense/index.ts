import type * as Monaco from "monaco-editor";
import { registerCppIntelliSense } from "./cpp.js";

const registeredLanguages = new Set<string>();

export function registerEditorIntelliSense(monaco: typeof Monaco) {
  if (registeredLanguages.has("cpp")) {
    return;
  }

  registerCppIntelliSense(monaco);
  registeredLanguages.add("cpp");
}
