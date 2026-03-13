"use client"

import { useState } from "react"

interface StockTransferProps {
  onBack: () => void
}

const initialItems = [
  {
    name: "Oil Filter XJ-900",
    sku: "88392-BLK",
    available: "450 units",
    status: "In stock",
    statusColor: "bg-[#06c167]/15 text-[#06c167]",
    qty: 20,
    maxQty: 450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB33fAC-gaKS7SSc9BhwGRGqrCMnQ2HvLT7THJ-7Uf6flGIE9GTZbCRa5RNavJtuQCmXjlN0WFL-vi5t3S6E48IzQ-y5mGWRm7rhpHxWN_4fHLzE3x0sMvIDE2X9DZ716HWGRUJzDDZfl0xcAyBOnHFzom4oluwAsCdJC8wWfikcPPrU01c4RZXEYgCVnmrk9rPx0-toIhypZ4oZeAfaTpGOE5hojyYd9Qapl04fGs-YfdX2HtRfx60CgJcYVNEuiyqiQtiJQFGBP9v",
    disabled: false,
  },
  {
    name: "Brake Pad Set (Ceramic)",
    sku: "BP-2024-C",
    available: "12 units",
    status: "Low stock",
    statusColor: "bg-yellow-400/15 text-yellow-400",
    qty: 4,
    maxQty: 12,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuKH8CWSVV_VNuYLegWJsr2D6SzyQfHoUvCsD9cGIH1rAjWOW8TJUrK_qPPXnqYMSlXdRhpTtJuQBHLzwuD6X24LhKu61CDvw2BsnHRlYlwQqkTz92ahf6QyP0hAbhHpz_g1Se5mYogrbAJlkg1nyqu9LoKoEcdYlWCMWcxXGVy7vOik1Hb5FtEEjmA8BUjSBpCqNgdsaBlGfBqnpYYQhgwtpRWEC0pLayOsUNXag8zrsYX65eRd1e9HDtNKmOZGZ96A1oETcrKAIq",
    disabled: false,
  },
  {
    name: "Synthetic Motor Oil 5W-30",
    sku: "MO-5W30-L",
    available: "0 L",
    status: "Out of stock",
    statusColor: "bg-white/5 text-muted-foreground",
    qty: 0,
    maxQty: 0,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbj8w5Wc0uwT3US4ElxC8rblqhYk0859qsT36_6iUZ1oHtEXbqDPlGQjn1ByLnAxWMFl57twGInxMm9WgwV6wyvJF6BhfH3PDTkPKGQsqH-HwGyhENSYYo0oA2j6l8RiXXHjEqZYAspunG5mwz-xTXRsfbf0wNWcU9F5nJHEkRuBV5XCMG_jt52jjA9l_bbd4TbtrR5Cv6mIKL0pQtNLmHj7DI6DpRhxgtvK2GKsoeypyZxl2B4zYuEMTAJEkq6Fq96kTPZvF9a0AL",
    disabled: true,
  },
]

export default function StockTransfer({ onBack }: StockTransferProps) {
  const [quantities, setQuantities] = useState<number[]>(initialItems.map((i) => i.qty))
  const [confirmed, setConfirmed] = useState(false)

  const adjust = (index: number, delta: number) => {
    setQuantities((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q
        const max = initialItems[i].maxQty
        return Math.max(0, Math.min(max, q + delta))
      })
    )
  }

  const totalUnits = quantities.reduce((sum, q) => sum + q, 0)

  return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <header className="flex-none border-b border-white/[0.07]">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center uber-press">
            <span className="material-symbols-outlined text-white text-[22px]">close</span>
          </button>
          <h1 className="text-[17px] font-black tracking-tight">Stock transfer</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-36" style={{ scrollbarWidth: "none" }}>

        {/* Source → Destination */}
        <div className="px-5 pt-6 pb-2">
          {/* Source */}
          <div>
            <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">From</label>
            <div className="bg-card rounded-xl p-4 flex items-center justify-between border border-white/[0.07]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-black text-[20px]">warehouse</span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-black text-white text-[14px] truncate">Riyadh Central (WH-01)</span>
                  <span className="text-[11px] text-muted-foreground truncate">King Fahd Rd, Zone A</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-muted-foreground">expand_more</span>
            </div>
          </div>

          {/* Arrow connector */}
          <div className="flex justify-center my-2 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-[18px]">arrow_downward</span>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">To</label>
            <div className="bg-card rounded-xl p-4 flex items-center justify-between border border-white/[0.07]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-[20px]">local_shipping</span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-black text-white text-[14px] truncate">Van 492</span>
                  <span className="text-[11px] text-muted-foreground truncate">Driver: Ahmed Al-Sayed</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-muted-foreground">expand_more</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.07] mt-6 mb-4" />

        {/* Item list */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-black">Select items</h2>
            <button onClick={() => alert("Feature coming soon")} className="text-[11px] font-black text-[#06c167] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span>
              Scan barcode
            </button>
          </div>

          <div className="space-y-2">
            {initialItems.map((item, i) => (
              <div
                key={i}
                className={`bg-card border border-white/[0.07] rounded-2xl p-4 transition-all ${item.disabled ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 shrink-0 bg-muted rounded-xl overflow-hidden">
                    <img alt={item.name} src={item.image} className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white text-[14px] truncate">{item.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap ${item.statusColor}`}>{item.status}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Available: {item.available}</p>
                  </div>
                </div>

                {/* Qty stepper */}
                <div className={`flex items-center justify-between ${item.disabled ? "pointer-events-none" : ""}`}>
                  <span className="text-[12px] font-bold text-muted-foreground">Transfer qty</span>
                  <div className="flex items-center gap-3 bg-muted rounded-xl px-3 py-1.5">
                    <button
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                        item.disabled || quantities[i] === 0
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-white uber-press"
                      }`}
                      onClick={() => adjust(i, -1)}
                      disabled={item.disabled || quantities[i] === 0}
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className={`w-8 text-center font-black text-[16px] ${item.disabled ? "text-muted-foreground" : "text-white"}`}>
                      {quantities[i]}
                    </span>
                    <button
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                        item.disabled || quantities[i] >= item.maxQty
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-white uber-press"
                      }`}
                      onClick={() => adjust(i, 1)}
                      disabled={item.disabled || quantities[i] >= item.maxQty}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => alert("Feature coming soon")} className="uber-press w-full py-4 mt-3 flex items-center justify-center gap-2 text-[#06c167] font-black text-[13px] border border-dashed border-white/10 rounded-2xl">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Add another item
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none bg-black border-t border-white/[0.07] px-5 py-4 pb-8 z-20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[13px] font-medium text-muted-foreground">Total items</span>
          <span className="text-[17px] font-black text-white">{totalUnits} units</span>
        </div>
        {confirmed ? (
          <div className="w-full bg-[#06c167] text-black font-black text-[17px] h-14 rounded-xl flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Transfer confirmed
          </div>
        ) : (
          <button
            onClick={() => setConfirmed(true)}
            disabled={totalUnits === 0}
            className="uber-press w-full bg-white disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-black font-black text-[17px] h-14 rounded-xl flex items-center justify-center gap-2"
          >
            CONFIRM TRANSFER
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        )}
      </footer>

    </div>
  )
}
