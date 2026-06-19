import { useRef, useEffect, useCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";
import type { SupportedLanguage } from "@tessera/shared-types";
import { SocraticAnnotation } from "@tessera/ui-components";

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
  const viewZoneIdRef = useRef<string | null>(null);
  const rootRef = useRef<Root | null>(null);

  const removeMentorAnnotation = useCallback(() => {
    if (!editorRef.current || !viewZoneIdRef.current) return;
    editorRef.current.changeViewZones((accessor) => {
      if (viewZoneIdRef.current) {
        accessor.removeZone(viewZoneIdRef.current);
        viewZoneIdRef.current = null;
      }
    });
    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
  }, []);

  const showMentorAnnotation = useCallback((lineNumber: number) => {
    if (!editorRef.current) return;

    removeMentorAnnotation();

    editorRef.current.changeViewZones((accessor) => {
      const domNode = document.createElement("div");
      domNode.style.zIndex = "10";
      
      const root = createRoot(domNode);
      rootRef.current = root;
      
      root.render(
        <div style={{ padding: '8px 24px' }}>
          <SocraticAnnotation onDismiss={removeMentorAnnotation}>
            <p>I noticed you selected this block. Have you considered how the asynchronous behavior here might affect the order of execution?</p>
          </SocraticAnnotation>
        </div>
      );

      const id = accessor.addZone({
        afterLineNumber: lineNumber,
        heightInLines: 6,
        domNode: domNode,
      });
      viewZoneIdRef.current = id;
    });
  }, [removeMentorAnnotation]);

  const handleEditorMount: OnMount = useCallback(
    (mountedEditor) => {
      editorRef.current = mountedEditor;

      const model = mountedEditor.getModel();
      if (!model) return;

      bindingRef.current = new MonacoBinding(
        ytext,
        model,
        new Set([mountedEditor]),
        awareness,
      );

      mountedEditor.addAction({
        id: "ask-socratic-mentor",
        label: "Ask Socratic Mentor",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: (ed) => {
          const position = ed.getPosition();
          if (position) {
            showMentorAnnotation(position.lineNumber);
          }
        }
      });
    },
    [ytext, awareness, showMentorAnnotation],
  );

  useEffect(() => {
    return () => {
      removeMentorAnnotation();
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [removeMentorAnnotation]);

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
