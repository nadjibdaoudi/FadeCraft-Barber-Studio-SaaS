import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  X, 
  RotateCcw, 
  Minimize2, 
  Maximize2, 
  Scissors, 
  Briefcase, 
  Zap, 
  Clock, 
  Copy, 
  Check, 
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export type AssistantRole = 'concierge' | 'barber' | 'strategist';

export const ChatbotAssistant: React.FC<{ isEmbeddedView?: boolean }> = ({ isEmbeddedView = false }) => {
  const { 
    barbers, 
    services, 
    walkIns, 
    inventory, 
    lowStockCount, 
    appointments 
  } = useSalon();

  const [isOpen, setIsOpen] = useState(isEmbeddedView);
  const [isMinimized, setIsMinimized] = useState(false);
  const [role, setRole] = useState<AssistantRole>('concierge');
  const [model, setModel] = useState<string>('gemini-3.8-flash');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I'm your **FadeCraft Studio AI Assistant**. 

I can help coordinate appointments, check walk-in wait times, consult on haircut formulas, or analyze chair turnover and inventory. 

How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const suggestedPrompts = [
    {
      label: 'Walk-in Availability',
      prompt: 'Who is the next available barber for a walk-in skin fade right now?',
      role: 'concierge' as AssistantRole,
      model: 'gemini-3.1-flash-lite'
    },
    {
      label: 'Critical Supplies Alert',
      prompt: 'Which barber supplies are critically low and need immediate restock from suppliers?',
      role: 'strategist' as AssistantRole,
      model: 'gemini-3.8-flash'
    },
    {
      label: 'Cut Formula Guide',
      prompt: 'What guard progression and texture techniques do you recommend for a low taper fade on coarse hair?',
      role: 'barber' as AssistantRole,
      model: 'gemini-3.8-flash'
    },
    {
      label: 'Revenue & Turnaround Analysis',
      prompt: 'Analyze our chair turnaround pace (34m 12s) and suggest 3 ways to reach our $240k annual goal faster.',
      role: 'strategist' as AssistantRole,
      model: 'gemini-3.8-flash'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Package live salon context for the Gemini assistant
      const salonContext = {
        walkInCount: walkIns.length,
        lowStockCount,
        totalBarbers: barbers.length,
        appointmentsCount: appointments.length,
        activeBarbers: barbers.map(b => `${b.name} (Chair #${b.chairNumber} - ${b.status})`).join(', ')
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          role,
          model,
          salonContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-reply',
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || model
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-err',
        role: 'assistant',
        content: `I encountered an issue connecting to the AI server: ${err.message || 'Please verify the API configuration'}. You can try again or switch to a faster model.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        content: 'Conversation history reset. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // If used as full page view
  if (isEmbeddedView) {
    return (
      <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6 h-[calc(100vh-5rem)]">
        {/* Full view implementation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col flex-1 overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-[#FEE500] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Gemini Salon AI Assistant</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Server Intelligence
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Multi-turn conversational assistant with studio context, role personas, and intelligent model routing.
                </p>
              </div>
            </div>

            {/* Controls: Persona + Model + Clear */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Persona selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setRole('concierge')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    role === 'concierge' ? 'bg-black text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Concierge</span>
                </button>
                <button
                  onClick={() => setRole('barber')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    role === 'barber' ? 'bg-black text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Barber Craft</span>
                </button>
                <button
                  onClick={() => setRole('strategist')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    role === 'strategist' ? 'bg-black text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Strategist</span>
                </button>
              </div>

              {/* Model Selector */}
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (General Intelligence)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Response)</option>
              </select>

              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages scrollable area */}
          <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-4 pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${
                  m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-black text-[#FEE500] shadow-2xs'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-1 max-w-2xl">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-black text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 font-mono px-1 ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{m.timestamp}</span>
                    {m.modelUsed && (
                      <>
                        <span>·</span>
                        <span>{m.modelUsed}</span>
                      </>
                    )}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-slate-600 transition-colors ml-1"
                        title="Copy text"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="self-start flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-xl bg-black text-[#FEE500] flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1 text-[11px] font-mono">Consulting {model}...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Suggestions:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRole(p.role);
                  setModel(p.model);
                  handleSendMessage(p.prompt);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <span>{p.label}</span>
                <span className="text-[10px] text-slate-400">→</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the ${role} assistant anything about bookings, waitlists, formulas, or revenue...`}
              className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:border-black"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-black hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Floating Widget Mode (Collapsible, present on any screen!)
  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-black hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 group border border-slate-700"
          title="Open Gemini AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-[#FEE500] text-black flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized 
              ? 'bottom-6 w-80 h-16' 
              : 'bottom-6 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#FEE500] text-black flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  FadeCraft AI Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{role} Mode · {model}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Persona and Model Bar */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
                {/* Persona selector */}
                <div className="flex items-center gap-1">
                  {(['concierge', 'barber', 'strategist'] as AssistantRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                        role === r ? 'bg-black text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Model dropdown */}
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="text-[10px] font-mono px-1.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700"
                >
                  <option value="gemini-3.8-flash">3.8-flash</option>
                  <option value="gemini-3.1-flash-lite">3.1-lite</option>
                </select>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      m.role === 'user'
                        ? 'bg-black text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs shadow-2xs'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-1 px-1">
                      <span>{m.timestamp}</span>
                      {m.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-slate-600 transition-colors ml-1"
                        >
                          {copiedId === m.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-2xl rounded-tl-xs max-w-[80%] text-xs text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-mono ml-1">Thinking with {model}...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                <button
                  onClick={() => handleSendMessage('Who is available for a walk-in right now?')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-black whitespace-nowrap"
                >
                  Next walk-in chair?
                </button>
                <button
                  onClick={() => handleSendMessage('Which supplies are below minimum threshold?')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-black whitespace-nowrap"
                >
                  Low-stock audit
                </button>
                <button
                  onClick={() => handleSendMessage('Suggest a guard formula for high skin fade')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-black whitespace-nowrap"
                >
                  Fade formula
                </button>
              </div>

              {/* Input Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask assistant..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-black"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-black hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
