"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { motion } from "framer-motion"
import type { DeliveryNote } from "@/lib/app-context"

const TYPE_META = {
  deliver: { label: "Deliver", icon: "van" as const, color: "text-foreground dark:text-white", bg: "bg-foreground/10 dark:bg-white/10" },
  pickup: { label: "Pickup", icon: "stop-pickup" as const, color: "text-ugreen dark:text-[#06c167]", bg: "bg-ugreen/10 dark:bg-[#06c167]/10" },
  cash: { label: "Cash", icon: "stop-cash" as const, color: "text-amber-500 dark:text-yellow-400", bg: "bg-amber-500/10 dark:bg-yellow-400/10" },
  return: { label: "Return", icon: "stop-return" as const, color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-400/10" },
  mixed: { label: "Mixed", icon: "route" as const, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-400/10" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

function NoteCard({ note, onStart }: { note: DeliveryNote; onStart: () => void }) {
  const haptics = useHaptics()
  const totalItems = note.stops.reduce((sum, s) => sum + s.items.length, 0)
  const totalCash = note.stops.reduce((sum, s) => sum + (s.expectedCash ?? 0), 0)
  const completedStops = note.stops.filter((s) => s.status !== "pending").length
  const isActive = note.status === "sent" || note.status === "acknowledged"
  const isInProgress = note.status === "in_progress"

  return (
    <motion.div variants={itemVariants} className={`bg-card dark:bg-u300 rounded-2xl overflow-hidden border ${isActive ? "border-ugreen/30 dark:border-[#06c167]/30" : "border-border dark:border-white/[0.07]"}`}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${note.priority === "urgent" ? "border-red-500/30 text-red-400 bg-red-500/10" :
                note.priority === "high" ? "border-yellow-500/30 text-yellow-400 bg-yellow-400/10" :
                  "border-white/10 text-u700 bg-transparent"
                }`}>{note.priority}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isActive ? "bg-[#06c167]/15 text-[#06c167]" :
                isInProgress ? "bg-blue-500/15 text-blue-400" :
                  "bg-white/5 text-u700"
                }`}>
                {isActive ? "New" : isInProgress ? "In progress" : note.status}
              </span>
            </div>
            <h3 className="text-[18px] font-black text-foreground dark:text-white leading-snug truncate">
              {note.stops[0]?.customerName ?? "Route"}{note.stops.length > 1 ? ` +${note.stops.length - 1}` : ""}
            </h3>
            <p className="text-[11px] text-muted-foreground dark:text-u600 mt-0.5">{note.warehouse} · {note.id}</p>
          </div>
          {totalCash > 0 && (
            <div className="bg-amber-500/10 dark:bg-yellow-400/10 border border-amber-500/20 dark:border-yellow-400/20 rounded-xl px-3 py-2 text-right shrink-0">
              <p className="text-[9px] font-bold text-muted-foreground dark:text-u700 uppercase">Collect</p>
              <p className="text-[15px] font-black text-amber-500 dark:text-yellow-400">SAR {totalCash.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Stop list */}
        <div className="space-y-2 mb-4">
          {note.stops.slice(0, 3).map((stop) => {
            const meta = TYPE_META[stop.type]
            const done = stop.status !== "pending"
            return (
              <div key={stop.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-ugreen/15 dark:bg-[#06c167]/15" : meta.bg}`}>
                  <Illicon name={done ? "stop-done" : meta.icon} size={13} filled={done} color={done ? "text-ugreen dark:text-[#06c167]" : meta.color} />
                </div>
                <p className={`text-[12px] flex-1 truncate font-medium ${done ? "text-muted-foreground dark:text-u500 line-through" : "text-foreground dark:text-u800"}`}>
                  {stop.customerName}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {stop.items.length > 0 && <span className="text-[10px] text-muted-foreground dark:text-u600">{stop.items.reduce((s, i) => s + i.qty, 0)} items</span>}
                  {stop.expectedCash && <span className="text-[10px] text-amber-500 dark:text-yellow-400 font-bold">SAR {stop.expectedCash}</span>}
                </div>
              </div>
            )
          })}
          {note.stops.length > 3 && <p className="text-[11px] text-u600 pl-9">+{note.stops.length - 3} more stops</p>}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground dark:text-u700 mb-4">
          <span className="flex items-center gap-1.5">
            <Illicon name="destination" size={14} color="text-muted-foreground dark:text-u600" />
            {note.stops.length} stops
          </span>
          <span className="flex items-center gap-1.5">
            <Illicon name="package" size={14} color="text-muted-foreground dark:text-u600" />
            {totalItems} items
          </span>
        </div>

        {/* Progress for in-progress notes */}
        {isInProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground dark:text-u700">Progress</span>
              <span className="text-foreground dark:text-white font-bold">{completedStops}/{note.stops.length}</span>
            </div>
            <div className="h-1.5 bg-muted dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-ugreen dark:bg-[#06c167] rounded-full transition-all"
                style={{ width: `${(completedStops / note.stops.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Dispatch note */}
        {note.notes && (
          <div className="bg-muted dark:bg-white/5 border border-border dark:border-white/[0.07] rounded-xl p-3 mb-4 flex gap-2">
            <Illicon name="info" size={14} color="text-muted-foreground dark:text-u700" className="mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground dark:text-u600 leading-relaxed line-clamp-2">{note.notes}</p>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="border-t border-border dark:border-white/[0.07] px-5 py-4 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground dark:text-u600">
          {note.sentAt ? new Date(note.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </p>
        {isActive ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => { haptics.heavy(); onStart() }}
            className="bg-ugreen dark:bg-[#06c167] text-black font-black text-[14px] px-8 py-3 rounded-xl shadow-[0_4px_16px_rgba(6,193,103,0.3)]"
          >
            Start route
          </motion.button>
        ) : (
          <span className="text-[11px] font-bold text-muted-foreground dark:text-u600 bg-muted dark:bg-white/5 px-3 py-1.5 rounded-full">
            {note.status === "completed" ? "Completed" : "In progress"}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function DeliveryInbox({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { state, dispatch, goTo, activeDriver, activeVan } = useApp()
  const haptics = useHaptics()
  const activeNotes = state.deliveryNotes.filter((n) => ["sent", "acknowledged", "in_progress"].includes(n.status))
  const completedNotes = state.deliveryNotes.filter((n) => n.status === "completed")
  const ptlNotes = state.ptlAvailable
  const [tab, setTab] = useState<"active" | "completed">("active")

  // Calculate current total active load weight
  const currentLoadWeight = activeNotes.reduce((total, note) => {
    return total + note.stops.reduce((stopTotal, s) => {
      return stopTotal + s.items.reduce((itemTotal, i) => itemTotal + (i.qty * (i.weightKg || 0)), 0)
    }, 0)
  }, 0)

  const handleStart = (note: DeliveryNote) => {
    dispatch({ type: "SET_ACTIVE_NOTE", noteId: note.id })
    dispatch({ type: "ACKNOWLEDGE_NOTE", noteId: note.id })
    dispatch({ type: "LOAD_VAN_FROM_NOTE", noteId: note.id })
    onNext?.()
  }

  return (
    <div className="h-full w-full flex flex-col bg-background dark:bg-black text-foreground dark:text-white max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 shrink-0 flex items-center justify-between border-b border-border dark:border-white/[0.07]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press w-10 h-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground dark:text-white" />
          </button>
          <h1 className="text-[26px] font-black text-foreground dark:text-white tracking-tight">Inbox</h1>
        </div>
        <button
          onClick={() => { haptics.tick(); goTo("profile") }}
          className="uber-press w-10 h-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center"
        >
          <Illicon name="driver" size={22} color="text-foreground dark:text-white" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex px-5 pt-4 gap-6 shrink-0">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { haptics.tick(); setTab(t) }}
            className="relative pb-3 flex items-center gap-2"
          >
            <span className={`text-[14px] font-${tab === t ? "black text-foreground dark:text-white" : "medium text-muted-foreground dark:text-u600"}`}>
              {t === "active" ? "Active" : "Completed"}
              {t === "active" && activeNotes.length > 0 && (
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t ? "bg-ugreen dark:bg-[#06c167] text-black" : "bg-muted dark:bg-white/10 text-muted-foreground dark:text-u700"}`}>
                  {activeNotes.length}
                </span>
              )}
            </span>
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground dark:bg-white rounded-full" />}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {tab === "active" && (
          <>
            {/* Fleet AI Assistant Card */}
            <div className="bg-gradient-to-br from-u900 to-black border border-white/10 rounded-3xl p-5 mb-2 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-ugreen/10 blur-3xl group-hover:bg-ugreen/20 transition-all duration-700" />

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-ugreen/10 flex items-center justify-center border border-ugreen/20">
                  <Illicon name="sync" size={16} className="text-ugreen animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-[14px] font-black text-white leading-none">Fleet AI Assistant</h3>
                  <p className="text-[10px] text-ugreen font-bold uppercase tracking-widest mt-1">Live Intelligence</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 border border-white/[0.05] rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Illicon name="route" size={18} color="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white font-bold">Traffic Optimization</p>
                    <p className="text-[11px] text-u600 leading-snug mt-0.5">
                      Heavy congestion building on King Fahd Rd. <span className="text-amber-400">Leave in 8 mins</span> to save 14 mins on your first stop.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/[0.05] rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-ugreen/10 flex items-center justify-center shrink-0">
                    <Illicon name="earnings" size={18} color="text-ugreen" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white font-bold">Earnings Boost</p>
                    <p className="text-[11px] text-u600 leading-snug mt-0.5">
                      High demand in Al-Olaya. Completing your route by 18:30 makes you eligible for the <span className="text-ugreen">SAR 45 Peak Bonus</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] text-u700">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-ugreen animate-pulse" />
                  DeepETA Model v2.4 Active
                </span>
                <button
                  onClick={() => haptics.light()}
                  className="text-white/40 hover:text-white transition-colors flex items-center gap-1"
                >
                  View full analysis <Illicon name="destination" size={10} />
                </button>
              </div>
            </div>

            {activeNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center mb-4">
                  <Illicon name="inbox" size={32} color="text-muted-foreground dark:text-u500" />
                </div>
                <p className="text-foreground dark:text-white font-black text-[16px]">Nothing yet</p>
                <p className="text-muted-foreground dark:text-u600 text-[13px] mt-1">Your dispatcher will send your next route</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
                {activeNotes.map((note) => <NoteCard key={note.id} note={note} onStart={() => handleStart(note)} />)}
              </motion.div>
            )}

            {/* PTL Nearby Pickups */}
            {ptlNotes.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-[13px] font-black text-foreground dark:text-white uppercase tracking-wide">Nearby Pickups</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500">{ptlNotes.length}</span>
                </div>
                <div className="space-y-3">
                  {ptlNotes.map((ptl) => {
                    let ptlWeight = 0;
                    let ptlVolume = 0;
                    ptl.stops.forEach(s => {
                      s.items.forEach(i => {
                        ptlWeight += i.qty * (i.weightKg || 0);
                        ptlVolume += i.qty * (i.volumeCbm || 0);
                      })
                    })

                    const maxWeight = activeVan?.maxWeightKg || 0;
                    // If maxWeight is 0, we don't block
                    const isOverload = maxWeight > 0 ? (currentLoadWeight + ptlWeight > maxWeight) : false;

                    return (
                      <div key={ptl.id} className={`bg-card dark:bg-u300 rounded-2xl border ${isOverload ? 'border-red-500/40' : 'border-blue-500/20'} overflow-hidden`}>
                        <div className={`${isOverload ? 'bg-red-500/10' : 'bg-blue-500/10'} px-4 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${isOverload ? 'text-red-500' : 'text-blue-500'} text-[16px]`}>
                              {isOverload ? 'warning' : 'location_on'}
                            </span>
                            <span className={`text-[11px] font-bold ${isOverload ? 'text-red-500' : 'text-blue-500'}`}>
                              {isOverload ? 'Capacity Exceeded' : (ptl.region ?? "Same Region")}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ptl.priority === "high" ? "bg-yellow-400/15 text-yellow-500" : "bg-u400/50 text-u700"
                            }`}>
                            {ptl.priority}
                          </span>
                        </div>
                        <div className="px-4 py-3">
                          <h4 className="text-[15px] font-black text-foreground dark:text-white mb-1">
                            {ptl.stops[0]?.customerName ?? "Pickup"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground dark:text-u600 mb-1">{ptl.stops[0]?.address}</p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground dark:text-u700 mb-3">
                            <span className="bg-muted dark:bg-u400 px-1.5 py-0.5 rounded-md text-foreground dark:text-white font-bold">{ptlWeight.toFixed(1)} kg</span>
                            <span className="bg-muted dark:bg-u400 px-1.5 py-0.5 rounded-md text-foreground dark:text-white font-bold">{ptlVolume.toFixed(2)} m³</span>
                            <span>{ptl.stops.reduce((s, st) => s + st.items.length, 0)} items</span>
                            <span>{ptl.stops.length} stop{ptl.stops.length > 1 ? "s" : ""}</span>
                          </div>

                          {ptl.notes && (
                            <p className="text-[11px] text-muted-foreground dark:text-u600 italic mb-3">{ptl.notes}</p>
                          )}

                          {isOverload && (
                            <p className="text-[10px] font-bold text-red-500 mb-3 bg-red-500/10 p-2 rounded-lg">
                              Accepting this adds {ptlWeight.toFixed(1)}kg. Your van only has {(maxWeight - currentLoadWeight).toFixed(1)}kg remaining capacity.
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              disabled={isOverload}
                              onClick={() => {
                                haptics.heavy()
                                dispatch({
                                  type: "ACCEPT_PTL_NOTE",
                                  noteId: ptl.id,
                                  driverId: activeDriver?.id ?? "D001",
                                  vanId: activeVan?.id ?? "V001",
                                })
                              }}
                              className={`flex-1 h-[44px] rounded-xl font-black text-[13px] flex items-center justify-center gap-1.5 transition-all
                              ${isOverload ? 'bg-muted dark:bg-u400 text-muted-foreground opacity-50 cursor-not-allowed' : 'bg-ugreen dark:bg-[#06c167] text-black active:brightness-90'}
                            `}
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                              Take It
                            </button>
                            <button
                              onClick={() => {
                                haptics.light()
                                dispatch({ type: "DECLINE_PTL_NOTE", noteId: ptl.id })
                              }}
                              className="flex-1 h-[44px] rounded-xl border border-border dark:border-white/10 text-muted-foreground dark:text-u600 font-bold text-[13px] active:bg-muted dark:active:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {tab === "completed" && (
          <>
            {completedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted dark:bg-white/5 flex items-center justify-center mb-4">
                  <Illicon name="stop-done" size={32} color="text-muted-foreground dark:text-u500" />
                </div>
                <p className="text-foreground dark:text-white font-black text-[16px]">No completed routes</p>
              </div>
            ) : (
              completedNotes.map((note) => <NoteCard key={note.id} note={note} onStart={() => { }} />)
            )}
          </>
        )}
        <div className="h-4" />
      </main>

      {/* Bottom nav */}
      <div className="shrink-0 border-t border-border dark:border-white/[0.07] bg-background dark:bg-black px-5 pb-8 pt-3 flex justify-between">
        {([
          { id: "home", icon: "destination" as const, label: "Home" },
          { id: "inbox", icon: "inbox" as const, label: "Inbox", active: true },
          { id: "earnings", icon: "earnings" as const, label: "Earnings" },
          { id: "profile", icon: "driver" as const, label: "Account" },
        ]).map((item) => (
          <button
            key={item.id}
            onClick={() => { haptics.tick(); goTo(item.id) }}
            className="uber-press flex flex-col items-center gap-1"
          >
            <Illicon name={item.icon} size={26} filled={!!item.active} color={item.active ? "text-foreground dark:text-white" : "text-muted-foreground dark:text-u600"} />
            <span className={`text-[10px] ${item.active ? "font-bold text-foreground dark:text-white" : "font-medium text-muted-foreground dark:text-u600"}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
