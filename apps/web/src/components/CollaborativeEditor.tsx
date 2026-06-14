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
  readonly showMinimap?: boolean;
  readonly fontSize?: number;
}

const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  typescript: "typescript",
  python: "python",
  cpp: "cpp",
  java: "java",
  rust: "rust"
};

export function CollaborativeEditor({
  ytext,
  awareness,
  language = "typescript",
  showMinimap = true,
  fontSize = 14,
}: CollaborativeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (mountedEditor, monaco) => {
      editorRef.current = mountedEditor;
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

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ minimap: { enabled: showMinimap } });
    }
  }, [showMinimap]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  return (
    // fix: wrapper div with aria-label so the editor region is announced
    <div
      role="region"
      aria-label={`${LANGUAGE_MAP[language]} code editor. Press F1 for command palette. Use Escape then Tab to move focus out of the editor.`}
      className="h-full w-full"
    >
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language]}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: showMinimap },
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: "on",
          renderWhitespace: "selection",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          cursorBlinking: "smooth",
          smoothScrolling: true,
          // fix: accessibility options for Monaco
          accessibilitySupport: "auto",
          ariaLabel: `${LANGUAGE_MAP[language]} code editor`,
        }}
      />
    </div>
  );
}
