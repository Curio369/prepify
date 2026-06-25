'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { EXAM_TYPE_TO_SKIN } from '@/lib/examSkins'

const EXAM_TYPES = ['JEE Main', 'NEET', 'Other'] as const
const MAX_PDF = 4.4 * 1024 * 1024 // Vercel rejects request bodies over ~4.5MB

// Downscale large images in the browser so each upload stays well under the
// serverless body limit. Extraction quality is unaffected at ~2200px.
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const MAX = 2200
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 3.5 * 1024 * 1024) return file
    const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.82))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  } catch { return file }
}

export default function UploadPage() {
  const authed = useRequireAuth()
  const [files, setFiles] = useState<File[]>([])
  const [examType, setExamType] = useState<string>('JEE Main')
  const [showInstructions, setShowInstructions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setShowInstructions(localStorage.getItem('nta_skip_instructions') !== 'yes')
  }, [])
  function toggleInstructions(next: boolean) {
    setShowInstructions(next)
    localStorage.setItem('nta_skip_instructions', next ? 'no' : 'yes')
  }
  const isNta = examType === 'JEE Main' || examType === 'NEET'

  const isPdf = files.length === 1 && files[0].type === 'application/pdf'

  function addFiles(list: FileList | null) {
    if (!list || !list.length) return
    setError('')
    const incoming = Array.from(list)
    const pdf = incoming.find(f => f.type === 'application/pdf')
    if (pdf) { setFiles([pdf]); return }              // PDFs handled as a single file
    const imgs = incoming.filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev.filter(f => f.type.startsWith('image/')), ...imgs])
  }
  function removeAt(i: number) { setFiles(prev => prev.filter((_, idx) => idx !== i)) }

  async function extractOne(f: File): Promise<any[]> {
    const fd = new FormData()
    fd.append('file', f)
    fd.append('save_to_db', 'true')
    fd.append('exam_type', examType)
    const res = await fetch('/api/extract', { method: 'POST', body: fd })
    if (res.status === 413) throw new Error('A file is still too large. Use a cropped/clearer photo.')
    const data = await res.json().catch(() => ({ error: 'Server error' }))
    if (data.error) throw new Error(data.error)
    return data.questions || []
  }

  async function handleUpload() {
    if (!files.length) return
    setLoading(true); setError(''); setProgress('')
    try {
      let all: any[] = []
      if (isPdf) {
        if (files[0].size > MAX_PDF) throw new Error('PDF too large (max ~4MB). Upload the pages as images instead, or split the PDF.')
        setProgress('Extracting questions…')
        all = await extractOne(files[0])
      } else {
        // Process each image in its own small request → never hits the body limit
        for (let i = 0; i < files.length; i++) {
          setProgress(`Processing image ${i + 1} of ${files.length}…`)
          const compressed = await compressImage(files[i])
          all.push(...await extractOne(compressed))
        }
      }
      if (!all.length) throw new Error('No questions could be extracted. Try clearer, well-lit images.')

      const skin = EXAM_TYPE_TO_SKIN[examType] || 'GENERIC'
      localStorage.setItem('questions', JSON.stringify(all))
      localStorage.setItem('exam_skin', skin)

      // Auto-save merged set to the user's library (non-blocking)
      try {
        const base = (files[0].name?.replace(/\.[^.]+$/, '') || `${examType} Test`)
        const defaultName = (files.length > 1 ? `${base} (+${files.length - 1})` : base).slice(0, 120)
        const saveRes = await fetch('/api/tests', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: defaultName, exam_type: examType, exam_skin: skin, questions: all }),
        })
        const saved = await saveRes.json()
        if (saved.id) localStorage.setItem('current_test_id', saved.id); else localStorage.removeItem('current_test_id')
        localStorage.setItem('current_test_name', defaultName)
      } catch { localStorage.removeItem('current_test_id') }

      router.push('/exam')
    } catch (e: any) {
      setError(e.message || 'Extraction failed. Try again.')
      setLoading(false); setProgress('')
    }
  }

  if (!authed) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm font-mono animate-pulse">Checking access...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <a href="/" className="absolute top-6 left-6 text-white/50 hover:text-white text-sm transition-colors">← Back</a>

      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-mono text-white/40 tracking-widest uppercase mb-4">Prepify</p>
          <h1 className="text-4xl md:text-5xl font-display tracking-tight text-white mb-4">Upload your DPP</h1>
          <p className="text-white/50 text-lg">Snap multiple pages, or upload a PDF</p>
        </div>

        {/* Exam type selector */}
        <div className="mb-6">
          <p className="text-xs text-white/40 mb-2.5 text-center">Which exam is this paper for?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAM_TYPES.map(t => (
              <button key={t} onClick={() => setExamType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${examType === t ? 'bg-white text-black' : 'bg-white/[0.04] text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80'}`}>
                {t}
              </button>
            ))}
          </div>
          {isNta && (
            <>
              <p className="text-center text-white/25 text-xs mt-2.5">Opens in the real {examType} (NTA) exam interface</p>
              <button type="button" onClick={() => toggleInstructions(!showInstructions)}
                className="mt-3 mx-auto flex items-center gap-2.5 text-xs text-white/50 hover:text-white/80 transition">
                <span className={`relative w-9 h-5 rounded-full transition-colors ${showInstructions ? 'bg-emerald-500' : 'bg-white/15'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showInstructions ? 'translate-x-4' : ''}`} />
                </span>
                Show exam instructions page before test
              </button>
            </>
          )}
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${dragOver ? 'border-white/60 bg-white/10' : files.length ? 'border-white/40 bg-white/5' : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/5'}`}
        >
          <input ref={inputRef} type="file" accept="image/*,.pdf" multiple className="hidden"
            onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

          {files.length === 0 ? (
            <div>
              <div className="text-5xl mb-4">📎</div>
              <p className="text-white/70 text-lg mb-2">Drop images or a PDF here</p>
              <p className="text-white/30 text-sm">or click to browse — you can pick multiple images</p>
              <p className="text-white/20 text-xs mt-4">JPG, PNG, WebP, PDF · multiple pages supported</p>
            </div>
          ) : isPdf ? (
            <div>
              <div className="text-4xl mb-3">📄</div>
              <p className="text-white font-medium">{files[0].name}</p>
              <p className="text-white/40 text-sm">{(files[0].size / 1024).toFixed(0)} KB</p>
              <button onClick={e => { e.stopPropagation(); setFiles([]) }} className="mt-3 text-white/30 hover:text-white/70 text-xs underline">Remove</button>
            </div>
          ) : (
            <div onClick={e => e.stopPropagation()}>
              <p className="text-white/60 text-sm mb-3">{files.length} image{files.length > 1 ? 's' : ''} selected · pages process in order</p>
              <div className="max-h-44 overflow-y-auto space-y-1.5 mb-3 text-left">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/[0.04] border border-white/8 rounded-lg px-3 py-2">
                    <span className="text-white/30 text-xs font-mono w-5 shrink-0">{i + 1}</span>
                    <span className="text-sm text-white/80 truncate flex-1">{f.name}</span>
                    <span className="text-white/30 text-xs shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeAt(i)} className="text-white/30 hover:text-red-400 text-sm shrink-0">×</button>
                  </div>
                ))}
              </div>
              <button onClick={() => inputRef.current?.click()} className="text-xs text-white/50 hover:text-white underline">+ Add more images</button>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}

        <button onClick={handleUpload} disabled={!files.length || loading}
          className={`mt-6 w-full py-4 rounded-full font-medium text-sm transition-all duration-300 ${!files.length || loading ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200 cursor-pointer'}`}>
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              {progress || 'Extracting questions...'}
            </span>
          ) : 'Start Exam →'}
        </button>

        <p className="text-center text-white/20 text-xs mt-6">
          Tip: for big papers, photograph each page and upload them together — clearer and avoids size limits.
        </p>
      </div>
    </div>
  )
}
