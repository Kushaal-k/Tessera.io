import React, { useState, useEffect, useRef } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { 
  Play, Folder, FileCode, Users, 
  Terminal as TerminalIcon, Sparkles, Plus 
} from 'lucide-react';

interface FileItem {
  name: string;
  language: string;
  content: string;
}

const INITIAL_FILES: Record<string, FileItem> = {
  'main.js': {
    name: 'main.js',
    language: 'javascript',
    content: `// Tessera Collaborative IDE Sandbox
// Press 'Run Code' to execute and test outputs

const { add, multiply } = require('./math_utils.js');

console.log("🚀 Initializing Tessera.io workspace...");
console.log("Calculating complex algorithm...");

const a = 12;
const b = 8;
const resultAdd = add(a, b);
const resultMult = multiply(a, b);

console.log(\`Addition Result (\${a} + \${b}) = \${resultAdd}\`);
console.log(\`Multiplication Result (\${a} * \${b}) = \${resultMult}\`);

if (resultAdd > 15) {
  console.log("✅ Threshold check passed!");
} else {
  console.log("❌ Threshold check failed.");
}
`
  },
  'math_utils.js': {
    name: 'math_utils.js',
    language: 'javascript',
    content: `// Math utilities for the compiler
function add(x, y) {
  return x + y;
}

function multiply(x, y) {
  return x * y;
}

module.exports = {
  add,
  multiply
};
`
  },
  'mentor_tutor.js': {
    name: 'mentor_tutor.js',
    language: 'javascript',
    content: `// Socratic tutor hooks and guided steps
function analyzeComplexity(n) {
  // TODO: Implement O(log n) search.
  // AI Mentor Prompt: Why might a linear scan be less efficient here?
  let steps = 0;
  for (let i = 0; i < n; i++) {
    steps++;
  }
  return steps;
}

console.log("Complexity analyzer loaded.");
console.log("Complexity for 10 items:", analyzeComplexity(10));
`
  }
};

interface IDEWorkspaceProps {
  onSocraticTrigger?: (trigger: { title: string; hint: string; code: string }) => void;
}

