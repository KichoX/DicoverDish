'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Clock, MapPin, Globe, Instagram, Facebook, Phone, Mail,
  PawPrint, Cigarette, Baby, Wifi, CreditCard, Utensils,
  Save, User, DollarSign, Upload, X, ImageIcon,
  RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2,
  Lock, Eye, EyeOff, Loader2, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAppStore, type RestaurantImage } from '@/lib/store'
import { authApi, api } from '@/lib/api'

/* ─────────────────────────────────────────────
   Transform helper
───────────────────────────────────────────── */
interface EditState { scale: number; x: number; y: number; rotation: number; flipH: boolean; flipV: boolean }

function buildTransform(s: EditState) {
  return [
    `translate(${s.x}%, ${s.y}%)`,
    `scale(${s.scale})`,
    `rotate(${s.rotation}deg)`,
    s.flipH ? 'scaleX(-1)' : '',
    s.flipV ? 'scaleY(-1)' : '',
  ].filter(Boolean).join(' ')
}

// bfw/bfh = fraction of canvas the crop box occupies (e.g. 0.82 width, 0.78 height)
// max pan = how far center of image can shift while still covering the crop box edge
function clampXY(x: number, y: number, scale: number, bfw = 0.82, bfh = 0.78) {
  const maxX = Math.max(0, 50 * (scale - bfw))
  const maxY = Math.max(0, 50 * (scale - bfh))
  return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) }
}

/* ─────────────────────────────────────────────
   Rotation slider
───────────────────────────────────────────── */
const TICKS = Array.from({ length: 61 }, (_, i) => i)

function RotationSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full px-6 pb-4 select-none">
      <span className="text-white/60 text-xs tabular-nums">
        {value > 0 ? '+' : ''}{Math.round(value * 10) / 10}°
      </span>
      <div className="relative w-full h-7 flex items-center">
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-0.5">
          {TICKS.map(i => {
            const isMajor = (i - 30) % 5 === 0
            const deg = (i - 30) * 1.5
            const isNear = Math.abs(value - deg) < 0.9
            return (
              <div key={i} style={{
                width: isMajor ? 2 : 1.5,
                height: isMajor ? 10 : 6,
                borderRadius: 1,
                flexShrink: 0,
                background: isNear ? 'white' : 'rgba(255,255,255,0.25)',
              }} />
            )
          })}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 pointer-events-none">
          <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L8 5H0Z" fill="hsl(var(--primary))" /></svg>
        </div>
        <input
          type="range" min={-45} max={45} step={0.5} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-ew-resize z-10"
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Crop overlay — self-measured via ResizeObserver
   Reports box fractions to parent via onFractions
