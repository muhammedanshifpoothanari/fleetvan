"use client"

import { useApp, type Driver, type Van, type DeliveryNote, type Stop } from "@/lib/app-context"

export default function DriverPerformance({ onBack }: { onBack: () => void }) {
  const { state } = useApp()

  const driverStats = state.drivers.map((driver: Driver) => {
    const driverNotes = state.deliveryNotes.filter((n: DeliveryNote) => n.driverId === driver.id)
    const totalStops = driverNotes.reduce((acc: number, n: DeliveryNote) => acc + n.stops.length, 0)
    const completedStops = driverNotes.reduce((acc: number, n: DeliveryNote) => acc + n.stops.filter((s: Stop) => s.status === 'done').length, 0)
    const issueStops = driverNotes.reduce((acc: number, n: DeliveryNote) => acc + n.stops.filter((s: Stop) => s.status === 'issue').length, 0)

    let totalSales = 0
    driverNotes.forEach((n: DeliveryNote) => {
      n.stops.forEach((s: Stop) => {
        if (s.status === 'done' || s.status === 'partial') {
          totalSales += (s.collectedCash || 0)
          s.items.forEach((i: any) => totalSales += (i.delivered || 0) * i.price)
        }
      })
    })

    const onTime = totalStops > 0 ? Math.round(((completedStops) / totalStops) * 100) : 100

    return {
      id: driver.id,
      initials: driver.initials,
      name: driver.name,
      van: state.vans.find((v: Van) => v.id === driver.vanId)?.plate ?? "No Van",
      loc: "Riyadh", // Could be dynamic if we had regions
      sales: `SAR ${(totalSales / 1000).toFixed(1)}k`,
      dotColor: driver.status === 'online' ? "bg-ugreen" : "bg-muted-foreground/30",
      onTime,
      issues: issueStops,
      badge: onTime >= 95 ? "Top performer" : onTime < 80 ? "Needs review" : null,
      badgeColor: onTime >= 95 ? "text-ugreen" : "text-red-500",
      badgeBg: onTime >= 95 ? "bg-ugreen/10" : "bg-red-500/10",
      trendPath: "M0 12 L10 14 L20 12 L30 13 L40 12 L50 11 L60 12 L70 12 L80 13 L90 12 L100 12", // Simplified trend
      strokeColor: onTime >= 95 ? "#06c167" : "#6b6b6b",
    }
  })

  const globalCompletion = driverStats.length > 0 ? (driverStats.reduce((a: number, b: any) => a + b.onTime, 0) / driverStats.length).toFixed(1) : "0"

  const metrics = [
    { label: "Safety score", value: "4.9", trend: "+0.2", up: true, icon: "shield" },
    { label: "Completion rate", value: `${globalCompletion}%`, trend: "+1.5%", up: true, icon: "local_shipping" },
    { label: "Total Managed", value: `SAR ${(state.totalSales / 1000).toFixed(1)}k`, trend: "Live", up: true, icon: "payments" },
  ]

  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
              <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
            </button>
            <div>
              <h1 className="text-[20px] font-black tracking-tight text-foreground">Performance</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">{driverStats.length} drivers · This week</p>
            </div>
          </div>
          <button onClick={() => alert("Feature coming soon")} className="uber-press relative w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-border/60 text-[13px]"
            placeholder="Search van or region..."
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card border border-border rounded-2xl p-3">
              <span className={`material-symbols-outlined text-[18px] ${m.up ? "text-ugreen" : "text-red-500"}`}>{m.icon}</span>
              <p className="text-[18px] font-black text-foreground mt-1 leading-none">{m.value}</p>
              <p className={`text-[10px] font-bold mt-1 ${m.up ? "text-ugreen" : "text-red-500"}`}>{m.trend}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5 leading-tight">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Driver list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black text-muted-foreground uppercase tracking-widest">Fleet drivers</p>
            <button onClick={() => alert("Feature coming soon")} className="text-[11px] font-bold text-ugreen">View all</button>
          </div>
          <div className="space-y-2">
            {driverStats.map((d) => (
              <div key={d.name} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-[15px] font-black text-foreground">
                      {d.initials}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${d.dotColor} border-2 border-card`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[14px] font-black text-foreground truncate">{d.name}</p>
                      {d.badge && (
                        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full ${d.badgeBg} ${d.badgeColor}`}>{d.badge}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{d.van}</span>
                      <span className="text-border">·</span>
                      <span>{d.loc}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-black text-foreground">{d.sales}</p>
                    <p className="text-[10px] text-muted-foreground">Total sales</p>
                  </div>
                </div>

                <div className="flex items-end gap-4 border-t border-border pt-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">On-time rate</span>
                      <span className={`font-bold ${d.onTime >= 95 ? "text-ugreen" : d.onTime >= 80 ? "text-yellow-500" : "text-red-500"}`}>{d.onTime}%</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.onTime >= 95 ? "bg-ugreen" : d.onTime >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${d.onTime}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 shrink-0">
                    <svg className="h-8 w-full" preserveAspectRatio="none" viewBox="0 0 100 25">
                      <path d={d.trendPath} fill="none" stroke={d.strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <button onClick={() => alert("Feature coming soon")} className="uber-press w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-muted-foreground text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Trust Score — The Moat */}
        <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-black text-foreground">Safety & Trust Score</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Potential insurance savings based on fleet behavior</p>
            </div>
            <div className="bg-ugreen/10 border border-ugreen/20 rounded-xl px-3 py-1.5 text-right">
              <p className="text-[20px] font-black text-ugreen leading-none">92</p>
              <p className="text-[9px] font-bold text-ugreen uppercase tracking-wide">/100</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "On-Time", value: "94%", icon: "schedule", color: "text-ugreen" },
              { label: "Issue Rate", value: `${driverStats.reduce((a, b) => a + b.issues, 0)}`, icon: "warning", color: "text-amber-500" },
              { label: "Est. Savings", value: "SAR 2.4k", icon: "savings", color: "text-blue-400" },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-3">
                <span className={`material-symbols-outlined text-[22px] ${s.color}`}>{s.icon}</span>
                <p className={`text-[16px] font-black mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-400 text-[18px] mt-0.5 shrink-0">verified_user</span>
            <p className="text-[11px] text-blue-300 leading-snug">
              Your fleet safety score of <strong>92</strong> qualifies for a <strong>12% premium reduction</strong> with partner insurers. Share this report to claim savings.
            </p>
          </div>
        </div>

        {/* Smart Maintenance Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black text-muted-foreground uppercase tracking-widest">Smart Maintenance</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500">
              {state.vans.filter((v: any) => v.status === "maintenance").length + 1} alerts
            </span>
          </div>
          <div className="space-y-2">
            {state.vans.slice(0, 3).map((van: any, idx: number) => {
              const kmUntilService = 5000 - (idx * 1847) // Simulated
              const isUrgent = kmUntilService < 1000
              return (
                <div key={van.id} className={`bg-card border rounded-2xl p-4 flex items-center gap-4 ${isUrgent ? "border-red-500/30" : "border-border"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUrgent ? "bg-red-500/10" : "bg-muted"}`}>
                    <span className={`material-symbols-outlined text-[20px] ${isUrgent ? "text-red-500" : "text-muted-foreground"}`}>build</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-foreground">{van.plate} — {van.model ?? "Van"}</p>
                    <p className={`text-[11px] mt-0.5 ${isUrgent ? "text-red-400" : "text-muted-foreground"}`}>
                      {isUrgent ? `⚠ Overdue by ${Math.abs(kmUntilService).toLocaleString()} km` : `Service in ${kmUntilService.toLocaleString()} km`}
                    </p>
                  </div>
                  <button onClick={() => alert("Feature coming soon")} className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${isUrgent ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"}`}>
                    {isUrgent ? "Book Now" : "View"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

      </main>

      {/* Bottom Nav */}
      <nav className="bg-background border-t border-border px-5 py-3 pb-8 flex justify-around items-center shrink-0">
        {[
          { icon: "map", label: "Map" },
          { icon: "bar_chart", label: "Performance", active: true },
          { icon: "local_shipping", label: "Vehicles" },
          { icon: "more_horiz", label: "More" },
        ].map((item) => (
          <button onClick={() => alert("Feature coming soon")} key={item.label} className="uber-press flex flex-col items-center gap-1">
            <span
              className={`material-symbols-outlined text-[24px] ${item.active ? "text-foreground" : "text-muted-foreground"}`}
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >{item.icon}</span>
            <span className={`text-[10px] ${item.active ? "font-black text-foreground" : "font-medium text-muted-foreground"}`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
