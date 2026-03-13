"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { SlideToConfirm } from "@/components/slide-to-confirm"

export default function PreTripCheck({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { dispatch, activeVan } = useApp()
  const haptics = useHaptics()
  const [fuelLevel, setFuelLevel] = useState(75)
  const [checks, setChecks] = useState({ tyre: false, engine: true, load: true })
  const [odometer, setOdometer] = useState("")

  const allChecked = checks.tyre && checks.engine && checks.load

  const toggleCheck = (key: keyof typeof checks) => {
    haptics.tick()
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full h-full bg-background dark:bg-black flex flex-col overflow-hidden text-foreground dark:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0 border-b border-border dark:border-white/[0.07]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press h-10 w-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center"
          >
            <Illicon name="back" size={22} color="text-foreground dark:text-white" />
          </button>
          <div>
            <h1 className="text-[20px] font-black tracking-tight text-foreground dark:text-white">Before you go</h1>
            <p className="text-muted-foreground dark:text-u600 text-[11px] mt-0.5">
              {activeVan ? `${activeVan.model} · ${activeVan.plate}` : "Ford Transit · 1234 KSA"}
            </p>
          </div>
        </div>
        <button onClick={() => alert("Feature coming soon")} className="uber-press h-10 w-10 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center">
          <Illicon name="help" size={20} color="text-foreground dark:text-white" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6" style={{ scrollbarWidth: "none" }}>

        {/* Fuel level */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-black text-muted-foreground dark:text-u700 uppercase tracking-widest">Fuel</p>
            <span className={`text-[15px] font-black ${fuelLevel < 25 ? "text-red-500" : fuelLevel < 50 ? "text-amber-500" : "text-ugreen dark:text-[#06c167]"}`}>
              {fuelLevel}%
            </span>
          </div>
          <div className="bg-card dark:bg-u300 border border-border dark:border-white/[0.07] rounded-2xl p-5">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < Math.round(fuelLevel / 10)
                return (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-md transition-all duration-200 ${filled
                      ? fuelLevel < 25 ? "bg-red-500" : fuelLevel < 50 ? "bg-amber-400" : "bg-ugreen dark:bg-[#06c167]"
                      : "bg-muted dark:bg-white/[0.06]"
                      }`}
                  />
                )
              })}
            </div>
            <input
              type="range" min={0} max={100} value={fuelLevel}
              onChange={(e) => setFuelLevel(Number(e.target.value))}
              className="w-full accent-ugreen dark:accent-[#06c167]"
            />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground dark:text-u500 uppercase tracking-widest">
              <span>Empty</span><span>Half</span><span>Full</span>
            </div>
          </div>
        </section>

        {/* Vehicle checks */}
        <section>
          <p className="text-[13px] font-black text-muted-foreground dark:text-u700 uppercase tracking-widest mb-3">Vehicle</p>
          <div className="space-y-2">
            {([
              { key: "tyre" as const, name: "tyre" as const, label: "Tyres", sub: "Pressure and tread" },
              { key: "engine" as const, name: "engine" as const, label: "Engine", sub: "No warning lights" },
              { key: "load" as const, name: "van-loading" as const, label: "Load space", sub: "Clean and secure" },
            ]).map((item) => (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`uber-press w-full flex items-center gap-4 p-4 rounded-2xl border ${checks[item.key]
                  ? "bg-ugreen/10 dark:bg-[#06c167]/10 border-ugreen/20 dark:border-[#06c167]/20"
                  : "bg-card dark:bg-u300 border-border dark:border-white/[0.07]"
                  }`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${checks[item.key] ? "bg-ugreen/20 dark:bg-[#06c167]/20" : "bg-muted dark:bg-white/[0.05]"
                  }`}>
                  <Illicon
                    name={item.name}
                    size={24}
                    filled={checks[item.key]}
                    color={checks[item.key] ? "text-ugreen dark:text-[#06c167]" : "text-muted-foreground dark:text-u600"}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-[14px] font-bold ${checks[item.key] ? "text-foreground dark:text-white" : "text-muted-foreground dark:text-u700"}`}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground dark:text-u600 mt-0.5">{item.sub}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checks[item.key]
                  ? "bg-ugreen dark:bg-[#06c167] border-ugreen dark:border-[#06c167]"
                  : "border-border dark:border-white/20"
                  }`}>
                  {checks[item.key] && (
                    <Illicon name="check" size={14} filled color="text-black" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Odometer */}
        <section>
          <p className="text-[13px] font-black text-muted-foreground dark:text-u700 uppercase tracking-widest mb-3">Odometer</p>
          <div className="bg-card dark:bg-u300 border border-border dark:border-white/[0.07] rounded-2xl p-5">
            <label className="block text-[10px] font-bold text-muted-foreground dark:text-u500 uppercase tracking-wide mb-2">Current reading</label>
            <div className="flex items-baseline gap-3">
              <input
                className="flex-1 bg-transparent border-0 border-b border-border dark:border-white/10 pb-2 text-[40px] font-black text-foreground dark:text-white placeholder-muted-foreground dark:placeholder-u500 focus:outline-none focus:border-foreground dark:focus:border-white/30 transition-colors"
                placeholder="00000"
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
              <span className="text-[18px] font-bold text-muted-foreground dark:text-u500">km</span>
            </div>
            <p className="text-[11px] text-muted-foreground dark:text-u500 mt-3 flex items-center gap-1.5">
              <Illicon name="odometer" size={14} color="text-muted-foreground dark:text-u600" />
              Last: 124,502 km
            </p>
          </div>
        </section>

        {/* GCC compliance notice */}
        <div className="bg-muted dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-2xl px-4 py-3 flex items-start gap-3">
          <Illicon name="shield" size={18} color="text-ugreen dark:text-[#06c167]" className="mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground dark:text-u700 leading-relaxed">
            Required before every shift in GCC. All checks are logged automatically.
          </p>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 px-5 pb-8 pt-4 border-t border-border dark:border-white/[0.07] bg-background dark:bg-black">
        <SlideToConfirm
          disabled={!allChecked}
          label="CONDITION SAFE"
          successLabel="CONFIRMED"
          icon="check-circle"
          onConfirm={() => {
            dispatch({ type: "SET_DRIVER_STATUS", status: "online" })
            if (activeVan) dispatch({ type: "SET_VAN_STATUS", vanId: activeVan.id, status: "loading" })
            onNext?.()
          }}
        />
        {!allChecked && (
          <p className="text-center text-[11px] text-muted-foreground dark:text-u500 mt-3">
            Tick all checks to enable departure
          </p>
        )}
      </footer>
    </div>
  )
}
