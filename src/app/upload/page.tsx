'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/extract', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      localStorage.setItem('questions', JSON.stringify(data.questions))
      router.push('/exam')
    } catch (e: any) {
      setError(e.message || 'Extraction failed. Try again.')
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* Back button */}
      <a href="/" className="absolute top-6 left-6 text-white/50 hover:text-white text-sm transition-colors">
        ← Back
      </a>

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-mono text-white/40 tracking-widest uppercase mb-4">Prepify</p>
          <h1 className="text-4xl md:text-5xl font-display tracking-tight text-white mb-4">
            Upload your DPP
          </h1>
          <p className="text-white/50 text-lg">
            Image or PDF — any coaching, any format
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-white/60 bg-white/10'
              : file
              ? 'border-white/40 bg-white/5'
              : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />

          {file ? (
            <div>
              <div className="text-4xl mb-4">
                {file.type === 'application/pdf' ? '📄' : '🖼️'}
              </div>
              <p className="text-white font-medium text-lg mb-1">{file.name}</p>
              <p className="text-white/40 text-sm">{(file.size / 1024).toFixed(0)} KB</p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null) }}
                className="mt-4 text-white/30 hover:text-white/70 text-xs underline transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">📎</div>
              <p className="text-white/70 text-lg mb-2">Drop your DPP here</p>
              <p className="text-white/30 text-sm">or click to browse</p>
              <p className="text-white/20 text-xs mt-4">Supports JPG, PNG, WebP, PDF</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`mt-6 w-full py-4 rounded-full font-medium text-sm transition-all duration-300 ${
            !file || loading
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              Extracting questions...
            </span>
          ) : (
            'Start Exam →'
          )}
        </button>

        <p className="text-center text-white/20 text-xs mt-6">
          Processing happens on our servers — no GPU needed on your end
        </p>
      </div>
    </div>
  )
}