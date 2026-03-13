"use client"

import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { useAudio } from "@/hooks/use-audio"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
}

export default function DailySummary({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { state, activeNote } = useApp()
  const haptics = useHaptics()
  const { playClick } = useAudio()

  const stops = activeNote?.stops ?? []
  const totalStops = stops.length
  const doneStops = stops.filter((s) => s.status === "done").length
  const issueStops = stops.filter((s) => s.status === "issue" || s.status === "partial").length
  const skippedStops = stops.filter((s) => s.status === "skipped").length

  const expectedCash = stops.reduce((s, stop) => s + (stop.expectedCash ?? 0), 0)
  const collectedCash = state.cashCollected
  const cashVariance = collectedCash - expectedCash
  const booksBalanced = cashVariance === 0

  const totalItemsOrdered = stops.reduce((sum, stop) => sum + stop.items.reduce((s2, i) => s2 + i.qty, 0), 0)
  const totalItemsDelivered = stops.reduce((sum, stop) => sum + stop.items.reduce((s2, i) => s2 + (i.delivered ?? 0), 0), 0)
  const returnsExpected = totalItemsOrdered - totalItemsDelivered

  const driver = state.drivers.find((d) => activeNote?.driverId === d.id) ?? state.drivers[0]
  const van = state.vans.find((v) => activeNote?.vanId === v.id) ?? state.vans[0]

  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none px-5 pt-12 pb-3 bg-background z-20 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border text-foreground"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <h1 className="text-[18px] font-black tracking-tight text-foreground">Shift summary</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-4 bg-background" style={{ scrollbarWidth: "none" }}>

        {/* Status banner */}
        <div className="px-5 py-4">
          <div className={`rounded-2xl p-5 flex items-center justify-between border-l-4 ${booksBalanced ? "bg-card border-[#06c167]" : "bg-red-500/10 border-red-500"
            }`}>
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-black text-foreground leading-tight">
                {booksBalanced ? "Books balanced" : `Cash short SAR ${Math.abs(cashVariance).toLocaleString()}`}
              </h2>
              <p className="text-muted-foreground text-[13px]">
                {booksBalanced ? "No variance. You're done." : "Check before closing out."}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${booksBalanced ? "bg-[#06c167]/15" : "bg-red-500/15"
              }`}>
              <Illicon
                name={booksBalanced ? "stop-done" : "stop-issue"}
                size={28}
                filled
                color={booksBalanced ? "text-[#06c167]" : "text-red-500"}
              />
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="px-5 grid grid-cols-2 gap-3 mb-4">
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Illicon name="cash" size={44} filled color="text-foreground" />
            </div>
            <p className="text-muted-foreground text-[13px] font-bold">Cash collected</p>
            <div>
              <p className="text-foreground text-[22px] font-black tracking-tight">
                SAR {collectedCash.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Target: SAR {expectedCash.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Illicon name="package" size={44} filled color="text-foreground" />
            </div>
            <p className="text-muted-foreground text-[13px] font-bold">Delivered</p>
            <div>
              <p className="text-foreground text-[22px] font-black tracking-tight">{totalItemsDelivered}</p>
              <p className="text-[11px] text-muted-foreground mt-1">of {totalItemsOrdered} items</p>
            </div>
          </div>
        </div>

        {/* Warehouse Returns */}
        {returnsExpected > 0 && (
          <div className="px-5 mb-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500">assignment_return</span>
                </div>
                <div>
                  <p className="text-[14px] font-black text-foreground">Return to Warehouse</p>
                  <p className="text-[12px] text-muted-foreground">Undelivered items to drop off</p>
                </div>
              </div>
              <span className="text-[20px] font-black text-orange-500">{returnsExpected}</span>
            </div>
          </div>
        )}

        {/* Stop breakdown */}
        <div className="px-5 mb-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-black text-foreground text-[15px]">Stops</h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Completed", count: doneStops, icon: "stop-done" as const, color: "text-[#06c167]" },
                { label: "Issues / Partial", count: issueStops, icon: "stop-partial" as const, color: "text-yellow-500" },
                { label: "Skipped", count: skippedStops, icon: "stop-skipped" as const, color: "text-red-500" },
                { label: "Total", count: totalStops, icon: "route" as const, color: "text-muted-foreground" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Illicon name={row.icon} size={20} filled color={row.color} />
                    <span className="text-[13px] font-medium text-foreground">{row.label}</span>
                  </div>
                  <span className="text-[15px] font-black text-foreground font-mono">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Efficiency HUD (Travis Edition) */}
        <div className="px-5 mb-4">
          <div className="bg-foreground text-background rounded-2xl p-5 border border-border overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Efficiency HUD</p>
                <h3 className="text-[18px] font-black">Unit Economics</h3>
              </div>
              <div className="px-2 py-0.5 rounded bg-ugreen text-black text-[9px] font-black">SURGE ACTIVE {state.surgeMultiplier}x</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[20px] font-black leading-none">{state.deadMilesKm.toFixed(1)} km</p>
                <p className="text-[10px] opacity-50 mt-1 uppercase font-bold">Dead Miles (No Cargo)</p>
              </div>
              <div>
                <p className="text-[20px] font-black leading-none">{state.idleTimeMins} min</p>
                <p className="text-[10px] opacity-50 mt-1 uppercase font-bold">Idle Time (Non-Revenue)</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-background/10">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold opacity-70">Fleet Utilization Score</span>
                <span className="text-[14px] font-black text-ugreen">94.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Loop: Referral Marketplace */}
        <div className="px-5 mb-4">
          <button
            onClick={() => haptics.medium()}
            className="w-full bg-ugreen p-5 rounded-2xl flex items-center justify-between border border-black/10 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-[28px]">group_add</span>
              </div>
              <div className="text-left">
                <p className="text-black font-black text-[15px] leading-tight">Refer & Earn</p>
                <p className="text-black/60 text-[11px]">Grow the fleet, earn SAR 500</p>
              </div>
            </div>
            <div className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-black text-black">
              GF-8102
            </div>
          </button>
        </div>

        {/* Shift details */}
        <div className="px-5 mb-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-black text-foreground text-[15px]">Shift details</h3>
            </div>
            <div className="divide-y divide-border px-5">
              {[
                { icon: "driver" as const, label: "Driver", value: driver?.name ?? "—" },
                { icon: "van" as const, label: "Van", value: `${van?.model ?? "—"} · ${van?.plate ?? "—"}` },
                { icon: "receipt" as const, label: "Delivery note", value: activeNote?.id ?? "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Illicon name={item.icon} size={18} color="text-muted-foreground" />
                    </div>
                    <span className="text-[13px] font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-bold text-foreground text-right max-w-[160px] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stop log */}
        {stops.length > 0 && (
          <div className="px-5 mb-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-black text-foreground text-[15px]">Stop log</h3>
              </div>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-border"
              >
                {stops.map((stop, idx) => {
                  const statusColor = {
                    done: { bg: "bg-[#06c167]/15", text: "text-[#06c167]", badge: "bg-[#06c167]/15 text-[#06c167]" },
                    partial: { bg: "bg-yellow-400/15", text: "text-yellow-500", badge: "bg-yellow-400/15 text-yellow-500" },
                    issue: { bg: "bg-red-400/15", text: "text-red-500", badge: "bg-red-400/15 text-red-500" },
                    skipped: { bg: "bg-muted", text: "text-muted-foreground", badge: "bg-muted text-muted-foreground" },
                    pending: { bg: "bg-muted", text: "text-muted-foreground", badge: "bg-muted text-muted-foreground" },
                  }[stop.status] ?? { bg: "bg-muted", text: "text-muted-foreground", badge: "bg-muted text-muted-foreground" }

                  return (
                    <motion.div variants={itemVariants} key={stop.id} className="flex items-center gap-4 px-5 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-black ${statusColor.bg} ${statusColor.text}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-foreground truncate">{stop.customerName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{stop.address}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColor.badge}`}>
                        {stop.status}
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </div>
        )}
      </main>

      {/* Close shift CTA */}
      <div className="shrink-0 bg-background border-t border-border p-5 pb-8 z-30">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Illicon name="info" size={14} color={booksBalanced ? "text-muted-foreground" : "text-red-500"} />
          <p className={`text-[12px] ${booksBalanced ? "text-muted-foreground" : "text-red-500 font-bold"}`}>
            {booksBalanced ? "This ends your shift and takes you offline." : "Manager override required for cash variance."}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => {
            haptics.heavy()
            playClick()
            onNext?.()
          }}
          className={`w-full font-black text-[17px] h-[58px] rounded-xl flex items-center justify-between px-6 ${booksBalanced ? "bg-foreground text-background" : "bg-red-500 text-white"
            }`}
        >
          <span className="font-black tracking-wide">{booksBalanced ? "CLOSE SHIFT" : "SUBMIT VARIANCE REPORT"}</span>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${booksBalanced ? "bg-background/10" : "bg-white/20"}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {booksBalanced ? "power_settings_new" : "warning"}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
