"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"

const ALERTS = [
  { type: "critical", title: "Van 402: Route deviation", desc: "Vehicle has left the designated geofence in Al Olaya without authorization.", time: "2m ago", hasActions: true },
  { type: "warning", title: "Van 105: Low fuel", desc: "Fuel below 15%. Nearest SASCO station is 5km away.", time: "15m ago" },
  { type: "info", title: "Maintenance scheduled", desc: "Van 303 due for service tomorrow at 09:00 at Riyadh Service Center.", time: "1h ago", hasDetails: true },
  { type: "warning", title: "Van 201: Idling", desc: "Vehicle idling for 45+ minutes in King Abdullah Financial District.", time: "2h ago" },
]

const TYPE_META: Record<string, { label: string; dot: string; border: string; bg: string; labelColor: string }> = {
  critical: { label: "Critical", dot: "bg-red-500 animate-pulse", border: "border-l-red-500", bg: "bg-red-500/10 text-red-600", labelColor: "text-red-600" },
  warning: { label: "Warning", dot: "bg-amber-500", border: "border-l-amber-500", bg: "bg-amber-500/10 text-amber-600", labelColor: "text-amber-600" },
  info: { label: "Info", dot: "bg-muted-foreground/30", border: "border-l-border", bg: "bg-muted text-muted-foreground", labelColor: "text-muted-foreground" },
}

export default function AlertsPanel({ onBack }: { onBack: () => void }) {
  const { goTo } = useApp()
  const [activeFilter, setActiveFilter] = useState("All")
  const [markedRead, setMarkedRead] = useState(false)

  const filteredAlerts = activeFilter === "All"
    ? ALERTS
    : ALERTS.filter((a) => a.type === activeFilter.toLowerCase())
  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-[20px] font-black tracking-tight text-foreground">Alerts</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Updated just now</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-600 text-[11px] font-bold">4 active</span>
        </div>
      </header>

      {/* Filter chips */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none" }}>
        {["All", "Critical", "Warning", "Info"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`uber-press px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${activeFilter === f
                ? f === "Critical" ? "bg-red-500/10 border border-red-500/20 text-red-600"
                  : f === "Warning" ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
                    : f === "Info" ? "bg-muted border border-border text-muted-foreground"
                      : "bg-ugreen text-black"
                : "bg-muted/50 border border-border/50 text-muted-foreground"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        {filteredAlerts.map((alert) => {
          const meta = TYPE_META[alert.type]
          return (
            <div
              key={alert.title}
              className={`bg-card border border-border border-l-2 ${meta.border} rounded-2xl p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border border-current/20 ${meta.bg}`}>
                    {meta.label}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{alert.time}</span>
              </div>
              <h3 className="text-[15px] font-black text-foreground leading-tight mb-1">{alert.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{alert.desc}</p>

              {alert.hasActions && (
                <div className="flex gap-2">
                  <button onClick={() => goTo("map")} className="uber-press flex-1 flex items-center justify-center gap-2 bg-ugreen text-black font-black text-[12px] py-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    View map
                  </button>
                  <button onClick={() => window.location.href = "tel:+966500000000"} className="uber-press flex-1 flex items-center justify-center gap-2 bg-muted border border-border text-foreground font-bold text-[12px] py-2.5 rounded-xl">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Call driver
                  </button>
                </div>
              )}
              {alert.hasDetails && (
                <button onClick={() => alert("Feature coming soon")} className="flex items-center gap-1.5 text-ugreen text-[12px] font-bold mt-2">
                  <span>View details</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 py-4 pb-8 border-t border-border">
        <button onClick={() => alert("Feature coming soon")} className="uber-press w-full flex items-center justify-center gap-2 text-muted-foreground text-[13px] font-bold py-2">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Mark all read
        </button>
      </div>
    </div>
  )
}
