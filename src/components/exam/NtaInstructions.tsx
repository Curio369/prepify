'use client'
/**
 * NtaInstructions — a faithful replica of the NTA "General Instructions" page
 * shown before the exam (Prepify-branded header, English only). Includes the
 * mandatory "I have read…" declaration, a "don't show again" option, and the
 * NTA "Warning!" popup when the declaration isn't accepted.
 */
import { useState } from 'react'
import { ExamSkin } from '@/lib/examSkins'

function LegendIcon({ kind }: { kind: 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked' }) {
  const base = 'inline-grid place-items-center w-7 h-7 text-[11px] font-bold text-white shrink-0'
  if (kind === 'notVisited') return <span className={`${base} !text-slate-700`} style={{ background: '#d6dae0', border: '1px solid #b3b9c2', borderRadius: 3 }} />
  if (kind === 'notAnswered') return <span className={base} style={{ background: '#e0413b', clipPath: 'polygon(0 0,100% 0,100% 72%,50% 100%,0 72%)' }} />
  if (kind === 'answered') return <span className={base} style={{ background: '#22a447', clipPath: 'polygon(50% 0,100% 28%,100% 100%,0 100%,0 28%)' }} />
  if (kind === 'marked') return <span className={base} style={{ background: '#7b3fb5', borderRadius: '9999px' }} />
  return (
    <span className="relative inline-grid place-items-center w-7 h-7 shrink-0" style={{ background: '#7b3fb5', borderRadius: '9999px' }}>
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border border-white grid place-items-center text-[7px] text-white">✓</span>
    </span>
  )
}

export default function NtaInstructions({ skin, onProceed }: { skin: ExamSkin; onProceed: (dontShowAgain: boolean) => void }) {
  const [read, setRead] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [warn, setWarn] = useState(false)

  function proceed() {
    if (!read) { setWarn(true); return }
    onProceed(dontShowAgain)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-blue-700 text-white grid place-items-center font-bold">P</div>
          <div className="leading-tight">
            <div className="font-bold text-slate-800 text-sm">Prepify</div>
            <div className="text-[11px] text-slate-500">{skin.name} Mock Test</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 text-xs hidden sm:inline">Default Language</span>
          <span className="border border-slate-300 rounded px-3 py-1 bg-slate-50 text-slate-700 text-sm">English</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <h1 className="text-xl font-bold text-blue-800 mb-1">GENERAL INSTRUCTIONS</h1>
        <p className="text-center font-bold text-slate-800 my-4">Please read the instructions carefully</p>

        <ol className="list-decimal pl-5 space-y-2.5 text-sm leading-relaxed text-slate-700">
          <li>Total duration of the {skin.name} examination is <strong>{skin.id === 'NEET' ? 200 : 180} minutes</strong>.</li>
          <li>The countdown timer at the top will display the remaining time. When it reaches zero, the exam ends automatically — you don&apos;t need to submit manually.</li>
          <li>The Question Palette on the right shows the status of each question using these symbols:
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-3"><LegendIcon kind="notVisited" /><span>You have not visited the question yet.</span></div>
              <div className="flex items-center gap-3"><LegendIcon kind="notAnswered" /><span>You have not answered the question.</span></div>
              <div className="flex items-center gap-3"><LegendIcon kind="answered" /><span>You have answered the question.</span></div>
              <div className="flex items-center gap-3"><LegendIcon kind="marked" /><span>You have NOT answered the question, but have marked it for review.</span></div>
              <div className="flex items-center gap-3"><LegendIcon kind="answeredMarked" /><span>Answered &amp; Marked for Review — will be considered for evaluation.</span></div>
            </div>
          </li>
          <li>Click the <strong>&gt;</strong> arrow to collapse the question palette and maximise the question window; click <strong>&lt;</strong> to bring it back.</li>
        </ol>

        <h2 className="font-bold text-slate-800 underline mt-6 mb-2">Navigating to a Question</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-slate-700" start={5}>
          <li>To answer a question:
            <ol className="list-[lower-alpha] pl-5 mt-1 space-y-1">
              <li>Click a question number in the palette to go to it directly (this does <strong>not</strong> save your current answer).</li>
              <li>Click <strong>Save &amp; Next</strong> to save your answer and move to the next question.</li>
              <li>Click <strong>Mark for Review &amp; Next</strong> to save, mark for review, and move on.</li>
            </ol>
          </li>
        </ol>

        <h2 className="font-bold text-slate-800 underline mt-6 mb-2">Answering a Question</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-slate-700" start={6}>
          <li>For multiple-choice questions: click an option to select it; click it again or click <strong>Clear</strong> to deselect; click another option to change. You <strong>must</strong> click <strong>Save &amp; Next</strong> to save.</li>
          <li>For numerical questions: enter your answer using the on-screen keypad, then <strong>Save &amp; Next</strong>.</li>
        </ol>

        <h2 className="font-bold text-slate-800 underline mt-6 mb-2">Navigating through Sections</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-slate-700" start={8}>
          <li>Sections appear on the top bar. Click a section name to view its questions; the active section is highlighted.</li>
          <li>You may move between sections and questions any time during the allotted exam time.</li>
        </ol>

        <p className="text-red-600 text-sm my-5 border-y border-slate-200 py-3">
          Please note: all questions appear in English.
        </p>

        {/* Declaration */}
        <label className="flex items-start gap-2.5 text-sm text-slate-700 mb-5 cursor-pointer">
          <input type="checkbox" checked={read} onChange={e => { setRead(e.target.checked); if (e.target.checked) setWarn(false) }} className="mt-1 accent-blue-700" />
          <span>I have read and understood the instructions. I declare that I am not in possession of any prohibited material, and I agree that any violation may result in disqualification.</span>
        </label>

        {/* Skip-in-future option (above Proceed) */}
        <label className="flex items-center gap-2.5 text-sm text-slate-600 mb-6 cursor-pointer">
          <input type="checkbox" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="accent-blue-700" />
          <span>Don&apos;t show these instructions again (you can re-enable this on the upload page).</span>
        </label>

        <div className="flex justify-center">
          <button onClick={proceed}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-2.5 rounded transition">
            PROCEED
          </button>
        </div>
      </main>

      {/* Warning popup (NTA replica) */}
      {warn && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full px-8 py-7 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-300 text-amber-400 grid place-items-center text-3xl font-bold mx-auto mb-4">!</div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Warning!</h3>
            <p className="text-slate-600 text-sm mb-6">Please accept the terms and conditions before proceeding.</p>
            <button onClick={() => setWarn(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded transition">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
