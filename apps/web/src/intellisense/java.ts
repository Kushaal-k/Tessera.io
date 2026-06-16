import type * as Monaco from "monaco-editor";
import { createRange } from "./utils.js";

export function registerJavaIntelliSense(monaco: typeof Monaco): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("java", {
    provideCompletionItems(model, position) {
      const range = createRange(monaco, model, position);

      const suggestions = [
        {
          label: "sysout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "System.out.println(${1:value});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Standard system output stream statement.",
          range,
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public static void main(String[] args) {\n\t${1:System.out.println(\"Hello World\");}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Java application main entry point method.",
          range,
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "public class ${1:Main} {\n\t$0\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Declare a public class.",
          range,
        },
      ];

      return { suggestions };
    },
  });
}
