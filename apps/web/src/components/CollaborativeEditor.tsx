import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";
import type { SupportedLanguage } from "@tessera/shared-types";
import { registerEditorIntelliSense } from "../intellisense/index.js";

interface CollaborativeEditorProps {
  readonly ytext: Y.Text;
  readonly awareness: Awareness;
  readonly language?: SupportedLanguage;
}

const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  typescript: "typescript",
  python: "python",
  cpp: "cpp",
};

export function CollaborativeEditor({
  ytext,
  awareness,
  language = "typescript",
}: CollaborativeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (mountedEditor, monaco) => {
      editorRef.current = mountedEditor;
      registerEditorIntelliSense(monaco);

      const model = mountedEditor.getModel();
      if (!model) return;

      bindingRef.current = new MonacoBinding(
        ytext,
        model,
        new Set([mountedEditor]),
        awareness,
      );
    },
    [ytext, awareness],
  );

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, []);

  return (
    <Editor
      height="100%"
      language={LANGUAGE_MAP[language]}
      theme="vs-dark"
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineNumbers: "on",
        renderWhitespace: "selection",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16 },
        cursorBlinking: "smooth",
        smoothScrolling: true,
      }}
    />
  );
}
