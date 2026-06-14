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

export function registerRustIntelliSense(monaco: typeof Monaco): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("rust", {
    provideCompletionItems(model, position) {
      const range = createRange(monaco, model, position);

      const suggestions = [
        {
          label: "println!",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "println!(\"${1:{}}\", ${2:value});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Standard output print macro with format specifier.",
          range,
        },
        {
          label: "fn",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "fn ${1:function_name}(${2:args}) {\n\t${3:todo!()}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Declare a function.",
          range,
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "fn main() {\n\t${1:println!(\"Hello, world!\");}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Rust application main entry point.",
          range,
        },
      ];

      return { suggestions };
    },
  });
}
