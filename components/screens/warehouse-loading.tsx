"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { SlideToConfirm } from "@/components/slide-to-confirm"

interface WarehouseLoadingProps {
  onBack: () => void
  onNext?: () => void
}

export default function WarehouseLoading({ onBack, onNext }: WarehouseLoadingProps) {
  const { state, activeNote, dispatch } = useApp()
  const haptics = useHaptics()

  const allItems = useMemo(() => {
    if (!activeNote) return []
    const seen = new Set<string>()
    const items: { id: string; name: string; qty: number; unit: string; stopName: string }[] = []
    activeNote.stops.forEach((stop) => {
      if (stop.type === "deliver" || stop.type === "mixed") {
        stop.items.forEach((item) => {
          const key = `${item.id}-${stop.id}`
          if (!seen.has(key)) {
            seen.add(key)
            items.push({ id: key, name: item.name, qty: item.qty, unit: item.unit, stopName: stop.customerName })
          }
        })
      }
    })
    return items.length > 0 ? items : [
      { id: "#1021", name: "General Cargo", qty: 10, unit: "units", stopName: "Stop 1" },
      { id: "#1022", name: "Perishables", qty: 6, unit: "cases", stopName: "Stop 2" },
    ]
  }, [activeNote])

  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    haptics.tick()
    setLoadedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const loadedCount = loadedIds.size
  const totalCount = allItems.length
  const progressPercent = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0
  const canDepart = progressPercent >= 100

  return (
    <div className="bg-background dark:bg-u100 h-full w-full overflow-hidden flex flex-col text-foreground dark:text-white">

      {/* Map strip header */}
      <div className="relative h-[200px] shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC37m2VnY5uxm846AJyvg8OSzX-rCi1E1Ec8LN6eTRTmmJj1GZgHYtfqVhx1uzcHuxtyHx85kByF2NyVMWaQfkyWa-7_b_GW5EBtiwFeBhxnbtXmsUwjGFGPkcilLVDH7Nsobjm8SjqQWlc-54An-_oXLat4XvArTKA3eJgLgncKE-eobY-9HZyMiXKBUjmGRvJGV_Tsn1e9UTnCWN9UPQzum5GJV2RGsvJ93OIkmngwbmr4aEnXoEC9t6RwM0TmuVZT3IyqlY2YhO5')`,
            filter: "brightness(0.2) saturate(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        <div className="relative z-10 pt-12 px-5 flex items-center justify-between">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-white" />
          </button>
          <div className="flex items-center gap-3 bg-black/60 dark:bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-2">
            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-full transition-all ${state.isSynced ? "bg-[#06c167]/20" : "bg-blue-500/20 animate-pulse"
              }`}>
              <Illicon
                name={state.isSynced ? "check-circle" : "sync"}
                size={10}
                filled={state.isSynced}
                color={state.isSynced ? "text-[#06c167]" : "text-blue-500"}
              />
              <span className={`text-[8px] font-black uppercase tracking-wider ${state.isSynced ? "text-[#06c167]" : "text-blue-500"
                }`}>
                {state.isSynced ? "SYNCED" : "SYNCING"}
              </span>
            </div>
            <div className="w-[1px] h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-ugreen dark:bg-[#06c167] animate-pulse" />
              <span className="text-[12px] font-bold tracking-wide text-white dark:text-white">ONLINE</span>
            </div>
          </div>
          <button
            onClick={() => haptics.light()}
            className="uber-press h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          >
            <Illicon name="search" size={22} color="text-white" />
          </button>
        </div>

        {/* Warehouse info card */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="bg-black/80 dark:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 dark:bg-white/5 flex items-center justify-center">
                <Illicon name="warehouse" size={20} color="text-foreground dark:text-white" />
              </div>
              <div>
                <p className="text-[14px] font-black text-foreground dark:text-white leading-tight">Jeddah Central</p>
                <p className="text-[11px] text-muted-foreground dark:text-u700">{"Gate 4 \u2022 King Abdulaziz Road"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-black text-foreground dark:text-white leading-none">{progressPercent}%</p>
              <p className="text-[10px] text-muted-foreground dark:text-u600 uppercase tracking-wide">Loaded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading progress bar */}
      <div className="h-1.5 bg-muted dark:bg-white/[0.05] shrink-0">
        <div
          className={`h-full transition-all duration-500 ${canDepart ? "bg-ugreen dark:bg-[#06c167]" : "bg-foreground dark:bg-white"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Manifest sheet */}
      <div className="flex-1 flex flex-col min-h-0 bg-background dark:bg-u100 overflow-hidden">
        {/* Sheet header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-border dark:border-white/[0.07] shrink-0">
          <div>
            <h2 className="text-[17px] font-black text-foreground dark:text-white">Manifest</h2>
            <p className="text-[11px] text-muted-foreground dark:text-u600 mt-0.5">{loadedCount} of {totalCount} loaded</p>
          </div>
          <button
            onClick={() => {
              haptics.medium()
              setLoadedIds(new Set(allItems.map((i) => i.id)))
            }}
            className="uber-press text-[12px] font-black text-ugreen dark:text-[#06c167] bg-ugreen/10 dark:bg-[#06c167]/10 border border-ugreen/20 dark:border-[#06c167]/20 px-3 py-1.5 rounded-lg"
          >
            Confirm all
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 pb-28" style={{ scrollbarWidth: "none" }}>
          {allItems.map((item) => {
            const isLoaded = loadedIds.has(item.id)
            return (
              <div
                key={item.id}
                className={`w-full flex flex-col rounded-2xl border transition-all ${isLoaded
                  ? "bg-ugreen/[0.08] dark:bg-[#06c167]/[0.08] border-ugreen/15 dark:border-[#06c167]/15"
                  : "bg-card dark:bg-u300 border-border dark:border-white/[0.07]"
                  }`}
              >
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isLoaded ? "bg-ugreen/20 dark:bg-[#06c167]/20" : "bg-muted dark:bg-white/[0.05]"
                      }`}
                  >
                    <Illicon
                      name={isLoaded ? "stop-done" : "package"}
                      size={22}
                      filled={isLoaded}
                      color={isLoaded ? "text-ugreen dark:text-[#06c167]" : "text-muted-foreground dark:text-u600"}
                    />
                  </button>
                  <div className="flex-1 min-w-0 text-left" onClick={() => toggleItem(item.id)}>
                    <p className={`text-[14px] font-bold ${isLoaded ? "text-muted-foreground dark:text-u700 line-through" : "text-foreground dark:text-white"}`}>{item.name}</p>
                    <p className="text-[11px] mt-0.5 text-muted-foreground dark:text-u600">
                      {item.stopName} · {item.qty} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        haptics.medium()
                        // In a real app, this would show a modal to choose "Damaged" or "Missing"
                        // Here we just toggle a simple issue state for the demo
                        alert(`Flagging ${item.name} for dispatch review.`)
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20"
                    >
                      <Illicon name="stop-issue" size={16} color="text-red-500" />
                    </button>
                    <div
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isLoaded ? "bg-ugreen dark:bg-[#06c167] border-ugreen dark:border-[#06c167]" : "border-border dark:border-white/20"
                        }`}
                    >
                      {isLoaded && (
                        <Illicon name="check" size={13} filled color="text-black" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer action */}
        <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border dark:border-white/[0.07] bg-background dark:bg-u100">
          <div className="flex items-center justify-between mb-4 text-[12px] text-muted-foreground dark:text-u600">
            <div className="flex items-center gap-1.5">
              <Illicon name="van" size={16} color="text-muted-foreground dark:text-u600" />
              <span>450 kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Illicon name="package" size={16} color="text-muted-foreground dark:text-u600" />
              <span>{"12 m\u00B3"}</span>
            </div>
          </div>
          <SlideToConfirm
            disabled={!canDepart}
            label="DEPART"
            successLabel="DEPARTED"
            icon="van-depart"
            onConfirm={() => {
              dispatch({ type: "SET_DRIVER_STATUS", status: "in_route" })
              onNext?.()
            }}
          />
          {!canDepart && (
            <p className="text-center text-[11px] text-muted-foreground dark:text-u600 mt-3">
              Load all items to unlock departure
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
