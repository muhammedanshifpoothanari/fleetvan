"use client"

import { useApp } from "@/lib/app-context"

const quickItems = [
  { icon: "water_drop", label: "Water\n500ml", hoverColor: "group-hover:text-blue-600" },
  { icon: "local_cafe", label: "Coffee\nBeans", hoverColor: "group-hover:text-orange-500" },
  { icon: "nutrition", label: "Apple\nJuice", hoverColor: "group-hover:text-red-500" },
  { icon: "cookie", label: "Snack\nBox", hoverColor: "group-hover:text-yellow-500" },
]

export default function InvoiceSales({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { goTo } = useApp()
  return (
    <div className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl overflow-hidden mx-auto text-foreground">
      <div className="flex items-center bg-card p-4 pb-2 justify-between border-b border-border">
        <button onClick={onBack} className="text-foreground flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-muted"><span className="material-symbols-outlined text-[24px]">arrow_back</span></button>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight flex-1 text-center">New Sale</h2>
        <button onClick={() => alert("Feature coming soon")} className="flex w-12 items-center justify-center"><p className="text-muted-foreground text-base font-bold shrink-0">Cancel</p></button>
      </div>
      <div className="bg-card px-4 pt-2 pb-1">
        <div className="flex items-center justify-between">
          <div><p className="text-foreground text-xl font-bold leading-tight">Al-Riyadh Market</p><p className="text-muted-foreground text-sm font-normal mt-0.5">{"Route 4 \u2022 Al Olaya, Riyadh"}</p></div>
          <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-sm">AM</div>
        </div>
      </div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-card border-b border-border" style={{ scrollbarWidth: "none" }}>
        {["Credit Customer", "Tier 1", "Monday Route"].map((tag) => (
          <div key={tag} className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-foreground/5 px-3 border border-foreground/10">
            <p className="text-foreground text-xs font-semibold">{tag}</p>
          </div>
        ))}
        <div className="flex h-7 shrink-0 items-center justify-center rounded-full bg-orange-500/10 px-3 border border-orange-500/20">
          <p className="text-orange-500 text-xs font-semibold">Pending Inv</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex flex-col items-center justify-center py-6 bg-card shadow-sm z-10">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Total Amount</p>
          <h1 className="text-foreground text-5xl font-extrabold tracking-tight flex items-baseline"><span className="text-lg font-bold mr-1 text-muted-foreground self-start mt-2">SAR</span>1,250<span className="text-3xl text-muted-foreground">.00</span></h1>
          <div className="flex items-center gap-1 mt-2 px-3 py-1 bg-green-500/10 rounded-full"><span className="material-symbols-outlined text-green-500 text-[14px]">shopping_bag</span><p className="text-green-600 text-xs font-semibold">3 items added</p></div>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3">
          {quickItems.map((item) => (
            <button onClick={() => alert("Feature coming soon")} key={item.icon} className="aspect-square bg-card rounded-xl shadow-sm border border-border flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform group">
              <span className={`material-symbols-outlined text-foreground text-[28px] ${item.hoverColor}`}>{item.icon}</span>
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight whitespace-pre-line">{item.label}</span>
            </button>
          ))}
          <button onClick={() => alert("Feature coming soon")} className="col-span-2 h-14 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center gap-2 active:scale-95 transition-transform px-3">
            <span className="material-symbols-outlined text-foreground text-[20px]">qr_code_scanner</span><span className="text-xs font-bold text-foreground">Scan Barcode</span>
          </button>
          <button onClick={() => alert("Feature coming soon")} className="col-span-2 h-14 bg-card rounded-xl shadow-sm border border-border flex items-center justify-center gap-2 active:scale-95 transition-transform px-3">
            <span className="material-symbols-outlined text-foreground text-[20px]">percent</span><span className="text-xs font-bold text-foreground">Add Discount</span>
          </button>
        </div>
      </div>
      <div className="bg-card border-t border-border pt-2">
        <div className="px-4 mb-2">
          <button onClick={() => onNext?.()} className="w-full bg-foreground text-background h-14 rounded-full font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-between px-6">
            <span>Confirm Sale</span>
            <div className="flex items-center gap-2"><span className="opacity-80 font-normal text-sm">SAR 1,250.00</span><span className="material-symbols-outlined">arrow_forward</span></div>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-y-1 pb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((k) => (
            <button onClick={() => alert("Feature coming soon")} key={k} className="h-16 w-full flex items-center justify-center text-2xl font-semibold text-foreground active:bg-muted rounded transition-colors">
              {k === "back" ? <span className="material-symbols-outlined text-[24px]">backspace</span> : k}
            </button>
          ))}
        </div>
      </div>
      <div className="shrink-0 bg-card border-t border-border px-4 pb-4 pt-2 flex justify-between gap-2">
        <button onClick={() => goTo("home")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground"><span className="material-symbols-outlined text-[24px]">home</span><p className="text-xs font-medium">Home</p></button>
        <button onClick={() => goTo("invoice-sales")} className="flex flex-1 flex-col items-center gap-1 text-foreground"><span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span><p className="text-xs font-medium">Invoice</p></button>
        <button onClick={() => goTo("van-inventory")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground"><span className="material-symbols-outlined text-[24px]">inventory_2</span><p className="text-xs font-medium">Inventory</p></button>
        <button onClick={() => goTo("profile")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground"><span className="material-symbols-outlined text-[24px]">person</span><p className="text-xs font-medium">Profile</p></button>
      </div>
    </div>
  )
}
