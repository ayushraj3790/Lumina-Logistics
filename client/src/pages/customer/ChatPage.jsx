import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../../services/api';
import { FiSend } from 'react-icons/fi';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Lumina AI. Ask me about tracking, booking, or delivery statuses.' },
  ]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const { data } = await chatAPI.send({ message: userMsg, chatId });
      setChatId(data.chat._id);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col card">
      <h1 className="text-xl font-bold mb-4">Lumina AI Assistant</h1>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-lumina-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Thinking...</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input className="input-field flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your shipment..." />
        <button type="submit" className="btn-primary p-3"><FiSend /></button>
      </form>
    </div>
  );
}
