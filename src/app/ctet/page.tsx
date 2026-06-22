'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CTET_SUBJECTS = [
  { label: 'Child Development & Pedagogy', value: 'Child Development and Pedagogy', emoji: '🧠' },
  { label: 'Mathematics', value: 'Mathematics', emoji: '📐' },
  { label: 'Environmental Studies', value: 'Environmental Studies', emoji: '🌿' },
  { label: 'Language I – English', value: 'Language I English', emoji: '📖' },
  { label: 'Language I – Hindi', value: 'Language I Hindi', emoji: '📝' },
  { label: 'Language II – English', value: 'Language II English', emoji: '📖' },
  { label: 'Language II – Hindi', value: 'Language II Hindi', emoji: '📝' },
];

const QUESTION_COUNTS = [5, 10, 30, 50];

export default function CtetLandingPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState(CTET_SUBJECTS[0].value);
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleStartExam = () => {
    setLoading(true);
    router.push(`/ctet/exam?subject=${encodeURIComponent(selectedSubject)}&limit=${questionCount}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* Top nav */}
      <nav className="border-b border-slate-800 px-4 md:px-10 py-4 flex items-center justify-between">
        <span className="text-emerald-400 font-bold tracking-wider text-sm">PREPIFY</span>
        <span className="text-xs text-slate-600 font-mono">CTET Practice</span>
      </nav>

      {/* Page body */}
      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-center gap-8 px-4 md:px-10 py-10 max-w-5xl mx-auto w-full">

        {/* Left: Hero text (desktop only) */}
        <div className="hidden md:block flex-1 pr-10">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            CTET Practice <br />
            <span className="text-emerald-400">Powered by AI</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-6">
            Free mock tests for all CTET subjects. Get instant AI-generated explanations for every question after you submit.
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-500">
            <span>✅ No registration needed</span>
            <span>✅ Hindi + English bilingual</span>
            <span>✅ Instant AI explanations</span>
            <span>✅ Weak topic tracking (coming soon)</span>
          </div>
        </div>

        {/* Right: Selection card */}
        <div className="w-full md:w-[400px] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shrink-0">

          {/* Mobile hero */}
          <div className="md:hidden text-center mb-6">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
              No Registration Needed
            </span>
            <h1 className="text-2xl font-bold mt-3 tracking-tight">CTET Practice Hub</h1>
            <p className="text-slate-400 text-sm mt-1">Select subject and start your mock test.</p>
          </div>

          {/* Subject selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Subject
            </label>
            <div className="space-y-1.5">
              {CTET_SUBJECTS.map((sub) => (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => setSelectedSubject(sub.value)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition flex items-center gap-2.5 ${
                    selectedSubject === sub.value
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <span className="text-base shrink-0">{sub.emoji}</span>
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                    questionCount === count
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 text-sm"
          >
            {loading ? 'Assembling Mock Test...' : 'Start Free Test 🚀'}
          </button>

          {/* Ad placeholder */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-950 rounded-xl h-24 flex items-center justify-center text-[10px] text-slate-700 border border-dashed border-slate-800 uppercase tracking-wider">
              Sponsored Advertisement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