export const IDEWorkspace: React.FC<IDEWorkspaceProps> = ({ onSocraticTrigger }) => {
  const [files, setFiles] = useState<Record<string, FileItem>>(INITIAL_FILES);
  const [activeFileName, setActiveFileName] = useState<string>('main.js');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Tessera Sandboxed Console v1.0.0',
    'Ready for execution.'
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSimulatingCollaborator, setIsSimulatingCollaborator] = useState<boolean>(false);
  const [cursorInfo, setCursorInfo] = useState<{ name: string; color: string; line: number; ch: number } | null>(null);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeFile = files[activeFileName];

  // Code runner sandbox
  const runCode = () => {
    setIsRunning(true);
    setTerminalOutput(prev => [...prev, 'Running script...']);

    // Capture console.log
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };

    try {
      // Mock require by resolving the internal files content
      const executeScript = () => {
        // Build mock exports
        const modules: Record<string, any> = {};
        
        // Resolve helper module first
        const mathUtilsCode = files['math_utils.js'].content;
        const mathModule = { exports: {} };
        const mathFn = new Function('module', 'exports', mathUtilsCode);
        mathFn(mathModule, mathModule.exports);
        modules['./math_utils.js'] = mathModule.exports;

        // Custom require
        const mockRequire = (path: string) => {
          if (modules[path]) return modules[path];
          throw new Error(`Cannot find module '${path}'`);
        };

        // Run main code
        const codeToRun = files[activeFileName].content;
        const runnable = new Function('require', 'module', 'console', codeToRun);
        runnable(mockRequire, { exports: {} }, console);
      };

      executeScript();
      
      setTerminalOutput(prev => [
        ...prev,
        ...logs,
        `\nProcess exited with status 0`
      ]);
    } catch (err: any) {
      setTerminalOutput(prev => [
        ...prev,
        ...logs,
        `❌ Runtime Error: ${err.message}`
      ]);
      
      // Trigger Socratic mentor automatically on execution error!
      if (onSocraticTrigger) {
        onSocraticTrigger({
          title: "Runtime Debugging Insight",
          hint: `It looks like your code encountered an error: "${err.message}". Socratic question: What state conditions could trigger this error, and how might we safeguard against them?`,
          code: activeFile.content
        });
      }
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  // Handle Editor Mounted
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Handle editor text change
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(prev => ({
      ...prev,
      [activeFileName]: {
        ...prev[activeFileName],
        content: value
      }
    }));
  };

  // Simulate collaborative editing and cursor movement
  useEffect(() => {
    if (isSimulatingCollaborator) {
      let step = 0;
      setCursorInfo({ name: 'Bob', color: '#a855f7', line: 11, ch: 1 });

      simTimerRef.current = setInterval(() => {
        if (!editorRef.current || !monacoRef.current) return;
        // (monaco unused)

        step++;
        
        // Move Bob's cursor to different lines
        if (step === 1) {
          setCursorInfo({ name: 'Bob', color: '#a855f7', line: 12, ch: 5 });
        } else if (step === 2) {
          // Bob adds a console log comment at line 13
          setFiles(prev => {
            const mainContent = prev['main.js'].content;
            const lines = mainContent.split('\n');
            lines.splice(13, 0, 'console.log("🤖 Bob says: Live collab is working!");');
            return {
              ...prev,
              'main.js': {
                ...prev['main.js'],
                content: lines.join('\n')
              }
            };
          });
          setCursorInfo({ name: 'Bob', color: '#a855f7', line: 14, ch: 10 });
        } else if (step === 3) {
          setCursorInfo({ name: 'Bob', color: '#a855f7', line: 16, ch: 2 });
        } else if (step === 4) {
          // Bob adds a function comment
          setFiles(prev => {
            const mainContent = prev['main.js'].content;
            const lines = mainContent.split('\n');
            lines.push('\n// Collaborative branch check: finished editing.');
            return {
              ...prev,
              'main.js': {
                ...prev['main.js'],
                content: lines.join('\n')
              }
            };
          });
          setCursorInfo({ name: 'Bob', color: '#a855f7', line: 20, ch: 1 });
          setIsSimulatingCollaborator(false);
        }
      }, 2500);
    } else {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
      }
      setCursorInfo(null);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulatingCollaborator]);

  // Render Monaco Editor decorations for Collaborative Cursors
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Clear old decorations
    if (decorationIdsRef.current.length > 0) {
      editor.removeDecorations(decorationIdsRef.current);
      decorationIdsRef.current = [];
    }

    if (cursorInfo && activeFileName === 'main.js') {
      // position unused
      const range = new monaco.Range(cursorInfo.line, cursorInfo.ch, cursorInfo.line, cursorInfo.ch + 1);

      // Create cursor decoration classes dynamically in style sheet
      let styleElement = document.getElementById('bob-cursor-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'bob-cursor-style';
        styleElement.innerHTML = `
          .bob-cursor {
            background-color: #a855f7;
            width: 2px !important;
          }
          .bob-cursor-tooltip::after {
            content: "${cursorInfo.name}";
            position: absolute;
            background: #a855f7;
            color: #fff;
            padding: 2px 6px;
            font-size: 10px;
            border-radius: 3px;
            top: -20px;
            left: 0;
            white-space: nowrap;
            z-index: 10;
            font-family: sans-serif;
            pointer-events: none;
          }
        `;
        document.head.appendChild(styleElement);
      } else {
        styleElement.innerHTML = `
          .bob-cursor {
            background-color: #a855f7;
            width: 2px !important;
          }
          .bob-cursor-tooltip::after {
            content: "${cursorInfo.name}";
            position: absolute;
            background: #a855f7;
            color: #fff;
            padding: 2px 6px;
            font-size: 10px;
            border-radius: 3px;
            top: -20px;
            left: 0;
            white-space: nowrap;
            z-index: 10;
            font-family: sans-serif;
            pointer-events: none;
          }
        `;
      }

      const newDecorations = editor.deltaDecorations([], [
        {
          range: range,
          options: {
            className: 'bob-cursor-tooltip',
            glyphMarginClassName: '',
            hoverMessage: { value: `${cursorInfo.name} is typing...` },
            inlineClassName: 'bob-cursor',
            isWholeLine: false
          }
        }
      ]);

      decorationIdsRef.current = newDecorations;
    }
  }, [cursorInfo, activeFileName]);

  return (
    <div className="flex-1 flex overflow-hidden relative z-10">
      
      {/* File Explorer sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Folder size={14} className="text-cyan-400" /> File Explorer
            </span>
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {Object.keys(files).map((name) => {
              const isActive = name === activeFileName;
              return (
                <button
                  key={name}
                  onClick={() => setActiveFileName(name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
                    isActive 
                      ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-800/30' 
                      : 'text-slate-300 hover:bg-slate-900/50 hover:text-white border border-transparent'
                  }`}
                >
                  <FileCode size={16} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Presence Widget */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} className="text-purple-400" /> Collaboration
            </span>
            <span className="badge badge-purple scale-90">Live Sync</span>
          </div>
          <div className="space-y-3 mt-3">
            <button
              onClick={() => setIsSimulatingCollaborator(!isSimulatingCollaborator)}
              className={`w-full py-1.5 px-3 rounded text-xs font-medium border transition-all ${
                isSimulatingCollaborator 
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isSimulatingCollaborator ? 'Stop Live Collab' : 'Simulate Bob typing'}
            </button>
            <div className="text-[10px] text-slate-500 text-center italic">
              Yjs CRDT syncing {isSimulatingCollaborator ? 'active' : 'idle'}
            </div>
          </div>
        </div>
      </div>

      {/* Main editor & terminal layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Editor tab header / Toolbar */}
        <div className="h-12 border-b border-slate-800 bg-slate-950/60 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded text-slate-400 border border-slate-800">
              {activeFile.language.toUpperCase()}
            </span>
            <span className="text-xs text-slate-300 font-mono">{activeFileName}</span>
            {isSimulatingCollaborator && activeFileName === 'main.js' && (
              <span className="badge badge-purple scale-90 flex items-center gap-1 animate-pulse">
                Bob is editing
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick AI Trigger */}
            <button
              onClick={() => {
                if (onSocraticTrigger) {
                  onSocraticTrigger({
                    title: "Optimization Challenge",
                    hint: "Take a look at `math_utils.js` or `mentor_tutor.js`. Socratic query: Could this algorithm scale? How might we evaluate code efficiency?",
                    code: activeFile.content
                  });
                }
              }}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-cyan-400" />
              Socratic Review
            </button>

            <button
              onClick={runCode}
              disabled={isRunning}
              className="btn-primary py-1.5 px-4 text-xs"
            >
              <Play size={14} />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 relative overflow-hidden bg-[#0e111a]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={activeFile.language}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap: { enabled: false },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
              },
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 12 }
            }}
          />
        </div>

        {/* Running Terminal Console */}
        <div className="h-56 border-t border-slate-800 bg-slate-950/80 flex flex-col">
          <div className="h-9 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-950/40">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TerminalIcon size={12} className="text-emerald-400" /> Sandboxed Compiler Console
            </span>
            <button
              onClick={() => setTerminalOutput(['Console cleared.'])}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Console
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300 space-y-1 custom-scrollbar bg-[#05070e]">
            {terminalOutput.map((log, idx) => (
              <div key={idx} className={log.startsWith('❌') ? 'text-rose-400' : log.startsWith('✅') ? 'text-emerald-400' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
