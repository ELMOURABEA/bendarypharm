import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowRight, Loader2, Sparkles, PhoneCall, HelpCircle, MapPin, FileUp } from 'lucide-react';
import { Logo } from './Logo';

interface AIChatProps {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'أهلاً بك في صيدليات البنداري الذكية! 🌟 أنا الصيدلي الآلي المساعد الخاص بك، ومتوفر على مدار الساعة.\nيمكنني مساعدتك في:\n• الاستعلام عن أسعار وتوفر الأدوية ومستحضرات التجميل.\n• إرشادك لكيفية رفع الروشتة لطلب تحضيرها.\n• معرفة مواقع وعناوين الفروع وأرقام الطوارئ.\n• تقديم نصائح صحية مبسطة وجرعات الاستخدام الشائعة.\n\nكيف يمكنني مساعدتك اليوم؟' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { text: 'ما هي أسعار منتجات العناية بالبشرة؟', icon: <Sparkles size={14} className="text-pink-500" /> },
    { text: 'هل يتوفر جهاز قياس ضغط الدم وكم سعره؟', icon: <HelpCircle size={14} className="text-blue-500" /> },
    { text: 'أين تقع فروعكم في مصر؟', icon: <MapPin size={14} className="text-red-500" /> },
    { text: 'كيف يمكنني رفع وروشتة طبية وصرفها؟', icon: <FileUp size={14} className="text-emerald-500" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    // Save history prior to sending
    const currentHistory = [...messages];
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          history: currentHistory.map(m => ({ role: m.role, text: m.text }))
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ أثناء الاتصال بالوكيل الذكي. يرجى المحاولة مرة أخرى لاحقاً.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  return (
    <div id="ai-agent-chatbot" className="flex flex-col h-full bg-slate-50 mt-16 pb-16 md:pb-0" dir="rtl">
      {/* Header element with official Logo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-16 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={22} className="text-gray-700" />
          </button>
          
          {/* Logo element from image */}
          <Logo variant="icon" className="w-10 h-10 shrink-0" />
          
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-black text-gray-950 leading-tight text-sm md:text-base">البنداري الذكي (AI Agent)</h2>
              <span className="bg-red-50 text-[#CE1126] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-100">مساعد صيدلي</span>
            </div>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              متصل واستشاري - صيدليات البنداري (تأسست 1980)
            </p>
          </div>
        </div>
        
        <a 
          href="tel:01200400094" 
          className="flex items-center gap-1 text-[11px] font-bold text-[#CE1126] bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all shrink-0"
        >
          <PhoneCall size={12} />
          <span>اتصال سريع</span>
        </a>
      </div>

      {/* Message display viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mt-auto mb-1 shadow-sm ${
                msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-red-50 text-[#CE1126] border border-red-100'
              }`}>
                {msg.role === 'user' ? <User size={15} /> : <span className="font-black">B</span>}
              </div>
              <div 
                className={`p-3.5 rounded-2xl md:text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-br-none font-bold' 
                    : 'bg-white text-gray-900 border border-slate-150 rounded-bl-none shadow-sm'
                }`}
              >
                <div 
                   className="text-sm leading-relaxed" 
                   style={{ whiteSpace: 'pre-wrap' }}
                   dangerouslySetInnerHTML={{ 
                     __html: msg.text
                       .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#CE1126]">$1</strong>')
                       .replace(/\n/g, '<br />')
                   }} 
                />
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] flex-row gap-2">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-[#CE1126] border border-red-100 mt-auto mb-1">
                <span className="font-black text-xs">B</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-150 rounded-bl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="text-[#CE1126] animate-spin" />
                <span className="text-sm font-black text-zinc-500">يقوم البنداري الذكي بالتحضير والرد...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Suggestion Chips shown when there are no user messages, or as helpers on top */}
        {messages.length === 1 && (
          <div className="pt-4 space-y-2">
            <p className="text-[11px] font-bold text-zinc-500 pr-2">💡 أسئلة شائعة يمكنك طرحها على الصيدلي الآلي:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChipClick(chip.text)}
                  className="flex items-center gap-2.5 bg-white hover:bg-red-50 hover:border-red-200 border border-slate-200 p-3 rounded-xl text-right text-xs font-bold text-gray-800 transition-all shadow-xs"
                >
                  {chip.icon}
                  <span>{chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input container at the bottom */}
      <div className="bg-white border-t border-gray-200 p-3 pb-6 md:pb-3 sticky bottom-[64px] md:bottom-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب استفسارك الطبي أو اسأل عن توفر دواء هنا..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pr-4 pl-14 text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#CE1126] transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute left-1.5 top-1.5 bottom-1.5 bg-[#CE1126] hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#CE1126] transition-all"
          >
            <Send size={16} className="rotate-180" />
          </button>
        </form>
        <p className="text-[10px] text-zinc-400 text-center mt-2 font-medium">
          هذه الخدمة هي مجرد استرشاد بالذكاء الاصطناعي ومبنية على أحدث المراجع الطبية المعتمدة لصيدليات البنداري.
        </p>
      </div>
    </div>
  );
};
