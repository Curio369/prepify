'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/extract', { method: 'POST', body: formData })
    const data = await res.json()
    localStorage.setItem('questions', JSON.stringify(data.questions))
    router.push('/exam')
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Prepify — Upload DPP</h1>
      <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
      <br /><br />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Extracting questions...' : 'Start Exam'}
      </button>
    </div>
  )
}