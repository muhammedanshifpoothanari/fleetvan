"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import type { Van, Driver, DeliveryNote, VanStatus } from "@/lib/app-context"

const STATUS_META: Record<string, { label: string; color: string; badgeBg: string; borderColor: string; dot: string }> = {
  pending: { label: "Pending", color: "bg-u500", badgeBg: "bg-u400 text-u800", borderColor: "border-l-u500", dot: "bg-u600" },
  assigned: { label: "Assigned", color: "bg-blue-500", badgeBg: "bg-blue-500/15 text-blue-500", borderColor: "border-l-blue-500", dot: "bg-blue-500" },
  loading: { label: "Loading", color: "bg-yellow-400", badgeBg: "bg-yellow-400/15 text-yellow-500", borderColor: "border-l-yellow-400", dot: "bg-yellow-400" },
  in_route: { label: "In Route", color: "bg-ugreen", badgeBg: "bg-ugreen-10 text-ugreen", borderColor: "border-l-[#06c167]", dot: "bg-ugreen" },
  completed: { label: "Completed", color: "bg-u500", badgeBg: "bg-u400 text-u700", borderColor: "", dot: "bg-u500" },
  issue: { label: "Issue", color: "bg-red-500", badgeBg: "bg-red-500/15 text-red-500", borderColor: "border-l-red-500", dot: "bg-red-500" },
}

const COLUMN_ORDER = ["pending", "assigned", "loading", "in_route", "completed", "issue"]

