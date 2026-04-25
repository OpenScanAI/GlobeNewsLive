'use client';

import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_ACTIONS = [
  { label: 'Situation', icon: '🌍', query: "Summarize today's geopolitical situation" },
  { label: 'Markets', icon: '📈', query: 'Key market moves and macro signals today' },
  { label: 'Conflicts', icon: '⚔️', query: 'Top active conflicts and military developments' },
  { label: 'Risk', icon: '⚠️', query: 'Highest risk countries and instability hotspots' },
  { label: 'Hormuz', icon: '🚢', query: 'Strait of Hormuz situation and oil flow status' },
  { label: 'Iran', icon: '🇮🇷', query: 'Latest Iran developments and nuclear situation' },
];

const DOMAINS = ['All', 'Geo', 'Market', 'Military', 'Economic'];

export default function ChatAnalystPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('All');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = `You are an elite intelligence analyst with expertise in geopolitics, military affairs, markets, and global security. Domain focus: ${domain}. Be concise, analytical, and actionable. Use bullet points for clarity. Current date: ${new Date().toUTCString()}.`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'No response received.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Analysis unavailable. Check connection or API key.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-panel rounded-lg border border-border-default overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-elevated/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-accent-green">🧠 INTEL ANALYST</span>
          <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          {DOMAINS.map(d => (
            <button key={d} onClick={() => setDomain(d)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition-all ${domain===d?'bg-accent-green/20 text-accent-green border border-accent-green/30':'text-text-dim hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-subtle overflow-x-auto scrollbar-none">
        {QUICK_ACTIONS.map(a => (
          <button key={a.label} onClick={() => sendMessage(a.query)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[8px] font-mono text-text-dim hover:text-white transition-all whitespace-nowrap flex-shrink-0">
            <span>{a.icon}</span><span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <span className="text-4xl">🧠</span>
            <div>
              <p className="text-[11px] font-mono text-white/70 font-bold">Intelligence Analyst</p>
              <p className="text-[9px] text-text-dim mt-1">Ask about geopolitics, markets, conflicts, or click a quick action above</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${m.role==='user'?'bg-accent-blue/20':'bg-accent-green/20'}`}>
              {m.role==='user'?'👤':'🧠'}
            </div>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[10px] font-mono leading-relaxed whitespace-pre-wrap ${
              m.role==='user'
                ? 'bg-accent-blue/10 border border-accent-blue/20 text-white/90 ml-auto'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/80'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center text-[10px]">🧠</div>
            <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <div className="flex items-center gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border-subtle">
        <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg border border-white/[0.08] px-3 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask the analyst..."
            className="flex-1 bg-transparent text-[10px] font-mono text-white placeholder-text-dim outline-none"
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="px-2 py-1 rounded bg-accent-green/20 hover:bg-accent-green/30 text-accent-green text-[9px] font-mono disabled:opacity-30 transition-all">
            {loading ? '...' : 'ASK'}
          </button>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="mt-1 text-[8px] font-mono text-text-dim hover:text-white transition-colors">
            Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}