───────────────────────────────────────────── */
function CropOverlay({
  aspectRatio,
  onFractions,
}: {
  aspectRatio: string
  onFractions: (bfw: number, bfh: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const cbRef = useRef(onFractions)
  cbRef.current = onFractions

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const [aw, ah] = aspectRatio.split('/').map(Number)
    const ratio = aw / ah
    const compute = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      let w: number, h: number
      if (ratio > width / height) { w = width * 0.82; h = w / ratio }
      else                        { h = height * 0.78; w = h * ratio }
      setBox({ x: (width - w) / 2, y: (height - h) / 2, w, h })
      cbRef.current(w / width, h / height)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspectRatio])

  const { x, y, w, h } = box

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {w > 0 && (
        <>
          {/* Dark surround */}
          <div className="absolute" style={{ left: x, top: y, width: w, height: h, boxShadow: '0 0 0 9999px rgba(0,0,0,0.58)' }} />
          {/* Crop border */}
          <div className="absolute" style={{ left: x, top: y, width: w, height: h, border: '1.5px solid rgba(255,255,255,0.9)' }} />
          {/* Rule-of-thirds grid */}
          {[x + w / 3, x + (2 * w) / 3].map(gx => (
            <div key={gx} className="absolute" style={{ left: gx, top: y, width: 1, height: h, background: 'rgba(255,255,255,0.25)' }} />
          ))}
          {[y + h / 3, y + (2 * h) / 3].map(gy => (
            <div key={gy} className="absolute" style={{ left: x, top: gy, width: w, height: 1, background: 'rgba(255,255,255,0.25)' }} />
          ))}
          {/* Corner circles */}
          {([[x, y], [x + w, y], [x, y + h], [x + w, y + h]] as [number, number][]).map(([cx, cy], i) => (
            <div key={i} className="absolute rounded-full bg-primary" style={{ left: cx - 7, top: cy - 7, width: 14, height: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.6)' }} />
          ))}
          {/* L-bracket corners */}
          {([[x, y, 0, 0], [x + w, y, 1, 0], [x, y + h, 0, 1], [x + w, y + h, 1, 1]] as [number, number, number, number][]).map(([bx, by, r, b], i) => (
            <div key={`br${i}`}>
              <div className="absolute bg-white" style={{ left: r ? bx - 20 : bx, top: b ? by - 3 : by, width: 20, height: 3 }} />
              <div className="absolute bg-white" style={{ left: r ? bx - 3 : bx, top: b ? by - 20 : by, width: 3, height: 20 }} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Crop Modal — RAF-based direct DOM updates (no setState during drag)
───────────────────────────────────────────── */
function CropModal({
  open, src, initial, aspectRatio, label, onSave, onClose,
}: {
  open: boolean
  src: string
  initial: EditState
  aspectRatio: string
  label: string
  onSave: (s: EditState) => void
  onClose: () => void
}) {
  // uiState drives sliders/buttons only — image transform is applied via imgRef
  const [uiState, setUiState] = useState<EditState>(initial)

  const stateRef = useRef<EditState>(initial)   // mutable, no re-render
  const imgRef   = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const bfRef    = useRef({ bfw: 0.82, bfh: 0.78 })  // updated by CropOverlay
  const dragRef  = useRef<{ x: number; y: number } | null>(null)
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null)
  const rafId    = useRef(0)

  // CropOverlay calls this when it measures itself — keeps bfRef in sync
  const handleFractions = (bfw: number, bfh: number) => {
    bfRef.current = { bfw, bfh }
  }

  // Sync state when modal opens
  useEffect(() => {
    if (!open) return
    stateRef.current = { ...initial }
    setUiState({ ...initial })
    if (imgRef.current) imgRef.current.style.transform = buildTransform(initial)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyDOM = () => {
    if (imgRef.current) imgRef.current.style.transform = buildTransform(stateRef.current)
  }
  const scheduleApply = () => {
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(applyDOM)
  }

  // Patch mutableRef + schedule DOM update (no React re-render)
  const patchRef = (patch: Partial<EditState>) => {
    const next = { ...stateRef.current, ...patch }
    const { bfw, bfh } = bfRef.current
    const { x, y } = clampXY(next.x, next.y, next.scale, bfw, bfh)
    stateRef.current = { ...next, x, y }
    scheduleApply()
  }

  // Patch + sync React state (for control inputs)
  const updateCtrl = (patch: Partial<EditState>) => {
    patchRef(patch)
    setUiState({ ...stateRef.current })
  }

  const reset = () => {
    const s: EditState = { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false }
    stateRef.current = s
    setUiState(s)
    applyDOM()
  }

  /* ── Pointer drag (no setState) ── */
  const onPtrDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY }
  }
  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    dragRef.current = { x: e.clientX, y: e.clientY }
    const { offsetWidth: cw, offsetHeight: ch } = canvasRef.current
    const nx = stateRef.current.x + (dx / cw) * 100
    const ny = stateRef.current.y + (dy / ch) * 100
    const { bfw, bfh } = bfRef.current
    const { x, y } = clampXY(nx, ny, stateRef.current.scale, bfw, bfh)
    stateRef.current = { ...stateRef.current, x, y }
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(applyDOM)
  }
  const onPtrUp = () => { dragRef.current = null; setUiState({ ...stateRef.current }) }

  /* ── Scroll wheel zoom ── */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const scale = Math.min(3, Math.max(1, stateRef.current.scale + (e.deltaY < 0 ? 0.08 : -0.08)))
    patchRef({ scale })
    setUiState(prev => ({ ...prev, scale: stateRef.current.scale }))
  }

  /* ── Pinch / touch drag ── */
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)
      pinchRef.current = { dist: d, scale: stateRef.current.scale }
    } else {
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && pinchRef.current) {
      const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)
      patchRef({ scale: Math.min(3, Math.max(1, pinchRef.current.scale * (d / pinchRef.current.dist))) })
    } else if (e.touches.length === 1 && dragRef.current && canvasRef.current) {
      const dx = e.touches[0].clientX - dragRef.current.x
      const dy = e.touches[0].clientY - dragRef.current.y
      dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      const { offsetWidth: cw, offsetHeight: ch } = canvasRef.current
      const nx = stateRef.current.x + (dx / cw) * 100
      const ny = stateRef.current.y + (dy / ch) * 100
      const { bfw, bfh } = bfRef.current
      const { x, y } = clampXY(nx, ny, stateRef.current.scale, bfw, bfh)
      stateRef.current = { ...stateRef.current, x, y }
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(applyDOM)
    }
  }
  const onTouchEnd = () => { dragRef.current = null; pinchRef.current = null; setUiState({ ...stateRef.current }) }

  const [aw, ah] = aspectRatio.split('/').map(Number)
  const ctrlBtn = 'w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors text-foreground'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-0"
        style={{ maxWidth: 900, width: '95vw', height: 'min(92vh, 640px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left panel */}
          <div className="hidden md:flex flex-col w-52 flex-shrink-0 border-r bg-card p-5 gap-6 overflow-y-auto">
            <h2 className="text-lg font-bold tracking-tight">Crop</h2>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Aspect ratio</p>
              <div className="h-10 rounded-xl border border-border px-3 flex items-center justify-between text-sm bg-muted/40 cursor-default select-none">
                <span className="font-medium">{aw}:{ah}</span>
                <span className="text-muted-foreground text-xs">locked</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Zoom</p>
              <div className="flex items-center gap-2">
                <input
                  type="range" min={1} max={3} step={0.01} value={uiState.scale}
                  onChange={e => updateCtrl({ scale: parseFloat(e.target.value) })}
                  className="flex-1 accent-primary"
                />
                <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{uiState.scale.toFixed(1)}×</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Rotate</p>
              <div className="flex gap-2">
                <button className={ctrlBtn} onClick={() => updateCtrl({ rotation: uiState.rotation - 90 })}><RotateCcw className="w-4 h-4" /></button>
                <button className={ctrlBtn} onClick={() => updateCtrl({ rotation: uiState.rotation + 90 })}><RotateCw className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Flip</p>
              <div className="flex gap-2">
                <button className={cn(ctrlBtn, uiState.flipH && 'bg-primary/15 border-primary text-primary')} onClick={() => updateCtrl({ flipH: !stateRef.current.flipH })}>
                  <FlipHorizontal2 className="w-4 h-4" />
                </button>
                <button className={cn(ctrlBtn, uiState.flipV && 'bg-primary/15 border-primary text-primary')} onClick={() => updateCtrl({ flipV: !stateRef.current.flipV })}>
                  <FlipVertical2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button className="mt-auto text-xs text-muted-foreground hover:text-foreground transition-colors text-left" onClick={reset}>Reset</button>
          </div>

          {/* Image area */}
          <div className="flex-1 flex flex-col min-w-0 bg-neutral-900 min-h-0">
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-white/70 text-sm">{label}</span>
              <div className="flex md:hidden items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white" onClick={() => updateCtrl({ rotation: uiState.rotation - 90 })}><RotateCcw className="w-3.5 h-3.5" /></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white" onClick={() => updateCtrl({ rotation: uiState.rotation + 90 })}><RotateCw className="w-3.5 h-3.5" /></button>
                <button className={cn('w-8 h-8 rounded-lg flex items-center justify-center', uiState.flipH ? 'text-primary' : 'text-white/70 hover:text-white')} onClick={() => updateCtrl({ flipH: !stateRef.current.flipH })}><FlipHorizontal2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Canvas — direct DOM transforms, no setState during drag */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden touch-none min-h-0 select-none"
              style={{ cursor: 'grab' }}
              onPointerDown={onPtrDown}
              onPointerMove={onPtrMove}
              onPointerUp={onPtrUp}
              onPointerLeave={onPtrUp}
              onWheel={onWheel}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transform: buildTransform(uiState),
                  transformOrigin: 'center',
                  display: 'block',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  willChange: 'transform',
                }}
              />
              <CropOverlay aspectRatio={aspectRatio} onFractions={handleFractions} />
            </div>

            <div className="flex-shrink-0 bg-neutral-900 pt-2">
              <RotationSlider value={uiState.rotation} onChange={r => updateCtrl({ rotation: r })} />
            </div>
          </div>
        </div>

        {/* Footer — always visible */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-t bg-card">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={reset}>Reset</button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave({ ...stateRef.current })}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─────────────────────────────────────────────
   Image slot (upload + edit + remove)
───────────────────────────────────────────── */
function ImageSlot({
  label, hint, value, onChange, aspectRatio, previewAspectRatio,
}: {
  label: string; hint: string
  value: RestaurantImage | null
  onChange: (img: RestaurantImage | null) => void
  aspectRatio: string; previewAspectRatio?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [modalSrc, setModalSrc] = useState<string | null>(null)

  const toEditState = (img: RestaurantImage | null): EditState =>
    img ? { scale: img.scale, x: img.x, y: img.y, rotation: img.rotation, flipH: img.flipH, flipV: img.flipV }
        : { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false }

  const openEditor = (src: string) => setModalSrc(src)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => openEditor(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = (state: EditState) => {
    if (!modalSrc) return
    onChange({ src: modalSrc, ...state })
    setModalSrc(null)
  }

  const imgStyle = (img: RestaurantImage): React.CSSProperties => ({
    width: '100%', height: '100%', objectFit: 'cover',
    transform: buildTransform(img), transformOrigin: 'center', display: 'block',
  })

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
          </div>
          {value && (
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => openEditor(value.src)}>Edit</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive px-2" onClick={() => onChange(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {value ? (
          <div className="relative overflow-hidden rounded-xl border border-border cursor-pointer group" style={{ aspectRatio: previewAspectRatio ?? aspectRatio }} onClick={() => openEditor(value.src)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.src} alt={label} style={imgStyle(value)} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">Edit crop</span>
            </div>
          </div>
        ) : (
          <>
            <div
              className="relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
              style={{ aspectRatio: previewAspectRatio ?? aspectRatio }}
              onClick={() => fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }}
              onDragOver={e => e.preventDefault()}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs mt-0.5">or drag and drop</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload image
            </Button>
          </>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
      </div>

      <CropModal
        open={!!modalSrc}
        src={modalSrc ?? ''}
        initial={toEditState(modalSrc === value?.src ? value : null)}
        aspectRatio={aspectRatio}
        label={label}
        onSave={handleSave}
        onClose={() => setModalSrc(null)}
      />
    </>
  )
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const currencies = [
  { code: 'USD', symbol: '$', label: 'USD — US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP — British Pound' },
  { code: 'CHF', symbol: 'Fr.', label: 'CHF — Swiss Franc' },
  { code: 'SEK', symbol: 'kr', label: 'SEK — Swedish Krona' },
  { code: 'NOK', symbol: 'kr', label: 'NOK — Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'DKK — Danish Krone' },
  { code: 'JPY', symbol: '¥', label: 'JPY — Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD — Australian Dollar' },
]
const cuisineTypes = ['French','Italian','Japanese','Chinese','Indian','Mexican','American','Mediterranean','Thai','Vietnamese','Korean','Spanish','Greek','German','Middle Eastern','Seafood','Steakhouse','Vegetarian']
const priceRanges = ['$','$$','$$$','$$$$']
const attributesList = [
  { key: 'petFriendly',       label: 'Pet-friendly',       icon: PawPrint },
  { key: 'nonSmoking',        label: 'Non-smoking',        icon: Cigarette },
  { key: 'familyFriendly',    label: 'Family-friendly',    icon: Baby },
  { key: 'wifi',              label: 'Free WiFi',          icon: Wifi },
  { key: 'creditCards',       label: 'Credit Cards',       icon: CreditCard },
  { key: 'wheelchair',        label: 'Wheelchair Access',  icon: User },
  { key: 'outdoor',           label: 'Outdoor Seating',    icon: Utensils },
  { key: 'privateRooms',      label: 'Private Rooms',      icon: Utensils },
  { key: 'vegetarianOptions', label: 'Vegetarian Options', icon: Utensils },
  { key: 'veganOptions',      label: 'Vegan Options',      icon: Utensils },
]
const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const { restaurantProfile, updateRestaurantProfile, setBannerImage, setProfileImage, token } = useAppStore()

  const defaultLocal = {
    name:        restaurantProfile.name,
    description: restaurantProfile.description,
    cuisineType: 'Italian', priceRange: '$$', currency: 'EUR',
    address:     restaurantProfile.address,
    phone:       restaurantProfile.phone,
    email:       '',
    website:     '',
    instagram:   '',
    facebook:    '',
    openingHours: {
      monday:    { open: '12:00', close: '00:00', closed: false },
      tuesday:   { open: '12:00', close: '00:00', closed: false },
      wednesday: { open: '12:00', close: '00:00', closed: false },
      thursday:  { open: '12:00', close: '00:00', closed: false },
      friday:    { open: '12:00', close: '00:00', closed: false },
      saturday:  { open: '12:00', close: '00:00', closed: false },
      sunday:    { open: '12:00', close: '00:00', closed: false },
    },
    attributes: {
      petFriendly: false, nonSmoking: true, familyFriendly: true,
      wifi: true, creditCards: true, wheelchair: true, outdoor: true,
      privateRooms: false, vegetarianOptions: true, veganOptions: false,
    },
  }

  const [local, setLocal] = useState(defaultLocal)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile'|'images'|'hours'|'attributes'|'contact'|'security'>('profile')

  // Load restaurant data from DB on mount
  useEffect(() => {
    if (!token) return
    api.getMyRestaurant(token).then(r => {
      setLocal(prev => ({
        ...prev,
        name:        r.name        ?? prev.name,
        description: r.description ?? prev.description,
        address:     r.address     ?? prev.address,
        phone:       r.phone       ?? prev.phone,
        website:     r.website     ?? prev.website,
        instagram:   r.instagram   ?? prev.instagram,
      }))
      updateRestaurantProfile({ name: r.name, description: r.description ?? '', address: r.address, phone: r.phone ?? '' })
    }).catch(() => { /* backend not running — use store defaults */ })
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Change password state
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (pw.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pw.next !== pw.confirm) { setPwError('Passwords do not match.'); return }
    if (!token) { setPwError('Not authenticated. Please log in again.'); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(token, pw.current, pw.next)
      setPwSuccess(true)
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      if (token) {
        await api.updateMyRestaurant(token, {
          name:        local.name,
          description: local.description,
          address:     local.address,
          phone:       local.phone,
          website:     local.website || undefined,
          instagram:   local.instagram || undefined,
        })
      }
      updateRestaurantProfile({ name: local.name, description: local.description, address: local.address, phone: local.phone })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateHours = (day: typeof days[number], field: 'open'|'close'|'closed', value: string|boolean) =>
    setLocal(p => ({ ...p, openingHours: { ...p.openingHours, [day]: { ...p.openingHours[day], [field]: value } } }))

  const toggleAttr = (key: string) =>
    setLocal(p => ({ ...p, attributes: { ...p.attributes, [key]: !p.attributes[key as keyof typeof p.attributes] } }))

  const tabs = [
    { id: 'profile', label: 'Profile' }, { id: 'images', label: 'Images' },
    { id: 'hours', label: 'Hours' }, { id: 'attributes', label: 'Attributes' },
    { id: 'contact', label: 'Contact' }, { id: 'security', label: 'Security' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant profile and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}
          className={cn('rounded-xl h-11 px-6 transition-colors', saveSuccess && 'bg-green-600 hover:bg-green-600')}>
          {saveSuccess
            ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved</>
            : <><Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving…' : 'Save Changes'}</>
          }
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn('px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80 text-muted-foreground')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle><CardDescription>Your restaurant name, description, and category</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <Field><FieldLabel htmlFor="name">Restaurant Name</FieldLabel>
                <Input id="name" value={local.name} onChange={e => setLocal({...local, name: e.target.value})} className="h-12 rounded-xl" />
              </Field>
              <Field><FieldLabel htmlFor="description">About / Description</FieldLabel>
                <Textarea id="description" value={local.description} onChange={e => setLocal({...local, description: e.target.value})} className="rounded-xl resize-none" rows={4} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field><FieldLabel>Cuisine Type</FieldLabel>
                  <Select value={local.cuisineType} onValueChange={v => setLocal({...local, cuisineType: v})}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{cuisineTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field><FieldLabel>Price Range</FieldLabel>
                  <Select value={local.priceRange} onValueChange={v => setLocal({...local, priceRange: v})}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{priceRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field><FieldLabel><DollarSign className="w-4 h-4 inline mr-1.5" />Currency</FieldLabel>
                <Select value={local.currency} onValueChange={v => setLocal({...local, currency: v})}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}><span className="font-mono w-8 inline-block text-muted-foreground">{c.symbol}</span>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Location</CardTitle></CardHeader>
            <CardContent>
              <Field><FieldLabel htmlFor="address"><MapPin className="w-4 h-4 inline mr-2" />Address</FieldLabel>
                <Input id="address" value={local.address} onChange={e => setLocal({...local, address: e.target.value})} className="h-12 rounded-xl" />
              </Field>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Images ── */}
      {activeTab === 'images' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Square thumbnail on restaurant cards everywhere. Recommended 400×400px.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-8 items-start">
                <ImageSlot label="Profile picture" hint="400×400px · JPG PNG WebP"
                  value={restaurantProfile.profileImage} onChange={setProfileImage}
                  aspectRatio="1/1" previewAspectRatio="1/1" />
                {restaurantProfile.profileImage && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Card preview</p>
                    <div className="rounded-xl overflow-hidden border border-border">
                      <div className="relative overflow-hidden" style={{ aspectRatio: '5/4' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={restaurantProfile.profileImage.src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transform: buildTransform(restaurantProfile.profileImage), transformOrigin:'center', display:'block' }} />
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground">Italian · Berlin</p>
                        <p className="text-sm font-medium mt-0.5 truncate">{local.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Images</CardTitle>
              <CardDescription>Up to 3 images shown as a carousel on your restaurant page. Recommended: 1440×420px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {([0, 1, 2] as const).map(idx => (
                <div key={idx}>
                  {idx > 0 && <div className="border-t border-border mb-10" />}
                  <ImageSlot
                    label={`Banner ${idx + 1}${idx === 0 ? ' (primary)' : ''}`}
                    hint="1440×420px recommended · JPG PNG WebP"
                    value={restaurantProfile.bannerImages[idx]}
                    onChange={img => setBannerImage(idx, img)}
                    aspectRatio="21/6"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Hours ── */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Opening Hours</CardTitle><CardDescription>Set your restaurant operating hours</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className={cn('flex items-center gap-4 p-4 rounded-xl border transition-colors', local.openingHours[day].closed ? 'bg-muted/50' : 'bg-card')}>
                  <div className="w-28 font-medium capitalize">{day}</div>
                  <div className="flex items-center gap-2">
                    <Switch checked={!local.openingHours[day].closed} onCheckedChange={c => updateHours(day,'closed',!c)} />
                    <span className="text-sm text-muted-foreground">{local.openingHours[day].closed ? 'Closed' : 'Open'}</span>
                  </div>
                  {!local.openingHours[day].closed && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input type="time" value={local.openingHours[day].open} onChange={e => updateHours(day,'open',e.target.value)} className="w-32 h-10 rounded-lg" />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" value={local.openingHours[day].close} onChange={e => updateHours(day,'close',e.target.value)} className="w-32 h-10 rounded-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Attributes ── */}
      {activeTab === 'attributes' && (
        <Card>
          <CardHeader><CardTitle>Restaurant Attributes</CardTitle><CardDescription>Features and amenities</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attributesList.map(attr => {
                const isActive = local.attributes[attr.key as keyof typeof local.attributes]
                return (
                  <button key={attr.key} onClick={() => toggleAttr(attr.key)}
                    className={cn('flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all', isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50')}>
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isActive ? 'bg-primary/20' : 'bg-muted')}>
                      <attr.icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{attr.label}</span>
                    {isActive && <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/20 border-0">Active</Badge>}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Security ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                {(['current', 'next', 'confirm'] as const).map((key) => {
                  const labels = { current: 'Current Password', next: 'New Password', confirm: 'Confirm New Password' }
                  return (
                    <Field key={key}>
                      <FieldLabel>{labels[key]}</FieldLabel>
                      <div className="relative">
                        <Input
                          type={showPw[key] ? 'text' : 'password'}
                          value={pw[key]}
                          onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                          className="h-12 rounded-xl pr-12"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPw[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </Field>
                  )
                })}
                {pwError && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{pwError}</div>
                )}
                {pwSuccess && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 px-3 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Password changed successfully.
                  </div>
                )}
                <Button type="submit" disabled={pwLoading} className="rounded-xl h-11 px-6">
                  {pwLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</>
                    : 'Update Password'
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Contact ── */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field><FieldLabel htmlFor="phone"><Phone className="w-4 h-4 inline mr-2" />Phone</FieldLabel>
                  <Input id="phone" type="tel" value={local.phone} onChange={e => setLocal({...local, phone: e.target.value})} className="h-12 rounded-xl" />
                </Field>
                <Field><FieldLabel htmlFor="email"><Mail className="w-4 h-4 inline mr-2" />Email</FieldLabel>
                  <Input id="email" type="email" value={local.email} onChange={e => setLocal({...local, email: e.target.value})} className="h-12 rounded-xl" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Social Media &amp; Web</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup>
                <Field><FieldLabel htmlFor="website"><Globe className="w-4 h-4 inline mr-2" />Website</FieldLabel>
                  <Input id="website" type="url" value={local.website} onChange={e => setLocal({...local, website: e.target.value})} className="h-12 rounded-xl" placeholder="https://..." />
                </Field>
                <Field><FieldLabel htmlFor="instagram"><Instagram className="w-4 h-4 inline mr-2" />Instagram</FieldLabel>
                  <Input id="instagram" value={local.instagram} onChange={e => setLocal({...local, instagram: e.target.value})} className="h-12 rounded-xl" placeholder="@yourusername" />
                </Field>
                <Field><FieldLabel htmlFor="facebook"><Facebook className="w-4 h-4 inline mr-2" />Facebook</FieldLabel>
                  <Input id="facebook" value={local.facebook} onChange={e => setLocal({...local, facebook: e.target.value})} className="h-12 rounded-xl" placeholder="yourpagename" />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
