import { FileText, Edit3 } from 'lucide-react';

export const AIDocumentation = () => {
  return (
    <div className="flex-1 flex flex-col p-6 h-full relative z-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="text-amber-400" size={24} />
          AI Documentation Platform
        </h2>
        <p className="text-sm text-slate-400">Phase 9: Auto-generated READMEs & Architecture Diagrams</p>
      </div>

      <div className="glass-panel p-6 border border-slate-800 rounded-xl bg-slate-950/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-200">Generated API Ref: AuthService</h3>
          <button className="btn-secondary py-1 px-3 text-xs"><Edit3 size={14}/> Edit Draft</button>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded font-mono text-xs text-slate-300 space-y-2">
          <div className="text-amber-400 font-bold">POST /api/v1/auth/login</div>
          <div>Authenticates a user and returns a JWT session token.</div>
          <div className="mt-2 text-slate-500">Parameters:</div>
          <ul className="list-disc pl-5">
            <li><span className="text-cyan-400">email</span> (string): The user's registered email address.</li>
            <li><span className="text-cyan-400">password</span> (string): Plaintext password (hashed securely on transit).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
