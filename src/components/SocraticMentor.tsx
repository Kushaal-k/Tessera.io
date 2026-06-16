import React, { useState } from 'react';
import { 
  Sparkles, Send, BrainCircuit, BookOpen, 
  HelpCircle, ChevronRight, CheckCircle, Award, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface SocraticMentorProps {
  incomingPrompt?: { title: string; hint: string; code: string } | null;
}

export const SocraticMentor: React.FC<SocraticMentorProps> = ({ incomingPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Greetings, coder. I am your Socratic Mentor. Rather than giving you straight answers, I am here to prompt your thinking. What portion of the codebase are we analyzing today?",
      timestamp: '20:30'
    }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'scaffold' | 'analytics'>('chat');
  const [scaffoldProgress, setScaffoldProgress] = useState<'question' | 'success' | 'incorrect'>('question');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Socratic Quiz definition
  const QUIZ = {
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      // ??? - What goes here to search right half?
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
    question: "Which of the following lines should fill the `// ???` comment block to ensure correctness and binary division?",
    options: [
      "left = mid;",
      "left = mid + 1;",
      "right = mid + 1;",
      "left = left + 1;"
    ],
    correctIdx: 1,
    explanation: "Excellent! Since the array is sorted and `arr[mid]` is less than our target, the target must reside in the strictly right half. So we narrow our search window by moving the left pointer to `mid + 1`."
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query, timestamp: '20:31' } as Message];
    setMessages(newMsgs);
    setInputValue('');

    // Socratic response logic
    setTimeout(() => {
      let aiResponse = "Interesting perspective. How does that choice affect the scalability of your call stack?";
      
      const lowercase = query.toLowerCase();
      if (lowercase.includes('main.js') || lowercase.includes('complexity')) {
        aiResponse = "In `main.js`, we see a linear execution flow. But if we put it inside a loop of size N, what happens? How would we structure the imports to keep memory complexity O(1)?";
      } else if (lowercase.includes('help') || lowercase.includes('error')) {
        aiResponse = "When debugging an execution error, what is the first state variable you inspect? If the variable is undefined, does the error lie in creation or import resolution?";
      } else if (lowercase.includes('algorithm')) {
        aiResponse = "To build a robust algorithm, we must identify base conditions. In binary search, what would happen to our loop if our left and right pointers crossed?";
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponse,
        timestamp: '20:31'
      }]);
    }, 1200);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;

    if (selectedAnswer === QUIZ.correctIdx) {
      setScaffoldProgress('success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#6366f1', '#10b981']
      });
    } else {
      setScaffoldProgress('incorrect');
    }
  };

  // If a prompt is triggered externally (from Monaco Editor)
  React.useEffect(() => {
    if (incomingPrompt) {
      setActiveTab('chat');
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🔍 [Live Alert Triggered] ${incomingPrompt.title}\n\n${incomingPrompt.hint}`,
          timestamp: '20:31'
        }
      ]);
    }
  }, [incomingPrompt]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative z-10">
      
      {/* Socratic Navigation tab header */}
      <div className="h-12 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-cyan-400" size={18} />
          <span className="text-sm font-semibold">Socratic Mentor AI</span>
        </div>
        <div className="flex bg-slate-900 border border-slate-800/80 rounded-lg p-0.5 scale-90">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'chat' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Socratic Chat
          </button>
          <button
            onClick={() => setActiveTab('scaffold')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'scaffold' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Code Scaffolds
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'analytics' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Main Body depending on Tab */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between custom-scrollbar bg-slate-950/20">
        
        {activeTab === 'chat' && (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-500 px-1">
                    <span>{msg.sender === 'ai' ? 'Socratic Mentor AI' : 'You'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`chat-bubble whitespace-pre-wrap ${
                      msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Socratic Prompt suggestions */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-1">Suggested inquiries</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSendMessage("Why did my sandbox throw an error?")}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs rounded-md text-slate-300 hover:border-slate-700 transition-colors"
                >
                  ❓ Sandbox Debug
                </button>
                <button
                  onClick={() => handleSendMessage("Explain the complexity of main.js")}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs rounded-md text-slate-300 hover:border-slate-700 transition-colors"
                >
                  📈 Time Complexity
                </button>
                <button
                  onClick={() => handleSendMessage("How do I structure algorithm module exports?")}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs rounded-md text-slate-300 hover:border-slate-700 transition-colors"
                >
                  📦 Module Exports
                </button>
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border border-slate-800 bg-slate-950/80 rounded-lg p-1.5 mt-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pose a coding query or answer a mentor hint..."
                  className="flex-1 bg-transparent text-sm text-slate-200 outline-none px-2 py-1 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-md transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'scaffold' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Scaffold Challenge: Complete Binary Search</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fill the missing statement in the binary search implementation to adjust the boundary window correctly.
              </p>

              {/* Quiz Code window */}
              <div className="terminal-container p-3 text-xs bg-slate-950 font-mono border border-slate-800">
                <pre>{QUIZ.code}</pre>
              </div>

              {/* Question & options */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-start gap-1">
                  <HelpCircle size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>{QUIZ.question}</span>
                </div>
                
                <div className="space-y-2">
                  {QUIZ.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (scaffoldProgress === 'question') {
                            setSelectedAnswer(idx);
                          }
                        }}
                        disabled={scaffoldProgress !== 'question'}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono">{option}</span>
                        <ChevronRight size={12} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit button / Quiz outcomes */}
            <div className="mt-6">
              {scaffoldProgress === 'question' && (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                  className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Award size={14} /> Submit Scaffolding Answer
                </button>
              )}

              {scaffoldProgress === 'success' && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                    <CheckCircle size={16} /> Solution Validated!
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">{QUIZ.explanation}</p>
                  <button
                    onClick={() => {
                      setScaffoldProgress('question');
                      setSelectedAnswer(null);
                    }}
                    className="btn-secondary py-1.5 px-3 text-[11px]"
                  >
                    Reset Challenge
                  </button>
                </div>
              )}

              {scaffoldProgress === 'incorrect' && (
                <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-lg text-xs">
                  <div className="flex items-center gap-2 text-rose-400 font-bold mb-1.5">
                    <AlertCircle size={16} /> Compilation Fails / Incorrect Answer
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    Think about the binary search split. If `arr[mid] &lt; target`, the target is larger. Thus we must discard the left half. Does your option shift the left bound?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScaffoldProgress('question')}
                      className="btn-primary py-1.5 px-3 text-[11px]"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setScaffoldProgress('question');
                        setSelectedAnswer(QUIZ.correctIdx);
                      }}
                      className="btn-secondary py-1.5 px-3 text-[11px]"
                    >
                      Show Hint
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-semibold mb-2">Cognitive Development Metrics</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Telemetry charting how the Socratic questions are improving your code conceptualization.
              </p>
            </div>

            {/* Skill Matrix Visualizer */}
            <div className="space-y-4">
              {/* Skill 1 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Algorithmic Efficiency</span>
                  <span className="text-cyan-400 font-bold">Level 8 (82%)</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              {/* Skill 2 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Runtime Debugging</span>
                  <span className="text-purple-400 font-bold">Level 5 (54%)</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              {/* Skill 3 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">System Architecture Design</span>
                  <span className="text-emerald-400 font-bold">Level 6 (65%)</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              {/* Skill 4 */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">Modular Composition</span>
                  <span className="text-amber-400 font-bold">Level 9 (90%)</span>
                </div>
                <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>

            {/* Achievement Badge List */}
            <div className="border-t border-slate-800 pt-4 mt-6">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Academic Achievements</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex flex-col items-center text-center">
                  <Award size={20} className="text-cyan-400 mb-1" />
                  <div className="text-[10px] font-bold text-slate-200">Asymptotic Master</div>
                  <div className="text-[8px] text-slate-500">Analyze 10 Big-O runs</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg flex flex-col items-center text-center">
                  <Sparkles size={20} className="text-purple-400 mb-1" />
                  <div className="text-[10px] font-bold text-slate-200">Scaffold Explorer</div>
                  <div className="text-[8px] text-slate-500">Perfect scaffolding quiz</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
