"use client"

import { useState } from "react"
import { useApp, CATALOG_ITEMS } from "@/lib/app-context"
import type { VanInventoryItem } from "@/lib/app-context"

type Tab = "In Van" | "Load Items" | "Unload" | "Add Custom"

const CATEGORY_ICONS: Record<string, string> = {
  General: "inventory_2",
  Automotive: "build",
  Cleaning: "cleaning_services",
  Food: "restaurant",
  Electronics: "devices",
  Construction: "construction",
  Custom: "add_box",
}

const CATEGORY_COLORS: Record<string, string> = {
  General: "bg-blue-500/15 text-blue-500",
  Automotive: "bg-orange-400/15 text-orange-400",
  Cleaning: "bg-cyan-500/15 text-cyan-500",
  Food: "bg-yellow-400/15 text-yellow-400",
  Electronics: "bg-purple-400/15 text-purple-400",
  Construction: "bg-red-400/15 text-red-400",
  Custom: "bg-u600/15 text-u600",
}

export default function VanInventory({ onBack }: { onBack: () => void }) {
  const { state, dispatch, goTo, activeVan } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>("In Van")
  const [search, setSearch] = useState("")
  const [loadQtys, setLoadQtys] = useState<Record<string, number>>({})
  const [unloadQtys, setUnloadQtys] = useState<Record<string, number>>({})
  const [customName, setCustomName] = useState("")
  const [customQty, setCustomQty] = useState("")
  const [customUnit, setCustomUnit] = useState("unit")
  const [customPrice, setCustomPrice] = useState("")
  const [customCategory, setCustomCategory] = useState("Custom")
  const [toastMsg, setToastMsg] = useState("")

  const vanItems = state.vanInventory
  const totalItems = vanItems.reduce((s, i) => s + i.qty, 0)
  const totalValue = vanItems.reduce((s, i) => s + i.qty * i.price, 0)

  const filteredVanItems = vanItems.filter(
    (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
  )

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 2000)
  }

  const handleLoad = () => {
    const today = new Date().toISOString().slice(0, 10)
    const items: VanInventoryItem[] = []
    Object.entries(loadQtys).forEach(([catId, qty]) => {
      if (qty <= 0) return
      const cat = CATALOG_ITEMS.find((c) => c.id === catId)
      if (!cat) return
      const existing = vanItems.find((v) => v.id === catId)
      if (existing) {
        items.push({ ...existing, qty: existing.qty + qty })
      } else {
        items.push({ id: catId, name: cat.name, qty, unit: cat.unit, price: cat.price, category: "General", loadedDate: today })
      }
    })
    // Merge with existing
    const merged = [...vanItems]
    items.forEach((newItem) => {
      const idx = merged.findIndex((m) => m.id === newItem.id)
      if (idx >= 0) merged[idx] = newItem
      else merged.push(newItem)
    })
    dispatch({ type: "SET_VAN_INVENTORY", items: merged })
    setLoadQtys({})
    showToast("Items loaded to van")
    setActiveTab("In Van")
  }

  const handleUnload = () => {
    Object.entries(unloadQtys).forEach(([itemId, qty]) => {
      if (qty > 0) dispatch({ type: "UNLOAD_VAN_ITEM", itemId, qty })
    })
    setUnloadQtys({})
    showToast("Items unloaded from van")
    setActiveTab("In Van")
  }

  const handleAddCustom = () => {
    if (!customName.trim() || !customQty) return
    const item: VanInventoryItem = {
      id: `CUSTOM-${Date.now()}`,
      name: customName.trim(),
      qty: parseInt(customQty) || 1,
      unit: customUnit,
      price: parseFloat(customPrice) || 0,
      category: customCategory,
      loadedDate: new Date().toISOString().slice(0, 10),
    }
    dispatch({ type: "ADD_CUSTOM_VAN_ITEM", item })
    setCustomName(""); setCustomQty(""); setCustomPrice("")
    showToast("Custom item added")
    setActiveTab("In Van")
  }

  const adjustLoad = (id: string, delta: number) => {
    setLoadQtys((prev) => {
      const newVal = Math.max(0, (prev[id] ?? 0) + delta)
      return { ...prev, [id]: newVal }
    })
  }

  const setLoadQty = (id: string, qty: number) => {
    setLoadQtys((prev) => ({ ...prev, [id]: Math.max(0, qty) }))
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-ugreen text-black px-4 py-2 rounded-xl text-[13px] font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between bg-background px-5 pt-12 pb-4 border-b border-u500 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center uber-press">
            <span className="material-symbols-outlined text-u900 text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[20px] font-black leading-tight tracking-tight text-u900">Warehouse on Wheels</h1>
            <p className="text-[11px] font-medium text-u700">{activeVan?.plate ?? "Van"} · {totalItems} items · SAR {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-background border-b border-u500 shrink-0 z-10">
        <div className="flex overflow-x-auto px-4 gap-1" style={{ scrollbarWidth: "none" }}>
          {(["In Van", "Load Items", "Unload", "Add Custom"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-3 min-w-max border-b-2 text-[12px] font-bold transition-colors ${activeTab === tab
                  ? "border-ugreen text-ugreen"
                  : "border-transparent text-u700"
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tab === "In Van" ? "local_shipping" : tab === "Load Items" ? "add_circle" : tab === "Unload" ? "output" : "edit_note"}
              </span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── In Van (Warehouse on Wheels) ── */}
      {activeTab === "In Van" && (
        <main className="flex-1 overflow-y-auto bg-background px-5 pt-4 pb-4" style={{ scrollbarWidth: "none" }}>
          {/* Search */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-u600 text-[20px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-u300 border border-u500 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium focus:outline-none focus:border-u600 placeholder:text-u600 text-u900"
              placeholder="Search items by name or category..."
            />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-u300 border border-u500 rounded-xl p-3 text-center">
              <p className="text-[10px] text-u600 font-bold uppercase">Items</p>
              <p className="text-[20px] font-black text-u900">{totalItems}</p>
            </div>
            <div className="bg-u300 border border-u500 rounded-xl p-3 text-center">
              <p className="text-[10px] text-u600 font-bold uppercase">Types</p>
              <p className="text-[20px] font-black text-u900">{vanItems.length}</p>
            </div>
            <div className="bg-u300 border border-u500 rounded-xl p-3 text-center">
              <p className="text-[10px] text-u600 font-bold uppercase">Value</p>
              <p className="text-[20px] font-black text-ugreen">
                {totalValue > 999 ? `${(totalValue / 1000).toFixed(1)}K` : totalValue}
              </p>
            </div>
          </div>

          {vanItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-20 h-20 rounded-full bg-u300 border border-u500 flex items-center justify-center">
                <span className="material-symbols-outlined text-u600 text-[40px]">inventory_2</span>
              </div>
              <div className="text-center">
                <p className="text-u900 font-bold text-[16px]">Van is empty</p>
                <p className="text-u600 text-[13px] mt-1 leading-relaxed max-w-[250px]">
                  Load items from the warehouse or add custom items to start tracking your mobile inventory.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("Load Items")}
                className="flex items-center gap-2 bg-ugreen text-black px-6 py-3 rounded-xl font-black text-[14px] active:brightness-90"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Load Items
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVanItems.map((item) => {
                const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["General"]
                const catIcon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS["General"]
                return (
                  <div key={item.id} className="bg-u300 border border-u500 rounded-xl p-4 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${catColor} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[22px]">{catIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-u900 font-bold text-[14px] leading-tight truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catColor}`}>{item.category}</span>
                        <span className="text-u600 text-[11px]">SAR {item.price}/{item.unit}</span>
                      </div>
                      <p className="text-u600 text-[10px] mt-0.5">Loaded: {item.loadedDate}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-u900 font-black text-[18px]">{item.qty}</p>
                      <p className="text-u600 text-[10px]">{item.unit}s</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      )}

      {/* ── Load Items ── */}
      {activeTab === "Load Items" && (
        <main className="flex-1 overflow-y-auto bg-background px-5 pt-4 pb-4 space-y-2" style={{ scrollbarWidth: "none" }}>
          <p className="text-[11px] font-black text-u700 uppercase tracking-widest mb-2">Select items and quantities to load</p>
          {CATALOG_ITEMS.map((cat) => {
            const qty = loadQtys[cat.id] ?? 0
            return (
              <div key={cat.id} className={`rounded-xl p-4 border transition-all ${qty > 0 ? "bg-ugreen/8 border-ugreen/20" : "bg-u300 border-u500"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-[13px] leading-tight ${qty > 0 ? "text-u900" : "text-u800"}`}>{cat.name}</p>
                      <p className="text-[11px] text-u600">SAR {cat.price} / {cat.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => adjustLoad(cat.id, -1)}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-full bg-u400 border border-u500 text-u900 flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setLoadQty(cat.id, parseInt(e.target.value) || 0)}
                      className="w-14 h-8 rounded-lg bg-u400 border border-u500 text-center text-u900 font-black text-[14px] outline-none focus:border-ugreen"
                    />
                    <button
                      onClick={() => adjustLoad(cat.id, 1)}
                      className="w-8 h-8 rounded-full bg-ugreen text-black flex items-center justify-center active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
                {qty > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-u500/50">
                    <span className="text-[10px] text-u600 font-bold">Quick:</span>
                    {[10, 50, 100].map((n) => (
                      <button
                        key={n}
                        onClick={() => adjustLoad(cat.id, n)}
                        className="px-2 py-1 rounded-lg bg-u400 border border-u500 text-[10px] font-bold text-u800 active:bg-u500"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="pt-3 pb-2">
            <button
              onClick={handleLoad}
              disabled={Object.values(loadQtys).every((v) => v === 0)}
              className="w-full h-[52px] rounded-xl bg-ugreen disabled:bg-u400 disabled:text-u600 text-black font-black text-[15px] active:brightness-90 flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              Load to Van
            </button>
          </div>
        </main>
      )}

      {/* ── Unload ── */}
      {activeTab === "Unload" && (
        <main className="flex-1 overflow-y-auto bg-background px-5 pt-4 pb-4 space-y-2" style={{ scrollbarWidth: "none" }}>
          <div className="bg-orange-400/10 border border-orange-400/20 rounded-xl p-3 flex items-start gap-2 mb-2">
            <span className="material-symbols-outlined text-orange-400 text-[18px] mt-0.5 shrink-0">info</span>
            <p className="text-u800 text-[12px] leading-relaxed">Return items to warehouse. Items will be removed from van inventory.</p>
          </div>
          {vanItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span className="material-symbols-outlined text-u600 text-[40px]">inventory</span>
              <p className="text-u600 text-[13px]">No items in van to unload</p>
            </div>
          ) : (
            <>
              {vanItems.map((item) => {
                const uqty = unloadQtys[item.id] ?? 0
                return (
                  <div key={item.id} className={`bg-u300 border rounded-xl p-4 flex flex-col ${uqty > 0 ? "border-orange-400/30" : "border-u500"}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-u900 font-bold text-[13px] truncate">{item.name}</p>
                        <p className="text-u600 text-[11px]">In van: {item.qty} {item.unit}s</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setUnloadQtys((p) => ({ ...p, [item.id]: Math.max(0, (p[item.id] ?? 0) - 1) }))}
                          disabled={uqty === 0}
                          className="w-8 h-8 rounded-full bg-u400 border border-u500 flex items-center justify-center disabled:opacity-20 active:scale-90"
                        >
                          <span className="material-symbols-outlined text-u900 text-[16px]">remove</span>
                        </button>
                        <input
                          type="number"
                          value={uqty}
                          onChange={(e) => setUnloadQtys((p) => ({ ...p, [item.id]: Math.min(item.qty, Math.max(0, parseInt(e.target.value) || 0)) }))}
                          className="w-14 h-8 rounded-lg bg-u400 border border-u500 text-center text-u900 font-black text-[14px] outline-none focus:border-orange-400"
                        />
                        <button
                          onClick={() => setUnloadQtys((p) => ({ ...p, [item.id]: Math.min(item.qty, (p[item.id] ?? 0) + 1) }))}
                          className="w-8 h-8 rounded-full bg-orange-400 text-black flex items-center justify-center active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                    {uqty > 0 && (
                      <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-u500/50">
                        <span className="text-[10px] text-u600 font-bold">Quick:</span>
                        {[10, 50, 100].map((n) => (
                          <button
                            key={n}
                            onClick={() => setUnloadQtys((p) => ({ ...p, [item.id]: Math.min(item.qty, (p[item.id] ?? 0) + n) }))}
                            className="px-2 py-1 rounded-lg bg-orange-400/20 border border-orange-400/30 text-[10px] font-bold text-orange-400 active:bg-orange-400/40"
                          >
                            +{n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="pt-3 pb-2">
                <button
                  onClick={handleUnload}
                  disabled={Object.values(unloadQtys).every((v) => v === 0)}
                  className="w-full h-[52px] rounded-xl bg-orange-400 disabled:bg-u400 disabled:text-u600 text-black font-black text-[15px] active:brightness-90 flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">output</span>
                  Unload from Van
                </button>
              </div>
            </>
          )}
        </main>
      )}

      {/* ── Add Custom ── */}
      {activeTab === "Add Custom" && (
        <main className="flex-1 overflow-y-auto bg-background px-5 pt-4 pb-4 space-y-4" style={{ scrollbarWidth: "none" }}>
          <div className="bg-u300 border border-u500 rounded-xl p-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-u700 text-[18px] mt-0.5 shrink-0">lightbulb</span>
            <p className="text-u800 text-[12px] leading-relaxed">Add items not in the catalog. Useful for ad-hoc pickups or special items.</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Item Name</label>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Special Order Parts"
              className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[14px] font-medium placeholder-u500 focus:outline-none focus:border-u600"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Quantity</label>
              <input
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                placeholder="0"
                className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[14px] font-bold placeholder-u500 focus:outline-none focus:border-u600"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Unit</label>
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[14px] appearance-none cursor-pointer focus:outline-none focus:border-u600"
              >
                {["unit", "case", "box", "pack", "set", "kg", "litre", "pallet"].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Price (SAR)</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[14px] font-bold placeholder-u500 focus:outline-none focus:border-u600"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[14px] appearance-none cursor-pointer focus:outline-none focus:border-u600"
              >
                {Object.keys(CATEGORY_ICONS).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {customQty && parseInt(customQty) > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-u600 font-bold">Quick add:</span>
              {[10, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setCustomQty(String((parseInt(customQty) || 0) + n))}
                  className="px-2.5 py-1 rounded-lg bg-u400 border border-u500 text-[11px] font-bold text-u800 active:bg-u500"
                >
                  +{n}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleAddCustom}
            disabled={!customName.trim() || !customQty}
            className="w-full h-[52px] rounded-xl bg-ugreen disabled:bg-u400 disabled:text-u600 text-black font-black text-[15px] active:brightness-90 flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            Add to Van
          </button>
        </main>
      )}

      {/* Bottom Nav */}
      <nav className="flex border-t border-u500 bg-background px-4 pb-8 pt-2 shrink-0 z-20">
        <button onClick={() => setActiveTab("In Van")} className="flex flex-1 flex-col items-center gap-1 uber-press">
          <span className={`material-symbols-outlined text-[24px] ${activeTab === "In Van" ? "text-ugreen" : "text-u700"}`} style={{ fontVariationSettings: activeTab === "In Van" ? "'FILL' 1" : "'FILL' 0" }}>local_shipping</span>
          <p className={`text-[10px] ${activeTab === "In Van" ? "font-bold text-ugreen" : "font-medium text-u700"}`}>In Van</p>
        </button>
        <button onClick={() => setActiveTab("Load Items")} className="flex flex-1 flex-col items-center gap-1 uber-press">
          <span className={`material-symbols-outlined text-[24px] ${activeTab === "Load Items" ? "text-ugreen" : "text-u700"}`}>add_circle</span>
          <p className={`text-[10px] ${activeTab === "Load Items" ? "font-bold text-ugreen" : "font-medium text-u700"}`}>Load</p>
        </button>
        <button onClick={() => setActiveTab("Unload")} className="flex flex-1 flex-col items-center gap-1 uber-press">
          <span className={`material-symbols-outlined text-[24px] ${activeTab === "Unload" ? "text-orange-400" : "text-u700"}`}>output</span>
          <p className={`text-[10px] ${activeTab === "Unload" ? "font-bold text-orange-400" : "font-medium text-u700"}`}>Unload</p>
        </button>
        <button onClick={() => goTo("map")} className="flex flex-1 flex-col items-center gap-1 uber-press">
          <span className="material-symbols-outlined text-[24px] text-u700">map</span>
          <p className="text-[10px] font-medium text-u700">Map</p>
        </button>
      </nav>
    </div>
  )
}
