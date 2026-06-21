'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CTET_SUBJECTS = [
  'Child Development',
  'Math',
  'EVS',
  'Science',
  'Hindi',
  'English',
  'Social Science'
];

export default function CtetLandingPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState('Child Development');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleStartExam = () => {
  setLoading(true);
  // Points to the isolated CTET exam space
  router.push(`/ctet/exam?subject=${encodeURIComponent(selectedSubject)}&limit=${questionCount}`);
};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
            No Registration Needed
          </span>
          <h1 className="text-3xl font-bold mt-3 tracking-tight">CTET Practice Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Select your syllabus and begin your mock pattern.</p>
        </div>

        <div className="space-y-4">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              {CTET_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Question Count Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 30, 50].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                    questionCount === count
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Start Test Button */}
          <button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Assembling Mock Test...' : 'Start Free Test 🚀'}
          </button>
        </div>

        {/* Interim Ad Placeholder Placement */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-950 rounded-xl h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800">
            {/* Adsterra script container tag will mount here organically */}
            Sponsored Advertisement Area
          </div>
        </div>
      </div>
    </div>
  );
}