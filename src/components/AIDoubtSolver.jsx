import React, { useState } from 'react';
import { Brain } from 'lucide-react';


const AIDoubtSolver = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

 const handleAsk = async (e) => {
  e.preventDefault();
  if (!question.trim()) return;

  const userMessage = { type: 'user', text: question };
  setMessages(prev => [...prev, userMessage]);
  setQuestion('');
  setLoading(true);

  setTimeout(() => {
    const responses = [
      "AI stands for Artificial Intelligence.",
      "This is widely used in modern applications.",
      "Think of it as machines learning from data.",
      "Great question! Focus on real-world applications."
    ];

    const reply = responses[Math.floor(Math.random() * responses.length)];

    setMessages(prev => [...prev, { type: 'ai', text: reply }]);
    setLoading(false);
  }, 1000);
};
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Doubt Solver</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Get instant answers</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4 h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <p>Ask a question to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    msg.type === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all"
        >
          Ask
        </button>
      </form>
    </div>
  );
};

export default AIDoubtSolver;