export default function KanbanDashboard({ onBack }: { onBack: () => void }) {
  const { state, dispatch, goTo } = useApp()
  const haptics = useHaptics()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [moveMenuVanId, setMoveMenuVanId] = useState<string | null>(null)

  const matchesSearch = (van: Van) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const driver = state.drivers.find((d) => d.id === van.driverId)
    const note = state.deliveryNotes.find((n) => n.vanId === van.id)
    return (
      van.plate.toLowerCase().includes(q) ||
      van.model.toLowerCase().includes(q) ||
      (driver?.name.toLowerCase().includes(q) ?? false) ||
      (note?.stops.some((s) => s.address.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q)) ?? false)
    )
  }

  const moveVan = (vanId: string, newStatus: VanStatus) => {
    dispatch({ type: "MOVE_VAN_COLUMN", vanId, newStatus })
    // If moving to pending, also revert any associated notes to draft
    if (newStatus === "pending") {
      const note = state.deliveryNotes.find((n) => n.vanId === vanId && n.status !== "completed")
      if (note) dispatch({ type: "UPDATE_NOTE_STATUS", noteId: note.id, status: "draft" })
    }
    setMoveMenuVanId(null)
    haptics.light()
  }

  const columns = COLUMN_ORDER
    .filter((status) => !statusFilter || status === statusFilter)
    .map((status) => {
      const vans = state.vans.filter((v) => v.status === status && matchesSearch(v))
      const meta = STATUS_META[status]
      return { status, meta, vans }
    })

  const noteForVan = (vanId: string): DeliveryNote | undefined =>
    state.deliveryNotes.find((n) => n.vanId === vanId && n.status !== "completed")

  const driverForVan = (van: Van): Driver | undefined =>
    state.drivers.find((d) => d.id === van.driverId)

  const totalInRoute = state.vans.filter((v) => v.status === "in_route").length
  const totalIssues = state.vans.filter((v) => v.status === "issue").length

  return (
    <div className="bg-background text-u900 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-background border-b border-u500 pt-12 pb-5 px-5 flex flex-col gap-4 z-20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { haptics.light(); onBack() }} className="uber-press w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center">
              <Illicon name="back" size={22} color="text-u900" />
            </button>
            <div>
              <h1 className="text-[20px] font-black tracking-tight text-u900">Fleet Board</h1>
              <p className="text-u700 text-[11px]">{state.vans.length} vans · {state.drivers.length} drivers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalIssues > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                <Illicon name="stop-issue" size={13} color="text-red-500" />
                <span className="text-red-500 text-[11px] font-bold">{totalIssues}</span>
              </div>
            )}
            {totalInRoute > 0 && (
              <div className="flex items-center gap-1.5 bg-ugreen-10 border border-[#06c167]/20 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-ugreen animate-pulse" />
                <span className="text-ugreen text-[11px] font-bold">{totalInRoute} live</span>
              </div>
            )}
            <button onClick={() => goTo("alerts")} className="relative uber-press w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center">
              <Illicon name="alert" size={22} color="text-u900" />
              {totalIssues > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Illicon name="search" size={20} color="text-u600" />
          </div>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 rounded-xl bg-u300 border border-u500 text-u900 placeholder-u600 focus:outline-none focus:border-u600 text-[13px]"
            placeholder="Search van, driver, location..."
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${!statusFilter ? "bg-u900 text-u100" : "bg-u300 border border-u500 text-u600"
              }`}
          >
            All
          </button>
          {COLUMN_ORDER.map((s) => {
            const meta = STATUS_META[s]
            const count = state.vans.filter((v) => v.status === s).length
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${statusFilter === s ? "bg-u900 text-u100" : "bg-u300 border border-u500 text-u600"
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label} {count > 0 ? `(${count})` : ""}
              </button>
            )
          })}
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-u200">
        <div className="flex h-full p-4 gap-3 w-max">
          {columns.map(({ status, meta, vans }) => (
            <div key={status} className="w-[80vw] sm:w-[280px] flex flex-col h-full">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-u700">{meta.label}</h2>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.badgeBg}`}>{vans.length}</span>
                </div>
                {status === "pending" && (
                  <button
                    onClick={() => goTo("delivery-note")}
                    className="uber-press text-[10px] font-black text-ugreen flex items-center gap-0.5 bg-ugreen-10 px-2 py-1 rounded-lg border border-ugreen/20"
                  >
                    <Illicon name="dispatch" size={13} color="text-ugreen" />
                    Assign
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto pb-4 pr-1 space-y-2.5" style={{ scrollbarWidth: "none" }}>
                {vans.length === 0 && (
                  <div className="border border-dashed border-u500 rounded-xl py-8 flex flex-col items-center gap-2 text-u600">
                    <Illicon name="van" size={24} color="text-u600" className="opacity-40" />
                    <span className="text-[11px]">Empty</span>
                  </div>
                )}
                {vans.map((van) => {
                  const driver = driverForVan(van)
                  const note = noteForVan(van.id)
                  const pendingStops = note?.stops.filter((s) => s.status === "pending").length ?? 0
                  const doneStops = note ? note.stops.length - pendingStops : 0
                  const totalNoteStops = note?.stops.length ?? 0
                  const initials = driver?.initials ?? ""

                  let capPct = 0
                  let totalExpectedCash = 0
                  if (note) {
                    let totalWeightKg = 0
                    note.stops.forEach(s => {
                      totalExpectedCash += s.expectedCash || 0
                      if (s.type === 'deliver' || s.type === 'mixed') {
                        s.items.forEach(i => { totalWeightKg += (i.qty * (i.weightKg || 0)) })
                      }
                    })
                    if (van.maxWeightKg && van.maxWeightKg > 0) {
                      capPct = Math.min(100, Math.round((totalWeightKg / van.maxWeightKg) * 100))
                    }
                  }

                  const renderKPIs = () => {
                    const chips = []
                    if (capPct > 0) {
                      chips.push(
                        <span key="cap" className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${capPct > 90 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-u400 border-u500 text-u700'}`}>
                          {capPct}% Cap
                        </span>
                      )
                    }
                    if (totalExpectedCash > 1000) {
                      chips.push(
                        <span key="cash" className="text-[9.5px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          Risk: {totalExpectedCash} SAR
                        </span>
                      )
                    }
                    if (status === 'in_route' && (van.id === 'V002' || pendingStops > 3)) {
                      chips.push(
                        <span key="eta" className="text-[9.5px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                          +15m Delay
                        </span>
                      )
                    } else if (status === 'issue') {
                      chips.push(
                        <span key="eta" className="text-[9.5px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded">
                          Delayed
                        </span>
                      )
                    }

                    if (chips.length === 0) return null
                    return <div className="flex flex-wrap gap-1 mt-2 mb-1">{chips}</div>
                  }

                  const renderMoveMenu = () => {
                    if (moveMenuVanId !== van.id) return null
                    return (
                      <div className="absolute right-3 top-10 z-30 bg-u400 border border-u500 rounded-xl shadow-lg p-2 space-y-1 min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                        <p className="text-[9px] font-black text-u600 uppercase tracking-widest px-2 py-1">Move to</p>
                        {COLUMN_ORDER.filter((s) => s !== status).map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); moveVan(van.id, s as VanStatus) }}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] font-bold text-u800 active:bg-u500 transition-colors text-left"
                          >
                            <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                            {STATUS_META[s].label}
                          </button>
                        ))}
                      </div>
                    )
                  }

                  if (status === "issue") return (
                    <div key={van.id} onClick={() => setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id)} className="bg-u300 p-4 rounded-xl border border-u500 border-l-2 border-l-red-500 cursor-pointer relative active:opacity-80 transition-opacity">
                      {renderMoveMenu()}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-black text-[16px] text-u900">{van.plate}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Illicon name="alert-critical" size={14} color="text-red-500" />
                            <p className="text-[11px] font-bold text-red-500">Issue reported</p>
                          </div>
                        </div>
                      </div>
                      {renderKPIs()}
                      {driver && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-u500">
                          <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-[10px]">{initials}</div>
                          <span className="text-[12px] text-u800">{driver.name}</span>
                        </div>
                      )}
                    </div>
                  )

                  if (status === "completed") return (
                    <div key={van.id} onClick={() => setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id)} className="bg-u300 p-4 rounded-xl border border-u500 opacity-60 cursor-pointer relative active:opacity-50 transition-opacity">
                      {renderMoveMenu()}
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-[16px] text-u900">{van.plate}</h3>
                        <Illicon name="stop-done" size={18} filled color="text-ugreen" />
                      </div>
                      <p className="text-[11px] text-u600">{van.model} · {note?.stops.length ?? 0} stops</p>
                      {driver && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-6 w-6 rounded-full bg-u400 flex items-center justify-center text-[10px] font-bold text-u700">{initials}</div>
                          <span className="text-[12px] text-u700">{driver.name}</span>
                        </div>
                      )}
                    </div>
                  )

                  if (status === "loading") {
                    const loadPct = van.loadingPercent ?? 0
                    return (
                      <div key={van.id} onClick={() => setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id)} className="bg-u300 p-4 rounded-xl border border-u500 border-l-2 border-l-yellow-400 cursor-pointer relative active:opacity-80 transition-opacity">
                        {renderMoveMenu()}
                        <h3 className="font-black text-[16px] text-u900 mb-0.5">{van.plate}</h3>
                        <p className="text-[11px] text-u600 mb-3">{van.model}</p>
                        {driver && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-6 rounded-full bg-yellow-400/20 text-yellow-500 flex items-center justify-center font-bold text-[10px]">{initials}</div>
                            <span className="text-[12px] text-u800">{driver.name}</span>
                          </div>
                        )}
                        <div className="h-1.5 bg-u500 rounded-full">
                          <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${loadPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-u600 mt-1.5">
                          <span>Loading {loadPct}%</span>
                          {note && <span>{doneStops}/{totalNoteStops}</span>}
                        </div>
                        {renderKPIs()}
                      </div>
                    )
                  }

                  if (status === "in_route") return (
                    <div key={van.id} onClick={() => setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id)} className="bg-u300 rounded-xl overflow-hidden border border-u500 border-l-2 border-l-[#06c167] cursor-pointer relative active:opacity-80 transition-opacity">
                      {renderMoveMenu()}
                      <div className="h-16 relative">
                        <img alt="Map" className="w-full h-full object-cover opacity-30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDnKVZaQBUFY1m7SGvExJb2w5_tQRqXqh5H_49L39gZcSRTCYeSEKaIJFlaXChMzDPvMEUpoeg0I25-AyDRbD_3ZMRFCazM7vc_DMP_tLhc-E-2cCKGpuS5I_eG0eOgewfSdFY5PChHrDqWOd6OOU_RTzhs6QSG4qMCCz1tu_qUV3IVYSqClEsW_H-Rq5NXMafuKYEoZmHGJ4cp5FI0xWa8BRihBrj3ZJMf5zV8M5A1L5Qr3UlahQvmnYBJhH3l1tj39gjiU64q0nR" />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <p className="text-u900 text-[11px] font-bold font-mono">{van.plate}</p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-ugreen animate-pulse" />
                            <span className="text-ugreen text-[10px] font-bold">Live</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-black text-[15px] text-u900">{van.model}</h3>
                            {note && <p className="text-[11px] text-u600 mt-0.5 truncate">Next: {note.stops.find((s) => s.status === "pending")?.customerName ?? "Done"}</p>}
                          </div>
                          {note && <span className="text-[10px] bg-ugreen-10 text-ugreen px-2 py-0.5 rounded-full font-bold">{doneStops + 1}/{totalNoteStops}</span>}
                        </div>
                        {renderKPIs()}
                        {driver && (
                          <div className="flex items-center gap-2 border-t border-u500 pt-2 mt-1">
                            <div className="h-5 w-5 rounded-full bg-ugreen-20 text-ugreen flex items-center justify-center font-bold text-[9px]">{initials}</div>
                            <span className="text-[11px] text-u800">{driver.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )

                  return (
                    <div key={van.id} onClick={() => setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id)} className={`bg-u300 p-4 rounded-xl border border-u500 ${meta.borderColor ? `border-l-2 ${meta.borderColor}` : ""} relative cursor-pointer active:opacity-80 transition-opacity`}>
                      {renderMoveMenu()}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-black text-[16px] text-u900">{van.plate}</h3>
                          <p className="text-[11px] text-u600 mt-0.5">{van.model} · {van.year}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {status === "pending" && (
                            <button onClick={(e) => { e.stopPropagation(); goTo("delivery-note") }} className="uber-press text-[10px] font-black text-ugreen bg-ugreen-10 px-2 py-1 rounded-lg border border-ugreen/20">
                              Assign
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setMoveMenuVanId(moveMenuVanId === van.id ? null : van.id) }}
                            className="uber-press w-8 h-8 rounded-full bg-u400 flex items-center justify-center p-0"
                          >
                            <span className="material-symbols-outlined text-u600 text-[16px]">more_vert</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {!driver ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-u400 flex items-center justify-center">
                              <Illicon name="driver" size={14} color="text-u600" />
                            </div>
                            <span className="text-[12px] text-u600 italic">Unassigned</span>
                          </>
                        ) : (
                          <>
                            <div className="h-6 w-6 rounded-full bg-u400 text-u900 flex items-center justify-center font-bold text-[10px]">{initials}</div>
                            <span className="text-[12px] text-u800">{driver.name}</span>
                          </>
                        )}
                      </div>
                      {renderKPIs()}
                      {note && (
                        <div className="border-t border-u500 pt-2 flex justify-between items-center mt-1">
                          <span className="text-[10px] font-bold text-ugreen bg-ugreen-10 px-2 py-0.5 rounded-full">{note.stops.length} stops</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${note.priority === "urgent" ? "text-red-500" :
                            note.priority === "high" ? "text-yellow-500" :
                              "text-u600"
                            }`}>{note.priority}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-background border-t border-u500 px-6 py-3 pb-8 flex justify-between items-center shrink-0 z-10">
        <button onClick={() => goTo("kanban")} className="uber-press flex flex-col items-center gap-1">
          <Illicon name="fleet" size={24} filled color="text-u900" />
          <span className="text-[10px] font-black text-u900">Board</span>
        </button>
        <button onClick={() => goTo("map")} className="uber-press flex flex-col items-center gap-1">
          <Illicon name="route" size={24} color="text-u600" />
          <span className="text-[10px] font-medium text-u600">Map</span>
        </button>
        <div className="relative -top-6">
          <button
            onClick={() => goTo("delivery-note")}
            className="uber-press bg-ugreen text-black h-14 w-14 rounded-full shadow-[0_4px_20px_rgba(6,193,103,0.4)] flex items-center justify-center"
          >
            <Illicon name="dispatch" size={28} color="text-black" />
          </button>
        </div>
        <button onClick={() => goTo("driver-registration")} className="uber-press flex flex-col items-center gap-1">
          <Illicon name="driver" size={24} color="text-u600" />
          <span className="text-[10px] font-medium text-u600">Drivers</span>
        </button>
        <button onClick={() => goTo("settings")} className="uber-press flex flex-col items-center gap-1">
          <Illicon name="settings" size={24} color="text-u600" />
          <span className="text-[10px] font-medium text-u600">Settings</span>
        </button>
      </nav>
    </div>
  )
}
