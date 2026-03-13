"use client"

import { useApp } from "@/lib/app-context"

export default function SalesDashboard({ onBack }: { onBack: () => void }) {
  const { state, goTo } = useApp()

  // Derive top vans from state
  const vanPerformance = state.vans.map(van => {
    let vanTotal = 0;
    state.deliveryNotes.filter(n => n.vanId === van.id).forEach(note => {
      note.stops.forEach(stop => {
        if (stop.status === 'done' || stop.status === 'partial') {
          vanTotal += stop.collectedCash || 0;
          stop.items.forEach(item => {
            vanTotal += (item.delivered || 0) * item.price;
          });
        }
      });
    });
    return {
      id: van.id,
      plate: van.plate,
      model: van.model,
      amount: vanTotal,
      pct: Math.min(100, Math.round((vanTotal / 5000) * 100)) // Assuming 5000 is a target
    };
  }).sort((a, b) => b.amount - a.amount).slice(0, 3);

  const displayVans = vanPerformance.map((v, i) => ({
    rank: `0${i + 1}`,
    name: `${v.plate} (${v.model})`,
    amount: `SAR ${(v.amount / 1000).toFixed(1)}k`,
    pct: v.pct,
    accent: i === 0
  }));

  const metrics = [
    { icon: "attach_money", label: "Total sales", value: `SAR ${state.totalSales.toLocaleString()}`, sub: "+12% vs yesterday", accent: true },
    { icon: "payments", label: "Cash collected", value: `SAR ${state.cashCollected.toLocaleString()}`, progress: Math.min(100, Math.round((state.cashCollected / state.totalSales) * 100)) },
    { icon: "account_balance_wallet", label: "Credit ledger", value: `SAR ${(state.totalSales - state.cashCollected).toLocaleString()}`, sub: `${state.invoices.filter(i => i.status === 'Credit').length} pending` },
  ];

  return (
    <div className="bg-background text-foreground h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="uber-press w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-[20px] font-black tracking-tight text-foreground">Dashboard</h1>
        </div>
        <button onClick={() => alert("Feature coming soon")} className="uber-press flex items-center gap-1.5 bg-muted border border-border px-3 py-2 rounded-full text-[12px] font-bold text-foreground">
          Today
          <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>

        {/* Metric cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {metrics.map((m) => (
            <div key={m.label} className="bg-card border border-border rounded-2xl p-4 min-w-[180px] shrink-0 flex flex-col justify-between h-[120px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-muted-foreground text-[18px]">{m.icon}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</span>
              </div>
              <div>
                <p className="text-[22px] font-black text-foreground leading-none">{m.value}</p>
                {m.sub && (
                  <p className={`text-[10px] mt-1 font-bold flex items-center gap-1 ${m.accent ? "text-ugreen" : "text-amber-600"}`}>
                    {m.accent && <span className="material-symbols-outlined text-[12px]">trending_up</span>}
                    {m.sub}
                  </p>
                )}
                {m.progress !== undefined && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-ugreen rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 24h chart */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-black text-foreground">24h sales trend</h3>
            <span className="text-[10px] font-black text-ugreen bg-ugreen/10 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <div className="relative h-36">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 300 100">
              <defs>
                <linearGradient id="sdg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06c167" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06c167" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,90 Q30,80 60,60 T120,50 T180,30 T240,60 T300,20 V100 H0 Z" fill="url(#sdg)" />
              <path d="M0,90 Q30,80 60,60 T120,50 T180,30 T240,60 T300,20" fill="none" stroke="#06c167" strokeLinecap="round" strokeWidth="2.5" />
              <circle cx="300" cy="20" fill="#06c167" r="4" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
          </div>
        </div>

        {/* Top vans */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-black text-foreground">Top vans</h3>
            <button onClick={() => alert("Feature coming soon")} className="text-[11px] font-bold text-ugreen">View all</button>
          </div>
          <div className="space-y-4">
            {displayVans.map((v) => (
              <div key={v.rank} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center text-[11px] font-black text-muted-foreground">
                  {v.rank}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-foreground">{v.name}</span>
                    <span className="text-[12px] font-black text-foreground">{v.amount}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${v.accent ? "bg-ugreen" : "bg-foreground/20"}`} style={{ width: `${v.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent invoices */}
        <div>
          <h3 className="text-[13px] font-black text-muted-foreground uppercase tracking-widest mb-3">Recent invoices</h3>
          <div className="space-y-2">
            {state.invoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-muted-foreground text-[20px]">{inv.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{inv.customerName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{inv.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-black text-foreground">SAR {inv.amount.toLocaleString()}</p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${inv.status === 'Paid' ? "bg-ugreen-10 text-ugreen" : "bg-yellow-400/10 text-yellow-500"}`}>{inv.status}</span>
                </div>
              </div>
            ))}
            <button onClick={() => alert("Feature coming soon")} className="w-full text-center text-[12px] font-bold text-ugreen py-2">View all invoices</button>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-background border-t border-border px-5 pb-8 pt-3 flex justify-around items-center shrink-0">
        {[
          { icon: "home", label: "Home", active: true },
          { icon: "local_shipping", label: "Fleet" },
          { icon: "analytics", label: "Sales" },
          { icon: "person", label: "Profile" },
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
