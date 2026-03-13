"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"

const TABS = ["General", "Regional", "Fleet Rules", "Integrations", "Team"]

const RULES = [
  { icon: "alt_route", title: "Route optimization", desc: "AI-driven adjustments based on traffic and prayer times." },
  { icon: "fact_check", title: "Mandatory pre-trip check", desc: "Drivers must complete a 4-point inspection before departure is enabled." },
  { icon: "speed", title: "Highway speed limit", desc: "Governs vehicle speed to 120 km/h on GCC highways. Requires OBD device." },
]

export default function FleetSettings({ onBack }: { onBack: () => void }) {
  const { goTo } = useApp()
  const [activeTab, setActiveTab] = useState("Fleet Rules")
  const [toggles, setToggles] = useState({ "Route optimization": true, "Mandatory pre-trip check": true, "Highway speed limit": false })
  const toggle = (key: string) => setToggles((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))

  return (
    <div className="flex h-full w-full flex-col bg-background dark:bg-u100 text-foreground dark:text-white overflow-hidden">
      {/* Header */}
      <header className="bg-background dark:bg-u100 border-b border-border dark:border-white/[0.07] pt-12 pb-0 shrink-0">
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-foreground dark:text-white text-[22px]">arrow_back</span>
            </button>
            <h1 className="text-[20px] font-black tracking-tight text-foreground dark:text-white">Fleet Config</h1>
          </div>
          <button onClick={() => alert("Feature coming soon")} className="uber-press w-10 h-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground dark:text-white text-[20px]">search</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-5 gap-5 pb-0" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 pb-3 text-[13px] font-bold transition-colors border-b-2 ${activeTab === tab ? "text-foreground dark:text-white border-foreground dark:border-white" : "text-muted-foreground dark:text-u600 border-transparent"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-3" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-[17px] font-black text-foreground dark:text-white">Active rules</h2>
            <p className="text-[11px] text-muted-foreground dark:text-u600 mt-0.5">Operational constraints for GCC fleets</p>
          </div>
          <button onClick={() => alert("Feature coming soon")} className="uber-press w-9 h-9 rounded-xl bg-muted dark:bg-white/5 border border-border dark:border-white/[0.07] flex items-center justify-center">
            <span className="material-symbols-outlined text-muted-foreground dark:text-u600 text-[20px]">tune</span>
          </button>
        </div>

        {RULES.map((rule) => {
          const isOn = toggles[rule.title as keyof typeof toggles]
          return (
            <div key={rule.title} className={`bg-card dark:bg-u300 border rounded-2xl p-4 transition-all ${isOn ? "border-border dark:border-white/10" : "border-border/50 dark:border-white/[0.04] opacity-70"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOn ? "bg-muted dark:bg-white/5" : "bg-muted/50 dark:bg-white/[0.03]"}`}>
                    <span className={`material-symbols-outlined text-[20px] ${isOn ? "text-ugreen dark:text-ugreen" : "text-muted-foreground dark:text-u600"}`}>{rule.icon}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${isOn ? "bg-ugreen/10 dark:bg-ugreen-10 text-ugreen dark:text-ugreen" : "bg-muted dark:bg-white/5 text-muted-foreground dark:text-u600"}`}>
                    {isOn ? "Active" : "Off"}
                  </span>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggle(rule.title)}
                  className={`uber-press w-12 h-6 rounded-full relative transition-colors shrink-0 ${isOn ? "bg-ugreen dark:bg-ugreen" : "bg-muted dark:bg-white/10"}`}
                >
                  <span className={`absolute top-[2px] h-5 w-5 bg-white dark:bg-white rounded-full shadow transition-all ${isOn ? "left-[26px]" : "left-[2px]"}`} />
                </button>
              </div>
              <h3 className={`text-[14px] font-black mb-1 ${isOn ? "text-foreground dark:text-white" : "text-muted-foreground dark:text-u600"}`}>{rule.title}</h3>
              <p className="text-[11px] text-muted-foreground dark:text-u700 leading-relaxed">{rule.desc}</p>
            </div>
          )
        })}

        {/* Fuel limit card */}
        <div className="bg-card dark:bg-u300 border border-border dark:border-white/[0.07] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-muted dark:bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-muted-foreground dark:text-u600 text-[20px]">credit_card</span>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="uber-press w-8 h-8 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-muted-foreground dark:text-u600 text-[18px]">edit</span>
            </button>
          </div>
          <h3 className="text-[14px] font-black text-foreground dark:text-white mb-1">Fuel credit limit</h3>
          <p className="text-[11px] text-muted-foreground dark:text-u600 mb-3">Daily max per driver</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-black text-foreground dark:text-white leading-none">500</span>
            <span className="text-[14px] font-bold text-muted-foreground dark:text-u700">SAR</span>
            <span className="text-[11px] text-muted-foreground dark:text-u600">/ day</span>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2 pb-4">
          <button onClick={() => alert("Settings saved!")} className="uber-press w-full h-[58px] bg-ugreen dark:bg-white text-black dark:text-black font-black text-[17px] rounded-xl flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check</span>
            Save changes
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-background dark:bg-u100 border-t border-border dark:border-white/[0.07] px-5 pb-8 pt-3 flex justify-around items-center shrink-0">
        {[
          { id: "dashboard", icon: "dashboard", label: "Dashboard" },
          { id: "kanban", icon: "local_shipping", label: "Fleet" },
          { id: "fleet-settings", icon: "settings", label: "Settings", active: true },
          { id: "profile", icon: "person", label: "Profile" },
        ].map((item) => (
          <button key={item.label} onClick={() => goTo(item.id)} className="uber-press flex flex-col items-center gap-1">
            <span
              className={`material-symbols-outlined text-[24px] ${item.active ? "text-foreground dark:text-white" : "text-muted-foreground dark:text-u600"}`}
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >{item.icon}</span>
            <span className={`text-[10px] ${item.active ? "font-black text-foreground dark:text-white" : "font-medium text-muted-foreground dark:text-u600"}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
