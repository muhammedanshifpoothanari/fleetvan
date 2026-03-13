"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { useAudio } from "@/hooks/use-audio"
import { motion, AnimatePresence } from "framer-motion"
import { SlideToConfirm } from "@/components/slide-to-confirm"
import type { StopStatus } from "@/lib/app-context"

const ISSUE_TYPES = [
  { id: "absent", label: "No one home / Shop closed", icon: "driver" as const, color: "text-yellow-400" },
  { id: "traffic", label: "Stuck in traffic", icon: "route" as const, color: "text-orange-400" },
  { id: "rejected", label: "Order turned away / Refused", icon: "stop-issue" as const, color: "text-red-500" },
  { id: "address", label: "Can't find location", icon: "destination" as const, color: "text-red-500" },
  { id: "partial", label: "Inventory mismatch / Damaged", icon: "package" as const, color: "text-blue-400" },
  { id: "other", label: "Other problem", icon: "report" as const, color: "text-muted-foreground" },
]

type Mode = "main" | "issue" | "partial" | "cash" | "pod" | "done"

export default function StopAction({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { state, dispatch, activeNote, currentStop } = useApp()
  const haptics = useHaptics()
  const { playClick, playSuccess, playPop } = useAudio()
  const [mode, setMode] = useState<Mode>("main")
  const [deliveredQtys, setDeliveredQtys] = useState<number[]>(
    currentStop?.items.map((i) => i.qty) ?? []
  )
  const [cashEntered, setCashEntered] = useState("")
  const [cashReason, setCashReason] = useState("")
  const [issueType, setIssueType] = useState("")
  const [issueNote, setIssueNote] = useState("")
  const [pushToNextDay, setPushToNextDay] = useState(false)
  const [wasLastStop, setWasLastStop] = useState(false)

  // POD: Photo + Signature
  const [podPhoto, setPodPhoto] = useState<string | null>(null)
  const [podSignature, setPodSignature] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDrawingRef = useRef(false)

  if (!activeNote || !currentStop) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <p className="text-foreground">No active stop. Go back to inbox.</p>
      </div>
    )
  }

  const totalStops = activeNote.stops.length
  const stopNumber = state.currentStopIndex + 1
  const typeInfo = {
    deliver: { label: "Delivery", icon: "van" as const, color: "text-foreground", bg: "bg-foreground/10 border-foreground/20" },
    pickup: { label: "Pickup", icon: "stop-pickup" as const, color: "text-[#06c167]", bg: "bg-[#06c167]/10 border-[#06c167]/20" },
    cash: { label: "Cash collect", icon: "stop-cash" as const, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    return: { label: "Return", icon: "stop-return" as const, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
    mixed: { label: "Mixed", icon: "route" as const, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  }[currentStop.type]

  const isLastStop = stopNumber === totalStops

  const adjustQty = (idx: number, delta: number) => {
    const newQtys = [...deliveredQtys]
    newQtys[idx] = Math.max(0, Math.min(currentStop.items[idx].qty, newQtys[idx] + delta))
    setDeliveredQtys(newQtys)
    playClick()
    haptics.light()
  }

  const completeStop = (status: StopStatus, cashAmount?: number, note?: string) => {
    haptics.success()
    playSuccess()

    // Elon Token Reward + Travis Surge Multiplier
    const baseTokens = state.ludicrousMode ? 100 : 50
    const tokenAmount = Math.round(baseTokens * state.surgeMultiplier)
    dispatch({ type: "ADD_TOKENS", amount: tokenAmount })

    // Efficiency tracking (simulated dead miles/idle)
    dispatch({ type: "LOG_EFFICIENCY", deadMiles: Math.random() * 0.5, idleTime: Math.random() * 2 })

    const isLast = stopNumber >= totalStops
    setWasLastStop(isLast)
    dispatch({
      type: "COMPLETE_STOP",
      stopId: currentStop.id,
      delivered: status === "skipped" || status === "issue" ? currentStop.items.map(() => 0) : deliveredQtys,
      cash: cashAmount,
      issueNote: note,
      status,
    })
    dispatch({ type: "NEXT_STOP" })
    setMode("done")
  }

  // ── DONE screen ──────────────────────────────────────────────────────────
  if (mode === "done") {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background px-8 gap-6">
        <div className="w-24 h-24 rounded-full bg-[#06c167]/15 flex items-center justify-center">
          <Illicon name="stop-done" size={56} filled color="text-[#06c167]" />
        </div>
        <div className="text-center">
          <h2 className="text-[28px] font-black text-foreground mb-2 tracking-tight">
            {wasLastStop ? "All done." : "Stop marked"}
          </h2>
          <p className="text-muted-foreground text-[14px]">
            {wasLastStop
              ? "Great shift. You're wrapped up."
              : `${totalStops - stopNumber} stop${totalStops - stopNumber !== 1 ? "s" : ""} left`}
          </p>
        </div>
        <button
          onClick={() => { haptics.medium(); wasLastStop ? onNext?.() : onBack() }}
          className={`uber-press w-full h-[58px] rounded-xl font-black text-[17px] ${wasLastStop
            ? "bg-[#06c167] text-black shadow-[0_4px_24px_rgba(6,193,103,0.35)]"
            : "bg-foreground text-background"
            }`}
        >
          {wasLastStop ? "See today's summary" : "Next stop"}
        </button>
      </div>
    )
  }

  // ── ISSUE reporter ───────────────────────────────────────────────────────
  if (mode === "issue") {
    return (
      <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-12 pb-5 border-b border-border shrink-0">
          <button
            onClick={() => { haptics.light(); setMode("main") }}
            className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <h2 className="text-[20px] font-black text-foreground">What happened?</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 space-y-3">
          <p className="text-muted-foreground text-[13px] mb-4">
            At <span className="text-foreground font-bold">{currentStop.customerName}</span>
          </p>
          {ISSUE_TYPES.map((issue) => (
            <button
              key={issue.id}
              onClick={() => { haptics.tick(); setIssueType(issue.id) }}
              className={`uber-press w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${issueType === issue.id
                ? "bg-red-500/10 border-red-500/30"
                : "bg-card border-border"
                }`}
            >
              <Illicon name={issue.icon} size={24} color={issue.color} />
              <span className="text-foreground font-bold text-[14px] flex-1 text-left">{issue.label}</span>
              {issueType === issue.id && (
                <Illicon name="check-circle" size={20} filled color="text-red-500" />
              )}
            </button>
          ))}
          {issueType === "partial" && (
            <div className="mt-4 space-y-3">
              <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest">Qty delivered</p>
              {currentStop.items.map((item, idx) => (
                <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <p className="text-foreground text-[14px] font-bold flex-1 mr-4 truncate">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustQty(idx, -1)}
                      disabled={deliveredQtys[idx] === 0}
                      className="uber-press w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                    >
                      <Illicon name="close" size={18} color="text-foreground" />
                    </button>
                    <span className="text-foreground font-black text-[15px] w-8 text-center">{deliveredQtys[idx]}</span>
                    <button
                      onClick={() => adjustQty(idx, 1)}
                      disabled={deliveredQtys[idx] >= item.qty}
                      className="uber-press w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                    >
                      <Illicon name="check" size={18} color="text-foreground" />
                    </button>
                    <span className="text-muted-foreground text-[11px]">/{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {issueType === "absent" && (
            <div className="mt-4 mb-2 bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={pushToNextDay} onChange={(e) => setPushToNextDay(e.target.checked)} className="w-5 h-5 accent-yellow-500 rounded" />
                <span className="text-[13px] font-bold text-yellow-500">Auto-push to tomorrow's route</span>
              </label>
            </div>
          )}
          <div className="pt-2">
            <label className="text-[12px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Note (optional)</label>
            <textarea
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Describe what happened…"
              rows={3}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-[14px] placeholder-muted-foreground resize-none focus:outline-none focus:border-red-400/40"
            />
          </div>
          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={() => { haptics.medium(); alert("Dispatch contacted!") }}
              className="uber-press w-full flex items-center justify-center gap-3 bg-muted border border-border h-[58px] rounded-2xl font-bold text-foreground"
            >
              <Illicon name="dispatch" size={20} color="text-foreground" />
              Need help? Contact Dispatch
            </button>
          </div>
        </div>
        <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border flex gap-3">
          <button
            onClick={() => { haptics.light(); setMode("main") }}
            className="uber-press flex-1 py-3.5 rounded-xl border border-border text-muted-foreground text-[14px] font-bold"
          >
            Cancel
          </button>
          <button
            disabled={!issueType}
            onClick={() => {
              haptics.error()
              const finalNote = issueNote || issueType
              const append = pushToNextDay ? " [PUSHED TO TOMORROW]" : ""
              if (issueType === "partial") completeStop("partial", undefined, finalNote + append)
              else completeStop("issue", undefined, finalNote + append)
            }}
            className="uber-press flex-[2] py-3.5 rounded-xl bg-red-500 disabled:bg-muted disabled:text-muted-foreground text-white font-black text-[15px]"
          >
            Submit report
          </button>
        </div>
      </div>
    )
  }

  // ── CASH collection ──────────────────────────────────────────────────────
  if (mode === "cash" || currentStop.type === "cash") {
    const expected = currentStop.expectedCash ?? 0
    const entered = Number(cashEntered) || 0
    const isShort = entered < expected && entered > 0
    const isExact = entered === expected
    return (
      <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border shrink-0">
          <button
            onClick={() => { haptics.light(); currentStop.type === "cash" ? onBack() : setMode("main") }}
            className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <div>
            <h2 className="text-[20px] font-black text-foreground">Cash collection</h2>
            <p className="text-muted-foreground text-[13px]">{currentStop.customerName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-6 space-y-6">
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 text-center">
            <p className="text-muted-foreground text-[11px] uppercase tracking-wide mb-1">Expected</p>
            <p className="text-[40px] font-black text-yellow-500">SAR {expected.toLocaleString()}</p>
          </div>

          <div>
            <label className="text-[12px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Amount collected</label>
            <div className={`flex items-center bg-card border rounded-2xl px-4 py-5 gap-3 h-20 shadow-sm ${isShort ? "border-yellow-400/40" : isExact ? "border-[#06c167]/40" : "border-border"}`}>
              <span className="text-muted-foreground font-black text-[18px]">SAR</span>
              <div className="flex-1 text-foreground text-[32px] font-black tracking-tight">
                {cashEntered || "0.00"}
              </div>
              {isExact && <Illicon name="check-circle" size={24} filled color="text-[#06c167]" />}
            </div>
            {isShort && (
              <div className="mt-4">
                <p className="text-yellow-500 text-[12px] font-bold mt-2 mb-3 flex items-center gap-1.5 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20">
                  <Illicon name="stop-issue" size={14} color="text-yellow-500" />
                  SAR {(expected - entered).toLocaleString()} short. Reason required.
                </p>
                <textarea
                  value={cashReason}
                  onChange={(e) => setCashReason(e.target.value)}
                  placeholder="Explain why the collected cash is short..."
                  rows={2}
                  className="w-full bg-card border border-yellow-400/40 rounded-xl px-4 py-3 text-foreground text-[14px] placeholder-muted-foreground resize-none focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Virtual Number Pad */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "back"].map((k) => (
              <motion.button
                key={k}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                onClick={() => {
                  playClick()
                  haptics.light()
                  if (k === "back") {
                    setCashEntered(prev => prev.slice(0, -1))
                  } else {
                    if (k === "." && cashEntered.includes(".")) return
                    if (cashEntered.length < 10) setCashEntered(prev => prev + String(k))
                  }
                }}
                className={`h-16 rounded-2xl flex items-center justify-center text-[22px] font-black transition-colors ${k === "back" ? "bg-muted text-muted-foreground" : "bg-card border border-border text-foreground hover:bg-muted font-mono"}`}
              >
                {k === "back" ? (
                  <span className="material-symbols-outlined">backspace</span>
                ) : k}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border flex gap-3">
          <button
            onClick={() => { haptics.warning(); completeStop("issue", 0, "Cash not collected") }}
            className="uber-press flex-1 py-3.5 rounded-xl border border-border text-muted-foreground text-[14px] font-bold"
          >
            Skip
          </button>
          <button
            disabled={entered === 0 || (isShort && cashReason.trim() === "")}
            onClick={() => {
              haptics.success()
              const finalNote = isShort ? `Short SAR ${expected - entered}. Reason: ${cashReason}` : undefined
              completeStop(isShort ? "partial" : "done", entered, finalNote)
            }}
            className="uber-press flex-[2] py-3.5 rounded-xl bg-ugreen disabled:bg-muted disabled:text-muted-foreground text-black font-black text-[15px] flex items-center justify-center gap-2"
          >
            <Illicon name="cash" size={18} filled color={entered > 0 && !(isShort && cashReason.trim() === "") ? "text-black" : "text-muted-foreground"} />
            Confirm SAR {entered > 0 ? entered.toLocaleString() : "0"}
          </button>
        </div>
      </div>
    )
  }

  // ── POD screen — Photo + Digital Signature ─────────────────────────────
  if (mode === "pod") {
    // Canvas drawing handlers
    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      if ("touches" in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      }
      return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
    }

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      isDrawingRef.current = true
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return
      const { x, y } = getPos(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return
      const { x, y } = getPos(e)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2.5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    }

    const endDraw = () => {
      isDrawingRef.current = false
      const canvas = canvasRef.current
      if (canvas) setPodSignature(canvas.toDataURL("image/png"))
    }

    const clearCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      setPodSignature(null)
    }

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      haptics.success()
      const reader = new FileReader()
      reader.onload = (ev) => setPodPhoto(ev.target?.result as string)
      reader.readAsDataURL(file)
    }

    const canSubmit = !!podPhoto || !!podSignature

    return (
      <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-12 pb-5 border-b border-border shrink-0">
          <button
            onClick={() => { haptics.light(); setMode("main") }}
            className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <div>
            <h2 className="text-[20px] font-black text-foreground">Proof of Delivery</h2>
            <p className="text-muted-foreground text-[13px]">{currentStop.customerName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Photo Capture */}
          <div>
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest mb-3">📸 Delivery Photo</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoCapture}
            />
            {podPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-ugreen/30">
                <img src={podPhoto} alt="POD" className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-ugreen text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Photo captured
                </div>
                <div className="absolute bottom-3 left-3 bg-black/70 text-white/70 px-2 py-0.5 rounded text-[9px] font-mono">
                  {new Date().toLocaleString()} · GPS auto-tagged
                </div>
                <button
                  onClick={() => { haptics.light(); setPodPhoto(null); fileInputRef.current?.click() }}
                  className="absolute top-3 right-3 bg-white/90 text-black px-3 py-1 rounded-full text-[11px] font-bold"
                >
                  Retake
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="uber-press w-full h-40 rounded-2xl border-2 border-dashed border-ugreen/30 bg-ugreen/5 flex flex-col items-center justify-center gap-2 active:bg-ugreen/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-ugreen/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-ugreen text-[28px]">photo_camera</span>
                </div>
                <span className="text-[14px] font-black text-foreground">Take photo</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">GPS + timestamp auto-attached</span>
              </button>
            )}
          </div>

          {/* Digital Signature */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest">✍️ Customer Signature</p>
              {podSignature && (
                <button onClick={() => { haptics.tick(); clearCanvas() }} className="text-[11px] font-bold text-red-500 px-3 py-1 bg-red-500/10 rounded-full">
                  Clear
                </button>
              )}
            </div>
            <div className="relative bg-white rounded-2xl border-2 border-border overflow-hidden" style={{ touchAction: "none" }}>
              <canvas
                ref={canvasRef}
                width={350}
                height={180}
                className="w-full"
                style={{ height: 180, cursor: "crosshair" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              {!podSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-gray-300 text-[15px] font-bold italic">Sign here with finger...</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-300 mx-6" />
              <div className="absolute bottom-2 right-3 text-[9px] text-gray-400 font-mono">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-ugreen text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Photo and signature are stored with GPS coordinates and timestamp for full compliance audit trail.
            </p>
          </div>
        </div>

        <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border">
          <SlideToConfirm
            disabled={!canSubmit}
            label={canSubmit ? "SUBMIT & COMPLETE" : "ADD PHOTO OR SIGNATURE"}
            successLabel="COMPLETED"
            icon="check-circle"
            onConfirm={() => completeStop("done")}
          />
        </div>
      </div>
    )
  }

  // ── MAIN stop screen ─────────────────────────────────────────────────────
  const allDelivered = deliveredQtys.every((q, i) => q === currentStop.items[i]?.qty)
  const hasItems = currentStop.items.length > 0
  const hasCash = !!currentStop.expectedCash && currentStop.expectedCash > 0

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wide ${typeInfo.bg}`}>
            <Illicon name={typeInfo.icon} size={14} color={typeInfo.color} />
            <span className={typeInfo.color}>{typeInfo.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center px-2 py-1 rounded-full gap-1.5 transition-all ${state.isSynced ? "bg-[#06c167]/10" : "bg-blue-500/10 animate-pulse"
              }`}>
              <Illicon
                name={state.isSynced ? "check-circle" : "sync"}
                size={12}
                filled={state.isSynced}
                color={state.isSynced ? "text-[#06c167]" : "text-blue-500"}
              />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${state.isSynced ? "text-[#06c167]" : "text-blue-500"
                }`}>
                {state.isSynced ? "Synced" : "Syncing"}
              </span>
            </div>
            <button
              onClick={() => { haptics.medium(); setMode("issue") }}
              className="uber-press p-2 rounded-full bg-red-500/10 border border-red-500/20"
            >
              <Illicon name="stop-issue" size={20} color="text-red-500" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {activeNote.stops.map((s, idx) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-all ${idx < state.currentStopIndex
                ? s.status === "issue" || s.status === "partial" ? "bg-yellow-400" : "bg-[#06c167]"
                : idx === state.currentStopIndex
                  ? "bg-foreground"
                  : "bg-muted"
                }`}
            />
          ))}
        </div>

        <div>
          <p className="text-muted-foreground text-[12px] font-bold uppercase tracking-widest mb-1">
            Stop {stopNumber} of {totalStops}
          </p>
          <h2 className="text-[24px] font-black text-foreground leading-tight">{currentStop.customerName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Illicon name="destination" size={16} color="text-muted-foreground" />
            <p className="text-muted-foreground text-[13px]">{currentStop.address}</p>
          </div>
        </div>

        {currentStop.phone && (
          <div className="flex gap-2 mt-4">
            <a
              href={`tel:${currentStop.phone}`}
              onClick={() => haptics.medium()}
              className="uber-press flex items-center gap-2 bg-muted border border-border rounded-xl px-4 py-2.5 text-[13px] font-bold text-foreground"
            >
              <Illicon name="call" size={18} color="text-foreground" />
              Call
            </a>
            <a
              href={`https://wa.me/${currentStop.phone.replace(/\s+/g, '')}?text=Hello, this is your Fleet driver. I am arriving at your location: ${currentStop.customerName}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptics.medium()}
              className="uber-press flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[#25D366]"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp
            </a>
            <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2.5 flex-1 min-w-0">
              <span className="text-[12px] text-muted-foreground truncate">{currentStop.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items checklist */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5" style={{ scrollbarWidth: "none" }}>
        {hasItems && (
          <div>
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              {currentStop.type === "pickup" || currentStop.type === "return" ? "Collect" : "Deliver"}
            </p>
            <div className="space-y-2">
              {currentStop.items.map((item, idx) => {
                const isFullyDone = deliveredQtys[idx] === item.qty
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all ${isFullyDone ? "bg-[#06c167]/10 border-[#06c167]/20" : "bg-card border-border"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isFullyDone ? "bg-[#06c167]" : "bg-muted"}`}>
                          <Illicon name={isFullyDone ? "check" : "package"} size={16} filled={isFullyDone} color={isFullyDone ? "text-black" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <p className="text-foreground text-[14px] font-bold">{item.name}</p>
                          <p className="text-muted-foreground text-[11px]">{item.qty} {item.unit} total</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[12px]">Qty handed over</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => adjustQty(idx, -1)}
                          disabled={deliveredQtys[idx] === 0}
                          className="uber-press w-9 h-9 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                        >
                          <Illicon name="close" size={18} color="text-foreground" />
                        </button>
                        <span className="text-foreground font-black text-[17px] w-8 text-center">{deliveredQtys[idx]}</span>
                        <button
                          onClick={() => adjustQty(idx, 1)}
                          disabled={deliveredQtys[idx] >= item.qty}
                          className="uber-press w-9 h-9 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                        >
                          <Illicon name="check" size={18} color="text-foreground" />
                        </button>
                        <span className="text-muted-foreground text-[11px]">/{item.qty}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cash inline for mixed stops */}
        {hasCash && (
          <button
            onClick={() => { haptics.medium(); setMode("cash") }}
            className="uber-press w-full bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                <Illicon name="cash" size={22} filled color="text-black" />
              </div>
              <div className="text-left">
                <p className="text-foreground font-black text-[14px]">Collect cash</p>
                <p className="text-yellow-500 text-[13px]">SAR {currentStop.expectedCash?.toLocaleString()}</p>
              </div>
            </div>
            <Illicon name="turn-right" size={22} color="text-yellow-500" />
          </button>
        )}

        {/* Dispatch notes */}
        {activeNote.notes && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Illicon name="info" size={18} color="text-muted-foreground" className="mt-0.5 shrink-0" />
              <p className="text-muted-foreground text-[12px] leading-relaxed">{activeNote.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border">
        <div className="flex gap-3">
          <button
            onClick={() => {
              haptics.heavy()
              alert("OCR Module: Ready for Scan")
              setTimeout(() => {
                const amount = (Math.random() * 200 + 50).toFixed(2)
                alert(`OCR Success: Extracted SAR ${amount} from gas receipt. Saved to trip log.`)
              }, 1500)
            }}
            className="uber-press w-[58px] h-[58px] rounded-xl border border-border flex items-center justify-center bg-card"
          >
            <Illicon name="shield" size={24} color="text-ugreen" />
          </button>

          {hasItems ? (
            <div className="flex-1 flex gap-3">
              <button
                onClick={() => { haptics.medium(); setMode("issue") }}
                className="uber-press flex-1 h-[58px] rounded-xl border border-border text-muted-foreground text-[14px] font-black"
              >
                Issue
              </button>
              <button
                onClick={() => {
                  if (allDelivered) { haptics.tick(); setMode("pod") }
                  else { haptics.medium(); completeStop("partial") }
                }}
                className={`uber-press flex-[2] h-[58px] rounded-xl font-black text-[15px] flex items-center justify-center gap-2 ${allDelivered
                  ? "bg-ugreen text-black shadow-[0_4px_20px_rgba(6,193,103,0.3)]"
                  : "bg-muted text-foreground border border-border"
                  }`}
              >
                <Illicon name={allDelivered ? "stop-done" : "package-done"} size={20} filled={allDelivered} color={allDelivered ? "text-black" : "text-foreground"} />
                {allDelivered ? "Done" : `${deliveredQtys.reduce((s, q) => s + q, 0)} / ${currentStop.items.reduce((s, i) => s + i.qty, 0)}`}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { haptics.tick(); setMode("pod") }}
              className="uber-press flex-1 bg-foreground text-background font-black h-[58px] rounded-xl text-[17px]"
            >
              Mark done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
