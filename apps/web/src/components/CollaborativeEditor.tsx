import { useRef, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";
import type { SupportedLanguage } from "@tessera/shared-types";
import { SocraticAnnotation } from "@tessera/ui-components";
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
  rust: "rust",
  go: "go",
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
  const viewZoneIdRef = useRef<string | null>(null);
  const viewZoneRootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  const handleEditorMount: OnMount = useCallback(
    (mountedEditor, monaco) => {
      editorRef.current = mountedEditor;
      registerEditorIntelliSense(monaco);

      mountedEditor.addAction({
        id: "ask-socratic-mentor",
        label: "Ask Socratic Mentor",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: (ed) => {
          const position = ed.getPosition();
          const selection = ed.getSelection();
          if (!position) return;

          if (viewZoneIdRef.current) {
            ed.changeViewZones((changeAccessor) => {
              if (viewZoneIdRef.current) {
                changeAccessor.removeZone(viewZoneIdRef.current);
                viewZoneIdRef.current = null;
              }
            });
            viewZoneRootRef.current?.unmount();
            viewZoneRootRef.current = null;
          }

          const lineToInsert = selection && !selection.isEmpty() ? selection.endLineNumber : position.lineNumber;
          const currentModel = ed.getModel();
          const codeSnippet = currentModel ? (selection && !selection.isEmpty() ? currentModel.getValueInRange(selection) : currentModel.getLineContent(position.lineNumber)) : "";

          ed.changeViewZones((changeAccessor) => {
            const domNode = document.createElement("div");
            domNode.style.zIndex = "10";
            
            const root = createRoot(domNode);
            viewZoneRootRef.current = root;

            const closeZone = () => {
              ed.changeViewZones((accessor) => {
                if (viewZoneIdRef.current) {
                  accessor.removeZone(viewZoneIdRef.current);
                  viewZoneIdRef.current = null;
                }
              });
              root.unmount();
              viewZoneRootRef.current = null;
            };

            const renderAnnotation = (isLoading: boolean, questions: string[] = [], hint: string = "") => {
              root.render(
                <div style={{ padding: "8px" }}>
                  <SocraticAnnotation onClose={closeZone} isLoading={isLoading} questions={questions} hint={hint} />
                </div>
              );
            };

            renderAnnotation(true);

            fetch("http://localhost:8000/mentor/ask", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code_snippet: codeSnippet, language })
            })
            .then(res => res.json())
            .then(data => {
              renderAnnotation(false, data.guiding_questions, data.hint);
            })
            .catch(err => {
              console.error(err);
              renderAnnotation(false, ["Could not reach mentor API. Ensure backend is running."], "");
            });

            const viewZoneId = changeAccessor.addZone({
              afterLineNumber: lineToInsert,
              heightInLines: 10,
              domNode: domNode,
              marginDomNode: null,
            });
            
            viewZoneIdRef.current = viewZoneId;
          });
        }
      });

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
      if (viewZoneRootRef.current) {
        viewZoneRootRef.current.unmount();
        viewZoneRootRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        minimap: { enabled: showMinimap },
      });
    }
  }, [showMinimap]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  return (
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
      }}
    />
  );
}
