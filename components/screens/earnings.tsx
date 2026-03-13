"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"

export default function Earnings({ onBack }: { onBack: () => void }) {
  const { state, goTo } = useApp()
  const [cashoutState, setCashoutState] = useState<"idle" | "confirm" | "processing" | "done">("idle")

  // Derive today's commission (e.g., 10% of sales)
  const totalSalesToday = state.activityLogs.reduce((acc, log) => acc + log.amount, 0)
  const dailyEarnings = Math.round(totalSalesToday * 0.1) // 10% commission
  const completedDeliveries = state.activityLogs.length
  const availableBalance = dailyEarnings + 450 // Accumulated

  const days = [
    { d: "Mon", h: 20 }, { d: "Tue", h: 45 }, { d: "Wed", h: 35 },
    { d: "Thu", h: 60 }, { d: "Fri", h: 50 }, { d: "Sat", h: 30 },
    { d: "Sun", h: Math.min(100, (dailyEarnings / 500) * 100), active: true },
  ]

  const handleCashout = () => {
    setCashoutState("processing")
    setTimeout(() => setCashoutState("done"), 1800)
  }

  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-[20px] font-black tracking-tight text-foreground">Earnings</h1>
        </div>
        <button
          onClick={() => setCashoutState("confirm")}
          className="uber-press flex items-center gap-2 bg-ugreen text-black font-black text-[12px] px-4 py-2 rounded-full"
        >
          <span className="material-symbols-outlined text-[16px]">account_balance</span>
          Cash out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-6 space-y-6" style={{ scrollbarWidth: "none" }}>
        {/* Today total */}
        <section className="pt-6 flex flex-col items-center gap-1">
          <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{"Today's earnings"}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-black text-muted-foreground">SAR</span>
            <span className="text-[56px] font-black text-foreground leading-none tracking-tight">{dailyEarnings.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-ugreen font-black text-[11px]">+12.5% vs yesterday</span>
            <span className="text-muted-foreground text-[10px] whitespace-pre">  ·  </span>
            <span className="text-muted-foreground text-[10px] font-bold">{completedDeliveries} deliveries</span>
          </div>
        </section>

        {/* Available Balance Card */}
        <section>
          <div className="bg-gradient-to-br from-ugreen/10 to-ugreen/5 border border-ugreen/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-ugreen/70 uppercase tracking-widest mb-1">Available for cashout</p>
                <p className="text-[28px] font-black text-foreground leading-none">SAR {availableBalance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-ugreen/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-ugreen text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-ugreen text-[14px]">bolt</span>
              <span className="text-[11px] font-bold text-ugreen/80">Instant transfer — arrives in minutes</span>
            </div>
          </div>
        </section>

        {/* Marketplace Status (Travis Tier) */}
        <section>
          <div className={`rounded-2xl p-5 border transition-all ${state.surgeMultiplier > 1 ? "bg-orange-500 text-black border-orange-400 shadow-[0_8px_24px_rgba(249,115,22,0.3)]" : "bg-card border-border"}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${state.surgeMultiplier > 1 ? "text-black/60" : "text-muted-foreground"}`}>Marketplace Status</p>
                <h3 className="text-[20px] font-black mt-1">{state.surgeMultiplier > 1 ? "Surge Active" : "Normal Demand"}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${state.surgeMultiplier > 1 ? "bg-black/10" : "bg-muted"}`}>
                <span className={`material-symbols-outlined text-[28px] ${state.surgeMultiplier > 1 ? "text-black" : "text-muted-foreground"}`}>trending_up</span>
              </div>
            </div>

            {state.surgeMultiplier > 1 ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[24px] font-black">{state.surgeMultiplier}x</p>
                    <p className="text-[11px] font-bold text-black/60 uppercase">Earning Multiplier</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black">Riyadh Central</p>
                    <p className="text-[11px] font-bold text-black/60 uppercase">High Demand Zone</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black/60 animate-pulse" style={{ width: '85%' }} />
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-muted-foreground mt-3">Riyadh demand is currently stable. No multipliers available.</p>
            )}
          </div>
        </section>

        {/* Weekly chart */}
        <section>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Weekly total</p>
                <p className="text-[22px] font-black text-foreground">SAR {(2450 + dailyEarnings).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-ugreen/10 border border-ugreen/20 px-2.5 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-ugreen text-[14px]">trending_up</span>
                <span className="text-ugreen text-[11px] font-bold">+5.2%</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 items-end h-28">
              {days.map((d) => (
                <div key={d.d} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${d.active ? "bg-ugreen shadow-[0_0_12px_rgba(6,193,103,0.3)]" : "bg-muted"}`}
                    style={{ height: `${Math.max(10, d.h)}%` }}
                  />
                  <span className={`text-[9px] font-bold uppercase ${d.active ? "text-foreground" : "text-muted-foreground"}`}>{d.d}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cash breakdown */}
        <section className="grid grid-cols-2 gap-2">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-yellow-500 text-[20px]">payments</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Cash on hand</p>
            <p className="text-[18px] font-black text-foreground">SAR {state.cashCollected.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-blue-400 text-[20px]">receipt_long</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Credit ledger</p>
            <p className="text-[18px] font-black text-foreground">SAR {(totalSalesToday - state.cashCollected > 0 ? totalSalesToday - state.cashCollected : 0).toLocaleString()}</p>
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black text-muted-foreground uppercase tracking-widest">Recent Activity</p>
            <button onClick={() => alert("Feature coming soon")} className="text-[11px] font-bold text-ugreen">See all</button>
          </div>
          <div className="space-y-0 text-foreground">
            {state.activityLogs.slice(0, 8).map((a, i) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 py-4 ${i < state.activityLogs.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[20px] ${a.type === 'cash' ? "text-yellow-500" : "text-blue-400"}`}>{a.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-extrabold truncate">Delivery at {a.loc}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-muted-foreground font-medium">{a.time}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className={`text-[11px] font-bold ${a.type === 'cash' ? "text-yellow-500" : "text-blue-400"}`}>
                      {a.type === 'cash' ? "Cash collected" : "Credit invoice"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[14px] font-black">SAR {a.amount.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-ugreen uppercase tracking-widest mt-1">Completed</span>
                </div>
              </div>
            ))}
            {state.activityLogs.length === 0 && (
              <p className="text-center py-10 text-muted-foreground text-[13px] font-bold italic">No deliveries recorded yet today.</p>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-background border-t border-border px-5 pb-8 pt-3 flex justify-between items-center shrink-0">
        {([
          { id: "home", icon: "home", label: "Home" },
          { id: "earnings", icon: "attach_money", label: "Earnings", active: true },
          { id: "inbox", icon: "inbox", label: "Inbox" },
          { id: "profile", icon: "person", label: "Account" },
        ] as { id: string; icon: string; label: string; active?: boolean }[]).map((item) => (
          <button key={item.id} onClick={() => goTo(item.id)} className="uber-press flex flex-col items-center gap-1">
            <span
              className={`material-symbols-outlined text-[26px] ${item.active ? "text-foreground" : "text-muted-foreground"}`}
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >{item.icon}</span>
            <span className={`text-[10px] ${item.active ? "font-black text-foreground" : "font-medium text-muted-foreground"}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Cashout Modal Overlay ──────────────────────────────────────────── */}
      {cashoutState !== "idle" && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-background w-full rounded-t-[28px] p-6 pb-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            {cashoutState === "confirm" && (
              <>
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-ugreen/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-ugreen text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] text-muted-foreground uppercase tracking-widest mb-1">Transfer to bank</p>
                    <p className="text-[36px] font-black text-foreground leading-none">SAR {availableBalance.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3 w-full flex items-center gap-3">
                    <span className="material-symbols-outlined text-muted-foreground text-[20px]">account_balance</span>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Al Rajhi Bank ····4521</p>
                      <p className="text-[11px] text-muted-foreground">Arrives instantly</p>
                    </div>
                  </div>
                </div>
                <button onClick={handleCashout} className="uber-press w-full h-[58px] bg-ugreen text-black rounded-xl font-black text-[17px] tracking-wide mb-3">
                  Confirm Transfer
                </button>
                <button onClick={() => setCashoutState("idle")} className="uber-press w-full h-[48px] bg-muted text-foreground rounded-xl font-bold text-[15px]">
                  Cancel
                </button>
              </>
            )}
            {cashoutState === "processing" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-ugreen/10 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-ugreen text-[32px] animate-spin">sync</span>
                </div>
                <p className="text-[18px] font-black text-foreground">Processing transfer...</p>
                <p className="text-[13px] text-muted-foreground">This usually takes a few seconds</p>
              </div>
            )}
            {cashoutState === "done" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-20 h-20 rounded-full bg-ugreen/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-ugreen text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="text-center">
                  <p className="text-[22px] font-black text-foreground mb-1">Transfer complete</p>
                  <p className="text-[14px] text-muted-foreground">SAR {availableBalance.toLocaleString()} sent to Al Rajhi Bank</p>
                </div>
                <button onClick={() => setCashoutState("idle")} className="uber-press w-full h-[54px] bg-foreground text-background rounded-xl font-black text-[16px] tracking-wide mt-2">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
