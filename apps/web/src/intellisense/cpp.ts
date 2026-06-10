import type * as MonacoEditor from "monaco-editor";

let registered = false;

export function registerCppIntellisense(
  monaco: typeof MonacoEditor
): void {
  if (registered) return;
  registered = true;

  monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range: MonacoEditor.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: MonacoEditor.languages.CompletionItem[] = [

        // ── Keywords ──────────────────────────────────────────────
        ...[
          "int", "float", "double", "char", "bool", "void", "long", "short",
          "unsigned", "signed", "const", "static", "inline", "extern",
          "volatile", "register", "auto", "class", "struct", "union", "enum",
          "namespace", "template", "typename", "public", "private", "protected",
          "virtual", "override", "final", "new", "delete", "this", "return",
          "if", "else", "for", "while", "do", "switch", "case", "break",
          "continue", "default", "try", "catch", "throw", "true", "false",
          "nullptr", "sizeof", "typedef", "using", "operator", "explicit",
          "friend", "mutable", "constexpr", "noexcept", "static_assert",
        ].map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),

        // ── STL Types ─────────────────────────────────────────────
        ...[
          { label: "std::vector",        insertText: "std::vector<${1:T}>" },
          { label: "std::string",        insertText: "std::string" },
          { label: "std::map",           insertText: "std::map<${1:Key}, ${2:Value}>" },
          { label: "std::unordered_map", insertText: "std::unordered_map<${1:Key}, ${2:Value}>" },
          { label: "std::set",           insertText: "std::set<${1:T}>" },
          { label: "std::unordered_set", insertText: "std::unordered_set<${1:T}>" },
          { label: "std::pair",          insertText: "std::pair<${1:T1}, ${2:T2}>" },
          { label: "std::tuple",         insertText: "std::tuple<${1:T}>" },
          { label: "std::array",         insertText: "std::array<${1:T}, ${2:N}>" },
          { label: "std::stack",         insertText: "std::stack<${1:T}>" },
          { label: "std::queue",         insertText: "std::queue<${1:T}>" },
          { label: "std::deque",         insertText: "std::deque<${1:T}>" },
          { label: "std::list",          insertText: "std::list<${1:T}>" },
          { label: "std::shared_ptr",    insertText: "std::shared_ptr<${1:T}>" },
          { label: "std::unique_ptr",    insertText: "std::unique_ptr<${1:T}>" },
          { label: "std::weak_ptr",      insertText: "std::weak_ptr<${1:T}>" },
          { label: "std::optional",      insertText: "std::optional<${1:T}>" },
          { label: "std::variant",       insertText: "std::variant<${1:T}>" },
          { label: "std::function",      insertText: "std::function<${1:Ret}(${2:Args})>" },
        ].map((item) => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: item.insertText,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),

        // ── STL Functions / IO ────────────────────────────────────
        ...[
          { label: "std::cout",        insertText: "std::cout << ${1:value} << std::endl;" },
          { label: "std::cin",         insertText: "std::cin >> ${1:variable};" },
          { label: "std::cerr",        insertText: "std::cerr << ${1:message} << std::endl;" },
          { label: "std::endl",        insertText: "std::endl" },
          { label: "std::make_shared", insertText: "std::make_shared<${1:T}>(${2:args})" },
          { label: "std::make_unique", insertText: "std::make_unique<${1:T}>(${2:args})" },
          { label: "std::make_pair",   insertText: "std::make_pair(${1:first}, ${2:second})" },
          { label: "std::move",        insertText: "std::move(${1:value})" },
          { label: "std::forward",     insertText: "std::forward<${1:T}>(${2:value})" },
          { label: "std::sort",        insertText: "std::sort(${1:begin}, ${2:end});" },
          { label: "std::find",        insertText: "std::find(${1:begin}, ${2:end}, ${3:value})" },
          { label: "std::max",         insertText: "std::max(${1:a}, ${2:b})" },
          { label: "std::min",         insertText: "std::min(${1:a}, ${2:b})" },
          { label: "std::swap",        insertText: "std::swap(${1:a}, ${2:b});" },
          { label: "std::to_string",   insertText: "std::to_string(${1:value})" },
          { label: "std::stoi",        insertText: "std::stoi(${1:str})" },
          { label: "std::stof",        insertText: "std::stof(${1:str})" },
          { label: "std::accumulate",  insertText: "std::accumulate(${1:begin}, ${2:end}, ${3:init})" },
          { label: "std::fill",        insertText: "std::fill(${1:begin}, ${2:end}, ${3:value});" },
          { label: "std::copy",        insertText: "std::copy(${1:srcBegin}, ${2:srcEnd}, ${3:dest});" },
          { label: "std::transform",   insertText: "std::transform(${1:begin}, ${2:end}, ${3:out}, ${4:func});" },
        ].map((item) => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: item.insertText,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),

        // ── Snippets ──────────────────────────────────────────────
        {
          label: "#include",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "#include <${1:header}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Include a header file",
          range,
        },
        {
          label: "#include iostream",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "#include <iostream>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Include iostream",
          range,
        },
        {
          label: "boilerplate",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "#include <iostream>\n\nint main() {\n\t${1:// code here}\n\treturn 0;\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Basic C++ boilerplate",
          range,
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "int main() {\n\t${1:// code here}\n\treturn 0;\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main function",
          range,
        },
        {
          label: "main with args",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "int main(int argc, char* argv[]) {\n\t${1:// code here}\n\treturn 0;\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main function with arguments",
          range,
        },
        {
          label: "for loop",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t${3:// body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Standard for loop",
          range,
        },
        {
          label: "range-based for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (const auto& ${1:item} : ${2:container}) {\n\t${3:// body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Range-based for loop",
          range,
        },
        {
          label: "while loop",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "while (${1:condition}) {\n\t${2:// body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "While loop",
          range,
        },
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if (${1:condition}) {\n\t${2:// body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If statement",
          range,
        },
        {
          label: "if-else",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "if (${1:condition}) {\n\t${2:// body}\n} else {\n\t${3:// else body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If-else statement",
          range,
        },
        {
          label: "switch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "switch (${1:variable}) {\n\tcase ${2:value}:\n\t\t${3:// body}\n\t\tbreak;\n\tdefault:\n\t\t${4:// default}\n\t\tbreak;\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Switch statement",
          range,
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "class ${1:ClassName} {\npublic:\n\t${1:ClassName}() = default;\n\t~${1:ClassName}() = default;\n\nprivate:\n\t${2:// members}\n};",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Class definition",
          range,
        },
        {
          label: "struct",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "struct ${1:StructName} {\n\t${2:// members}\n};",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Struct definition",
          range,
        },
        {
          label: "lambda",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "[${1:capture}](${2:params}) -> ${3:ReturnType} {\n\t${4:// body}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Lambda expression",
          range,
        },
        {
          label: "try-catch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "try {\n\t${1:// code}\n} catch (const ${2:std::exception}& ${3:e}) {\n\t${4:// handle}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-catch block",
          range,
        },
        {
          label: "namespace",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "namespace ${1:name} {\n\t${2:// code}\n} // namespace ${1:name}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Namespace block",
          range,
        },
        {
          label: "using namespace std",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "using namespace std;",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Using namespace std",
          range,
        },
      ];

      return { suggestions };
    },
  });
}