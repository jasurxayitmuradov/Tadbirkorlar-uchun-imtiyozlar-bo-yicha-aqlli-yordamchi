import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { Message, UserProfile, ContextPayload } from '../types';
import { sendMessageToAI } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatPage: React.FC = () => {
  const profile: UserProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const contextPayload: ContextPayload | undefined = (() => {
    try {
      const raw = localStorage.getItem('legal_context');
      if (!raw) return undefined;
      return JSON.parse(raw) as ContextPayload;
    } catch {
      return undefined;
    }
  })();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Assalomu alaykum, ${profile.name}! Men sizning biznes yuristingizman. \n\nSizning hududingiz (${profile.region}) bo'yicha qanday yordam bera olaman?\n\nMasalan: "Mening hududimda qanday soliq imtiyozlari bor?"`,
      sender: 'ai',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => {
    const prefill = localStorage.getItem('chat_prefill');
    if (prefill) {
      setInput(prefill);
      localStorage.removeItem('chat_prefill');
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToAI(input, profile, messages, contextPayload);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'ai',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const suggestions = [
    "Soliq imtiyozlari qanday?",
    "Eksport uchun subsidiya bormi?",
    "Kredit olish tartibi",
    "Yangi qarorlar"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.sender === 'ai' ? 'bg-ion-600 text-white shadow-lg shadow-ion-500/40' : 'bg-slate-700 text-slate-300'}
            `}>
              {msg.sender === 'ai' ? <Sparkles size={20} /> : <User size={20} />}
            </div>
            
            <div className={`
              max-w-[80%] p-4 rounded-2xl
              ${msg.sender === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-sm' 
                : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-sm'}
            `}>
               {msg.sender === 'ai' ? (
                 <div className="prose prose-invert prose-sm max-w-none markdown-body">
                   <ReactMarkdown
                     remarkPlugins={[remarkGfm]}
                     components={{
                       a: ({ href, children }) => (
                         <a
                           href={href}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-ion-400 underline underline-offset-2 hover:text-ion-300"
                         >
                           {children}
                         </a>
                       ),
                     }}
                   >
                     {msg.text}
                   </ReactMarkdown>
                 </div>
               ) : (
                 <p>{msg.text}</p>
               )}
               <span className="text-[10px] text-slate-500 mt-2 block opacity-70">
                 {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-ion-600 flex items-center justify-center animate-pulse">
              <Bot size={20} />
            </div>
            <div className="bg-slate-900/50 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Checking legal database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-4">
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-ion-400 border border-ion-500/20 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about official benefits..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-ion-500 focus:ring-1 focus:ring-ion-500 shadow-lg"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-ion-600 hover:bg-ion-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-600">
          AI answers based on whitelisted laws. Verify with official text.
        </p>
      </div>
    </div>
  );
};
