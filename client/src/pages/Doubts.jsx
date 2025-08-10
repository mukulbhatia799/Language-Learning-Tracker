import { useEffect, useRef, useState } from 'react';
import Typewriter from 'typewriter-effect/dist/core';
import * as doubts from '../services/doubts';
import toast from 'react-hot-toast';

export default function DoubtsPage() {
  // ---------- Ask AI ----------
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  const twContainerRef = useRef(null);
  const twInstanceRef = useRef(null);
  const typingSeq = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  useEffect(() => () => {
    if (twInstanceRef.current) {
      try { twInstanceRef.current.stop(); } catch {}
      twInstanceRef.current = null;
    }
  }, []);

  async function submitAI(e) {
    e.preventDefault();
    if (aiLoading) return;
    const question = aiInput.trim();
    if (!question) return;

    setAiMessages(prev => [...prev, { role: 'user', text: question }]);
    setAiInput('');
    setAiLoading(true);
    typingSeq.current += 1;

    if (twInstanceRef.current) {
      try { twInstanceRef.current.stop(); } catch {}
      twInstanceRef.current = null;
    }

    try {
      const { answer } = await doubts.askAI({ question });
      setAiMessages(prev => [...prev, { role: 'ai', text: '', html: true }]);
      requestAnimationFrame(() => {
        if (!twContainerRef.current) return;
        const mySeq = typingSeq.current;
        const tw = new Typewriter(twContainerRef.current, { delay: 25 });
        twInstanceRef.current = tw;
        tw.typeString(answer)
          .callFunction(() => {
            if (mySeq !== typingSeq.current) {
              try { tw.stop(); } catch {}
            }
          })
          .start();
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'AI failed');
    } finally {
      setAiLoading(false);
    }
  }

  // ---------- Ask Tutor ----------
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [relatedTest, setRelatedTest] = useState('');
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [ts, opt] = await Promise.all([
          doubts.listTutors(),     // GET /doubts/tutors
          doubts.testsOptions(),   // GET /doubts/tests-options
        ]);
        setTutors(ts);
        // Merge available + completed for the dropdown (or keep separate if you like)
        setAvailableTests([...(opt?.available || []), ...(opt?.completed || [])]);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load tutors or test options');
      }
    })();
  }, []);


  async function submitTutor(e) {
    e.preventDefault();
    if (!tutorQuestion.trim()) return;
    try {
      await doubts.askTutor({
        tutorId: selectedTutor,
        testId: relatedTest,
        question: tutorQuestion
      });
      toast.success('Doubt sent to tutor');
      setTutorQuestion('');
      setSelectedTutor('');
      setRelatedTest('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send doubt');
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Doubts</h1>

      {/* Ask AI */}
      <div className="card space-y-3">
        <div className="text-md font-semibold">Ask AI</div>
        <div className="h-64 overflow-y-auto space-y-2 bg-slate-900/40 rounded-xl p-3 border border-white/5">
          {aiMessages.length === 0 && (
            <div className="text-xs text-slate-400">
              Ask anything about your language learning. The AI will reply concisely.
            </div>
          )}
          {aiMessages.map((m, i) => {
            const isAI = m.role === 'ai';
            return (
              <div key={i} className={`flex ${isAI ? '' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${isAI ? 'bg-slate-800 text-slate-100' : 'bg-emerald-600 text-white'}`}>
                  {isAI && m.html ? (
                    <div ref={i === aiMessages.length - 1 ? twContainerRef : null} />
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            );
          })}
          {aiLoading && (
            <div className="flex">
              <div className="text-xs text-slate-400 italic px-2 py-1">AI is thinking…</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={submitAI} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type your doubt for AI…"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <button className="btn btn-primary" disabled={aiLoading}>
            {aiLoading ? 'Thinking…' : 'Ask AI'}
          </button>
        </form>
      </div>

      {/* Ask Tutor */}
      <div className="card space-y-3">
        <div className="text-md font-semibold">Ask Tutor</div>
        <form onSubmit={submitTutor} className="space-y-3">
          <select
            className="input w-full"
            value={selectedTutor}
            onChange={(e) => setSelectedTutor(e.target.value)}
          >
            <option value="">Select Tutor</option>
            {tutors.map(t => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>

          <select
            className="input w-full"
            value={relatedTest}
            onChange={(e) => setRelatedTest(e.target.value)}
          >
            <option value="">Select Related Test</option>
            {availableTests.map(t => (
              <option key={t._id} value={t._id}>
                {t.title} — {t.language}
              </option>
            ))}
          </select>

          <textarea
            className="input w-full"
            rows="3"
            placeholder="Type your doubt for the tutor…"
            value={tutorQuestion}
            onChange={(e) => setTutorQuestion(e.target.value)}
          />

          <button className="btn btn-primary w-full">Send to Tutor</button>
        </form>
      </div>
    </div>
  );
}
