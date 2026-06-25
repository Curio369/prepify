// pdfjs-dist (used by pdf-to-png-converter) requires DOMMatrix which is only
// available in Node 19+. Vercel runs Node 18, so we polyfill it here.
if (typeof globalThis.DOMMatrix === 'undefined') {
  ;(globalThis as any).DOMMatrix = class DOMMatrix {
    a=1; b=0; c=0; d=1; e=0; f=0
    m11=1; m12=0; m13=0; m14=0
    m21=0; m22=1; m23=0; m24=0
    m31=0; m32=0; m33=1; m34=0
    m41=0; m42=0; m43=0; m44=1
    is2D=true; isIdentity=true
    constructor(_init?: string | number[]) {}
    translate(tx=0,ty=0,_tz=0){ return this }
    scale(sx=1,sy=sx,_sz=1,_ox=0,_oy=0,_oz=0){ return this }
    rotate(_rx=0,_ry=0,_rz=0){ return this }
    multiply(_other: any){ return this }
    inverse(){ return this }
    transformPoint(p: any){ return p }
    toFloat32Array(){ return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]) }
    toFloat64Array(){ return new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]) }
    toString(){ return 'matrix(1,0,0,1,0,0)' }
    static fromMatrix(m: any){ return new (globalThis as any).DOMMatrix() }
    static fromFloat32Array(_a: Float32Array){ return new (globalThis as any).DOMMatrix() }
    static fromFloat64Array(_a: Float64Array){ return new (globalThis as any).DOMMatrix() }
  }
}

import { pdfToPng } from 'pdf-to-png-converter'

export async function pdfToAllImageBuffers(pdfBuffer: Buffer): Promise<Buffer[]> {
  const pngPages = await pdfToPng(pdfBuffer, {
    viewportScale: 2.0, 
  })

  // Explicitly map and cast to Buffer
  return pngPages.map(page => Buffer.from(page.content as Uint8Array))
}