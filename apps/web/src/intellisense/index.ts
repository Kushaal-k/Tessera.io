import type * as Monaco from "monaco-editor";
import { registerCppIntelliSense } from "./cpp.js";
import { registerRustIntellisense } from "./rust.js";

const registeredLanguages = new Set<string>();

//ensured that rust is also added as the return command may prevent addition of rust
export function registerEditorIntelliSense(monaco: typeof Monaco) {
  if (!registeredLanguages.has("cpp")) {
    registerCppIntelliSense(monaco);
    registeredLanguages.add("cpp");
  }

  if (!registeredLanguages.has("rust")) {
    registerRustIntellisense(monaco);
    registeredLanguages.add("rust");
  }
}