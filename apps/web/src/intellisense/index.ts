import type * as Monaco from "monaco-editor";
import { registerRustIntellisense } from "./rust";

export function registerAllIntellisense(monaco: typeof Monaco): void {
  registerRustIntellisense(monaco);
}