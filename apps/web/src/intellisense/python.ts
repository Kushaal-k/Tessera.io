import type * as Monaco from "monaco-editor";

function createRange(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
) {
  const word = model.getWordUntilPosition(position);

  return new monaco.Range(
    position.lineNumber,
    word.startColumn,
    position.lineNumber,
    word.endColumn,
  );
}

export function registerPythonIntelliSense(monaco: typeof Monaco): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems(model, position) {
      const range = createRange(monaco, model, position);

      const suggestions = [
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print($1)",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Prints the values to a stream, or to sys.stdout by default.",
          range,
        },
        {
          label: "def",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "def ${1:function_name}(${2:args}):\n\t${3:pass}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Define a function or method.",
          range,
        },
        {
          label: "import",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "import ${1:module_name}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Import a module.",
          range,
        },
        {
          label: "if __name__ == '__main__':",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if __name__ == '__main__':\n\t${1:main()}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Boilerplate for executable script entry point.",
          range,
        },
      ];

      return { suggestions };
    },
  });
}
