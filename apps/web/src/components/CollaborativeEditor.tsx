import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import type { editor } from "monaco-editor";
import { KeyMod, KeyCode } from "monaco-editor";
import { createRoot, type Root } from "react-dom/client";
import { SocraticAnnotation } from "@tessera/ui-components";
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
  const viewZoneIdsRef = useRef<string[]>([]);
  const viewZoneRootsRef = useRef<Root[]>([]);

  const handleEditorMount: OnMount = useCallback(
    (mountedEditor: editor.IStandaloneCodeEditor, monaco: any) => {
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

  // Expose this logic for testing/prototyping Phase 2 Socratic Mentor
  const showSocraticMentor = useCallback((lineNumber: number, message: string, suggestions: string[]) => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    editorInstance.changeViewZones((accessor: editor.IViewZoneChangeAccessor) => {
      const domNode = document.createElement("div");
      domNode.style.zIndex = "10";
      // Adding padding so it doesn't touch the code directly
      domNode.style.paddingTop = "8px";
      domNode.style.paddingBottom = "8px";

      const root = createRoot(domNode);
      viewZoneRootsRef.current.push(root);

      let zoneId = "";
      
      const closeAnnotation = () => {
        editorInstance.changeViewZones((acc: editor.IViewZoneChangeAccessor) => {
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
          onSuggestionClick={(s: string) => console.log("User selected suggestion:", s)}
          // TODO(Phase 2): Integrate with @tessera/ai-service
          // This will be replaced with a call to the actual AI service
          // e.g., const response = await aiService.askMentor(text);
          onSubmit={(text: string) => console.log("User submitted question:", text)}
        />
      );
    });
  }, []);

  // Add context menu action to trigger the prototype
  useEffect(() => {
    if (!editorRef.current) return;
    
    const action = editorRef.current.addAction({
      id: "ask-socratic-mentor",
      label: "Ask Socratic Mentor",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      keybindings: [
        KeyMod.CtrlCmd | KeyCode.KeyM
      ],
      run: (ed: editor.ICodeEditor) => {
        const position = ed.getPosition();
        const selection = ed.getSelection();
        const selectedText = selection ? ed.getModel()?.getValueInRange(selection) : "";
        
        if (position) {
          showSocraticMentor(
            position.lineNumber,
            selectedText 
              ? `I noticed you highlighted this code. Would you like some guidance on how to optimize it?` 
              : `I noticed you're working on this section. Would you like some guidance on how to optimize this function?`,
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
