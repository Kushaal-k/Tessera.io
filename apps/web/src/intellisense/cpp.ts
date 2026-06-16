import type * as Monaco from "monaco-editor";

const C_CPP_KEYWORDS = [
  "alignas",
  "alignof",
  "auto",
  "bool",
  "break",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "constexpr",
  "continue",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "explicit",
  "false",
  "float",
  "for",
  "friend",
  "if",
  "inline",
  "int",
  "long",
  "namespace",
  "new",
  "nullptr",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "struct",
  "switch",
  "template",
  "this",
  "throw",
  "true",
  "try",
  "typedef",
  "typename",
  "using",
  "void",
  "while",
];

const STL_SUGGESTIONS = [
  "std::array",
  "std::cin",
  "std::cout",
  "std::endl",
  "std::find",
  "std::map",
  "std::pair",
  "std::queue",
  "std::set",
  "std::sort",
  "std::stack",
  "std::string",
  "std::unordered_map",
  "std::unordered_set",
  "std::vector",
];

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

function createHashAwareRange(
  monaco: typeof Monaco,
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
) {
  const word = model.getWordUntilPosition(position);
  const line = model.getLineContent(position.lineNumber);
  const startColumn =
    word.startColumn > 1 && line[word.startColumn - 2] === "#"
      ? word.startColumn - 1
      : word.startColumn;

  return new monaco.Range(
    position.lineNumber,
    startColumn,
    position.lineNumber,
    word.endColumn,
  );
}

function hasStdNamespacePrefix(
  model: Monaco.editor.ITextModel,
  position: Monaco.Position,
  range: Monaco.IRange,
) {
  const line = model.getLineContent(position.lineNumber);
  const prefix = line.slice(0, range.startColumn - 1);

  return prefix.endsWith("std::");
}

export function registerCppIntelliSense(monaco: typeof Monaco): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("cpp", {
    triggerCharacters: ["#", ".", ":", "<"],
    provideCompletionItems(model, position) {
      const range = createRange(monaco, model, position);
      const includeRange = createHashAwareRange(monaco, model, position);
      const shouldInsertStlNameOnly = hasStdNamespacePrefix(
        model,
        position,
        range,
      );

      const keywordSuggestions = C_CPP_KEYWORDS.map((keyword) => ({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range,
      }));

      const stlSuggestions = STL_SUGGESTIONS.map((symbol) => ({
        label: symbol,
        kind: monaco.languages.CompletionItemKind.Class,
        insertText: shouldInsertStlNameOnly
          ? symbol.replace("std::", "")
          : symbol,
        detail: "C++ Standard Library",
        range,
      }));

      const snippetSuggestions = [
        {
          label: "#include <iostream>",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "#include <iostream>",
          detail: "Include iostream",
          range: includeRange,
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "int main() {",
            "\t${1:// your code here}",
            "\treturn 0;",
            "}",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "C++ main function",
          range,
        },
        {
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {",
            "\t${3:// loop body}",
            "}",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Indexed for loop",
          range,
        },
      ];

      return {
        suggestions: [
          ...keywordSuggestions,
          ...stlSuggestions,
          ...snippetSuggestions,
        ],
      };
    },
  });
}
