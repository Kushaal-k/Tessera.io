import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";
import { createRoot, type Root } from "react-dom/client";
import { SocraticAnnotation } from "@tessera/ui-components";
import type { SupportedLanguage } from "@tessera/shared-types";

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
  const viewZoneIdsRef = useRef<string[]>([]);
  const viewZoneRootsRef = useRef<Root[]>([]);

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
    },
    [ytext, awareness],
  );

  // Expose this logic for testing/prototyping Phase 2 Socratic Mentor
  const showSocraticMentor = useCallback((lineNumber: number, message: string, suggestions: string[]) => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    editorInstance.changeViewZones((accessor) => {
      const domNode = document.createElement("div");
      domNode.style.zIndex = "10";
      // Adding padding so it doesn't touch the code directly
      domNode.style.paddingTop = "8px";
      domNode.style.paddingBottom = "8px";

      const root = createRoot(domNode);
      viewZoneRootsRef.current.push(root);

      let zoneId = "";
      
      const closeAnnotation = () => {
        editorInstance.changeViewZones((acc) => {
          acc.removeZone(zoneId);
        });
        root.unmount();
        viewZoneRootsRef.current = viewZoneRootsRef.current.filter((r) => r !== root);
      };

      zoneId = accessor.addZone({
        afterLineNumber: lineNumber,
        heightInLines: 8, // Estimate height in lines based on content
        domNode: domNode,
      });
      viewZoneIdsRef.current.push(zoneId);

      root.render(
        <SocraticAnnotation
          message={message}
          suggestions={suggestions}
          onClose={closeAnnotation}
          onSuggestionClick={(s) => console.log("User selected suggestion:", s)}
        />
      );
    });
  }, []);

  // Add context menu action to trigger the prototype
  useEffect(() => {
    if (!editorRef.current) return;
    
    const action = editorRef.current.addAction({
      id: "ask-socratic-mentor",
      label: "Ask Socratic Mentor (Prototype)",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: (ed) => {
        const position = ed.getPosition();
        if (position) {
          showSocraticMentor(
            position.lineNumber,
            "I noticed you're working on this section. Would you like some guidance on how to optimize this function?",
            ["Yes, help me optimize", "Explain how it works", "What are the edge cases?"]
          );
        }
      },
    });

    return () => {
      action.dispose();
    };
  }, [showSocraticMentor]);

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
      viewZoneRootsRef.current.forEach((root) => root.unmount());
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
