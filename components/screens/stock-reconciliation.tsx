"use client"

const summaryCards = [
  { label: "Total Inventory Value", value: "SAR 45,200", trend: "+2.4%", trendIcon: "trending_up", sub: "vs last month", dark: true },
  { label: "Discrepancies Found", value: "7", trend: "3 critical", trendIcon: "error", sub: "need action", dark: false, alert: true },
  { label: "Reconciled Items", value: "143 / 150", trend: "95.3%", trendIcon: "check_circle", sub: "accuracy rate", dark: false },
]

const discrepancies = [
  { name: "Motor Oil 5W-30", sku: "SKU-88291-A", expected: 24, actual: 20, diff: -4, status: "critical" },
  { name: "Brake Pads Set", sku: "SKU-44102-B", expected: 12, actual: 14, diff: +2, status: "minor" },
  { name: "Air Filter Premium", sku: "SKU-11029-F", expected: 30, actual: 28, diff: -2, status: "warning" },
  { name: "LED Headlight Bulb", sku: "SKU-55031-L", expected: 18, actual: 15, diff: -3, status: "critical" },
  { name: "Coolant 1L", sku: "SKU-99421-C", expected: 40, actual: 41, diff: +1, status: "minor" },
]

export default function StockReconciliation({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white text-[#141414]">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 px-5 pt-12 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center justify-center">
              <span className="material-symbols-outlined text-[#141414] text-[28px]">arrow_back</span>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Stock Reconciliation</h1>
          </div>
          <button onClick={() => alert("Feature coming soon")} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-[#141414]" style={{ fontSize: 28 }}>notifications</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert("Feature coming soon")} className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>
            <span>Today, Oct 24</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
          </button>
          <button onClick={() => alert("Feature coming soon")} className="flex items-center justify-center size-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-gray-600" style={{ fontSize: 20 }}>filter_list</span>
          </button>
          <button onClick={() => alert("Feature coming soon")} className="flex items-center justify-center size-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors ml-auto">
            <span className="material-symbols-outlined text-gray-600" style={{ fontSize: 20 }}>download</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-8" style={{ scrollbarWidth: "none" }}>
        {/* Summary Cards */}
        <section className="mt-6 px-5">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: "none" }}>
            {summaryCards.map((card, i) => (
              <div key={i} className={`snap-center shrink-0 w-[85%] sm:w-[300px] rounded-xl p-6 shadow-lg flex flex-col justify-between h-[160px] relative overflow-hidden ${card.dark ? "bg-[#141414] text-white" : "bg-white border border-gray-100 shadow-sm"}`}>
                {card.dark && <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white/5 to-transparent" />}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${card.dark ? "text-gray-400" : "text-gray-500"}`}>{card.label}</p>
                  <h2 className={`text-3xl font-bold tracking-tight ${card.alert ? "text-red-600" : ""}`}>{card.value}</h2>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 ${card.dark ? "bg-white/20 text-white" : card.alert ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    <span className="material-symbols-outlined text-[14px]">{card.trendIcon}</span> {card.trend}
                  </span>
                  <span className={`text-xs ${card.dark ? "text-gray-400" : "text-gray-500"}`}>{card.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discrepancy List */}
        <section className="mt-6 px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#141414]">Discrepancies</h2>
            <button onClick={() => alert("Feature coming soon")} className="text-sm font-semibold text-blue-600">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {discrepancies.map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`shrink-0 size-10 rounded-lg flex items-center justify-center ${item.status === "critical" ? "bg-red-100 text-red-600" : item.status === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.status === "critical" ? "error" : item.status === "warning" ? "warning" : "info"}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#141414] truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Expected</p>
                    <p className="text-sm font-bold text-[#141414]">{item.expected}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Actual</p>
                    <p className="text-sm font-bold text-[#141414]">{item.actual}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Diff</p>
                    <p className={`text-sm font-bold ${item.diff < 0 ? "text-red-600" : "text-green-600"}`}>{item.diff > 0 ? `+${item.diff}` : item.diff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Banner */}
        <section className="mt-6 px-5">
          <div className="bg-[#141414] text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Ready to submit?</h3>
              <p className="text-xs text-gray-400 mt-1">Review all discrepancies before finalizing</p>
            </div>
            <button onClick={() => alert("Feature coming soon")} className="bg-white text-[#141414] px-5 py-2.5 rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform">
              Submit Report
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
