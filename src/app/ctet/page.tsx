'use client';

import React, { useState } from 'react';
import AdBanner from '@/components/ads/AdUnit';
import Image from 'next/image';
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">

      {/* Top nav */}
      <nav className="border-b border-slate-800 px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/Logos/logo-icon_dark-Photoroom.png" alt="Prepify" width={80} height={28} style={{ height: 28, width: 'auto', flexShrink: 0 }} />
          <span className="text-slate-100 font-bold tracking-tight text-sm">Prepify</span>
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider hidden sm:block">/ CTET</span>
        </div>
        <a href="/" className="text-slate-600 hover:text-slate-400 text-xs transition">← Home</a>
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

          <div className="mt-6 pt-4 border-t border-slate-800">
            <AdBanner />
          </div>
        </div>

        {/* ── Guide content (SEO + value) ── */}
        <article className="mt-12 max-w-3xl mx-auto text-left text-slate-300 leading-relaxed space-y-8 px-2">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">CTET 2026: A Complete Guide</h2>
            <p>
              The Central Teacher Eligibility Test (CTET) is a national-level exam conducted by the Central Board of
              Secondary Education (CBSE) twice a year. A valid CTET certificate is mandatory for teaching posts in
              central government schools such as Kendriya Vidyalayas (KVS), Navodaya Vidyalayas (NVS), and many
              private and state schools that accept it.
            </p>
            <p className="mt-3">
              Prepify offers free, unlimited CTET mock tests in a real exam-like interface, in Hindi and English, so
              you can practise exactly the way you&apos;ll attempt the actual paper.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">CTET Exam Pattern</h3>
            <p>
              CTET has two papers. <strong className="text-white">Paper I</strong> is for aspiring teachers of Classes
              1–5; <strong className="text-white">Paper II</strong> is for Classes 6–8. Each paper has 150 MCQs for
              150 marks in 2 hours 30 minutes, with <strong className="text-white">no negative marking</strong>.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><strong className="text-white">Paper I:</strong> Child Development &amp; Pedagogy, Language I, Language II, Mathematics, Environmental Studies — 30 marks each.</li>
              <li><strong className="text-white">Paper II:</strong> Child Development &amp; Pedagogy, Language I, Language II, and Mathematics &amp; Science or Social Studies (60 marks).</li>
            </ul>
            <p className="mt-3">
              Full details on our <a href="/ctet/syllabus" className="text-emerald-400 underline">CTET Syllabus 2026</a> page.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">How to Prepare for CTET</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong className="text-white">Prioritise Child Development &amp; Pedagogy.</strong> 30 marks of conceptual, scoring questions — master the major learning theories and their classroom application.</li>
              <li><strong className="text-white">Drill previous year papers.</strong> CTET reuses themes heavily; our <a href="/ctet/previous-year-papers" className="text-emerald-400 underline">CTET previous year papers</a> are the fastest way to learn the pattern.</li>
              <li><strong className="text-white">Take timed full mocks</strong> on Prepify to build exam temperament and time management.</li>
              <li><strong className="text-white">Score the language sections</strong> — comprehension and pedagogy questions are reliable, high-return marks.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium">Are CTET mock tests on Prepify free?</p>
                <p>Yes — subject-wise practice, full mocks and previous year papers are all free.</p>
              </div>
              <div>
                <p className="text-white font-medium">What is the qualifying mark for CTET?</p>
                <p>You need 60% (90 out of 150) to qualify. There is no category-based relaxation in the qualifying percentage at the central level.</p>
              </div>
              <div>
                <p className="text-white font-medium">How long is the CTET certificate valid?</p>
                <p>The CTET certificate is now valid for a lifetime.</p>
              </div>
              <div>
                <p className="text-white font-medium">How many times is CTET held each year?</p>
                <p>CBSE typically conducts CTET twice a year, usually around July and December.</p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
