"use client"

import { useApp } from "@/lib/app-context"

const menuItems = [
  { icon: "description", label: "Documents", sub: "License, Van Permit" },
  { icon: "payments", label: "Payment & tax", sub: "Manage payout methods" },
  { icon: "settings", label: "App settings", sub: "Language: English" },
  { icon: "help", label: "Help & support", sub: null },
  { icon: "info", label: "About", sub: "Version 4.20.1" },
]

export default function DriverProfile({ onBack }: { onBack: () => void }) {
  const { goTo, state, activeDriver, dispatch } = useApp()
  const driver = activeDriver ?? state.drivers[0]

  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-[24px] font-black tracking-tight text-foreground">Account</h1>
        </div>
        <button onClick={() => alert("Feature coming soon")} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
          <span className="material-symbols-outlined text-foreground text-[22px]">notifications</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Profile section */}
        <section className="flex flex-col items-center pt-4 pb-8 px-5">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center text-[30px] font-black text-foreground">
              {driver?.initials ?? "D"}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-ugreen text-black text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border-2 border-background shadow">
              <span>{driver?.rating ?? "4.9"}</span>
              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
          </div>
          <h2 className="text-[22px] font-black text-foreground text-center">{driver?.name ?? "Ahmed Al-Sudairi"}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-muted border border-border rounded-full text-[11px] font-bold text-muted-foreground">Bronze Member</span>
            <span className="px-3 py-1 bg-muted border border-border rounded-full text-[11px] font-bold text-muted-foreground">ID: 849201</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 w-full mt-6 py-4 border-t border-b border-border">
            {[
              { label: "Trips", value: (driver?.trips ?? 847).toLocaleString() },
              { label: "Accept", value: `${driver?.acceptance ?? 98}%` },
              { label: "Rating", value: `${driver?.rating ?? 4.9}★` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                <span className="text-[20px] font-black text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Performance Mode (Elon Tier) */}
          <div className="w-full mt-2 px-1">
            <button
              onClick={() => { dispatch({ type: "TOGGLE_LUDICROUS" }) }}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${state.ludicrousMode ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "bg-card border-border"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${state.ludicrousMode ? "bg-cyan-500/20" : "bg-muted"}`}>
                  <span className={`material-symbols-outlined text-[22px] ${state.ludicrousMode ? "text-cyan-400 animate-pulse" : "text-muted-foreground"}`}>bolt</span>
                </div>
                <div className="text-left">
                  <p className={`text-[14px] font-black ${state.ludicrousMode ? "text-cyan-400" : "text-foreground"}`}>Ludicrous Mode</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{state.ludicrousMode ? "Maximum throughput active" : "Optimize for standard efficiency"}</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${state.ludicrousMode ? "bg-cyan-500/40" : "bg-muted-foreground/20"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${state.ludicrousMode ? "left-5 bg-cyan-400" : "left-1"}`} />
              </div>
            </button>
          </div>
        </section>

        {/* Menu items */}
        <div className="mx-5 bg-card border border-border rounded-2xl overflow-hidden mb-5">
          {menuItems.map((item, i) => (
            <button onClick={() => alert("Feature coming soon")}
              key={item.label}
              className={`uber-press w-full flex items-center justify-between px-4 py-4 ${i < menuItems.length - 1 ? "border-b border-border" : ""
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <span className="material-symbols-outlined text-muted-foreground text-[20px]">{item.icon}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[14px] font-bold text-foreground">{item.label}</span>
                  {item.sub && <span className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</span>}
                </div>
              </div>
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-5 pb-6">
          <button onClick={() => goTo("launcher")} className="uber-press w-full flex items-center justify-center gap-2 bg-muted border border-border text-muted-foreground font-bold text-[14px] py-4 rounded-2xl">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign out
          </button>
          <p className="text-center text-[10px] text-muted-foreground mt-5">Partner since 2021 · Riyadh, KSA</p>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bg-background border-t border-border px-5 pb-8 pt-3 flex justify-between items-center shrink-0">
        {([
          { id: "home", icon: "home", label: "Home" },
          { id: "earnings", icon: "attach_money", label: "Earnings" },
          { id: "inbox", icon: "inbox", label: "Inbox" },
          { id: "profile", icon: "person", label: "Account", active: true },
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
    </div>
  )
}
