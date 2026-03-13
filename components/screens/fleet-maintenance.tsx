"use client"

import { useApp } from "@/lib/app-context"

interface FleetMaintenanceProps {
  onBack: () => void
}

export default function FleetMaintenance({ onBack }: FleetMaintenanceProps) {
  const { goTo } = useApp()
  return (
    <div className="bg-background text-foreground flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
              <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
            </button>
            <h1 className="text-[20px] font-black tracking-tight text-foreground">Maintenance</h1>
          </div>
          <button onClick={() => alert("Feature coming soon")} className="uber-press bg-ugreen hover:bg-ugreen/90 text-black text-[12px] font-black px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">add</span>
            SCHEDULE
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-ugreen placeholder-muted-foreground text-foreground" placeholder="Search Van ID or Driver" type="text" />
            </div>
            <button onClick={() => alert("Feature coming soon")} className="uber-press bg-muted hover:bg-muted/80 text-foreground rounded-lg p-2.5 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="px-5 pb-3 flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => alert("Feature coming soon")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/10 text-foreground text-xs font-semibold whitespace-nowrap">
            <span>All Vehicles</span>
            <span className="bg-foreground/10 px-1.5 rounded text-[10px]">24</span>
          </button>
          {[
            { color: "bg-red-500", label: "Urgent Issue" },
            { color: "bg-amber-500", label: "Service Due" },
            { color: "bg-emerald-500", label: "Healthy" },
          ].map((f) => (
            <button onClick={() => alert("Feature coming soon")} key={f.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-xs font-medium whitespace-nowrap hover:bg-muted">
              <span className={`w-2 h-2 rounded-full ${f.color}`} />
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Vehicle List */}
      <main className="flex-1 px-5 py-4 space-y-3 pb-4 overflow-y-auto">
        {/* Card 1: Urgent */}
        <div className="group relative bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.99] transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                <span className="text-[12px] font-bold text-foreground">AF</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">VAN-402</h3>
                <p className="text-xs text-muted-foreground">Ahmed Al-Farsi</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Urgent</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-0.5">Upcoming Service</span>
              <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                Immediate Action
              </span>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="text-muted-foreground hover:text-ugreen transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Card 2: Service Due (Expanded) */}
        <div className="group relative bg-card rounded-2xl p-4 shadow-sm border border-ugreen/50 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-ugreen" />
          <div className="flex justify-between items-start mb-3 pl-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                <span className="text-[12px] font-bold text-foreground">SJ</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">VAN-209</h3>
                <p className="text-xs text-muted-foreground">Sarah Johnson</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Due Soon</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-4 pl-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-0.5">Upcoming Service</span>
              <span className="text-sm font-medium text-foreground">Oct 24, 2023</span>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-ugreen">
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
          </div>

          {/* Timeline */}
          <div className="mt-4 pt-4 border-t border-border/50 pl-2">
            <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Maintenance History</h4>
            <div className="relative pl-4 border-l border-border space-y-5">
              {[
                { title: "Brake Pad Replacement", date: "Today • 2:30 PM", cost: "Running", dotColor: "bg-ugreen" },
                { title: "Oil Change", date: "Aug 12, 2023", cost: "500 SAR", dotColor: "bg-muted" },
                { title: "Tyre Rotation", date: "May 04, 2023", cost: "200 SAR", dotColor: "bg-muted" },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${item.dotColor} ring-4 ring-background`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-semibold ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => alert("Feature coming soon")} className="w-full mt-4 py-2 text-xs font-bold text-ugreen hover:bg-ugreen/5 rounded-lg transition-colors">
              VIEW FULL HISTORY
            </button>
          </div>
        </div>

        {/* Card 3: Healthy */}
        <div className="group relative bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.99] transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                <span className="text-[12px] font-bold text-foreground">MC</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">VAN-104</h3>
                <p className="text-xs text-muted-foreground">Michael Chen</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Healthy</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-0.5">Upcoming Service</span>
              <span className="text-sm font-medium text-foreground">Nov 15, 2023</span>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="text-muted-foreground hover:text-ugreen transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Card 4: Healthy */}
        <div className="group relative bg-card rounded-2xl p-4 shadow-sm border border-border active:scale-[0.99] transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                <span className="text-[12px] font-bold text-foreground">KA</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">VAN-330</h3>
                <p className="text-xs text-muted-foreground">Khalid Al-Saud</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Healthy</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-0.5">Upcoming Service</span>
              <span className="text-sm font-medium text-foreground">Dec 02, 2023</span>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="text-muted-foreground hover:text-ugreen transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-background border-t border-border pt-2 px-2 z-50 pb-6">
        <div className="flex items-center justify-around pb-4">
          {[
            { id: "home", icon: "home", label: "Home", active: false },
            { id: "map", icon: "map", label: "Map", active: false },
            { id: "fleet-maintenance", icon: "build", label: "Maint.", active: true },
            { id: "driver-registration", icon: "group", label: "Drivers", active: false },
            { id: "profile", icon: "person", label: "Profile", active: false },
          ].map((nav) => (
            <button key={nav.label} onClick={() => goTo(nav.id)} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg w-16 ${nav.active ? "text-ugreen bg-ugreen/10" : "text-muted-foreground hover:text-foreground"}`}>
              <span className="material-symbols-outlined text-[24px]">{nav.icon}</span>
              <span className={`text-[10px] ${nav.active ? "font-bold" : "font-medium"}`}>{nav.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
