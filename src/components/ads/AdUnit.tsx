'use client'
import { useEffect, useRef } from 'react'

function BannerAd({ adKey, width, height }: { adKey: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const injected = useRef(false)
  useEffect(() => {
    if (!ref.current || injected.current) return
    injected.current = true
    // Set options then immediately inject script — keeps them paired
    const optScript = document.createElement('script')
    optScript.text = `window.atOptions = { key: '${adKey}', format: 'iframe', height: ${height}, width: ${width}, params: {} };`
    ref.current.appendChild(optScript)
    const invokeScript = document.createElement('script')
    invokeScript.async = true
    invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
    ref.current.appendChild(invokeScript)
  }, [adKey, width, height])
  return <div ref={ref} style={{ width, height, overflow: 'hidden' }} />
}

export default function AdBanner() {
  return (
    <div className="flex justify-center items-center w-full my-2">
      <div className="hidden md:block">
        <BannerAd adKey="75dbd20e390ef112c91372755e3fd0ce" width={728} height={90} />
      </div>
      <div className="md:hidden">
        <BannerAd adKey="6d5c1d8cf902bf1e9af1015cf2416b5e" width={320} height={50} />
      </div>
    </div>
  )
}
