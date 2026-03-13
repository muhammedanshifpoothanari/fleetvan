"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"

export default function Localization({ onBack }: { onBack: () => void }) {
  const { goTo } = useApp()
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [calendar, setCalendar] = useState<"gregorian" | "hijri">("hijri")
  const [islamicSync, setIslamicSync] = useState(true)

  return (
    <div className="relative flex h-full w-full flex-col bg-background mx-auto max-w-md shadow-xl overflow-hidden border-x border-border">
      {/* Header */}
      <div className="flex items-center bg-card p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border">
        <button onClick={onBack} className="text-foreground flex size-12 shrink-0 items-center cursor-pointer hover:bg-muted rounded-full justify-center transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight flex-1 text-center">Localization</h2>
        <div className="flex w-12 items-center justify-end">
          <button onClick={() => alert("Localization settings saved!")} className="text-foreground text-base font-bold shrink-0 hover:opacity-70 transition-opacity">Save</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {/* Regional Preferences */}
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider px-4 pb-2 pt-6">REGIONAL PREFERENCES</h3>
        <div className="bg-card border-y border-border">
          {/* Region */}
          <div className="flex items-center gap-4 px-4 min-h-[64px] justify-between hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
                <span className="material-symbols-outlined text-[24px]">public</span>
              </div>
              <div className="flex flex-col">
                <p className="text-foreground text-base font-medium">Region</p>
                <p className="text-muted-foreground text-sm">Saudi Arabia</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Locked</span>
              <span className="material-symbols-outlined text-muted-foreground text-[18px]">lock</span>
            </div>
          </div>
          <div className="h-px bg-border ml-16" />

          {/* Currency */}
          <div className="flex items-center gap-4 px-4 min-h-[64px] justify-between hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
                <span className="material-symbols-outlined text-[24px]">currency_exchange</span>
              </div>
              <div className="flex flex-col">
                <p className="text-foreground text-base font-medium">Currency</p>
                <p className="text-muted-foreground text-sm">SAR (Saudi Riyal)</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="material-symbols-outlined text-muted-foreground text-[18px]">lock</span>
            </div>
          </div>
          <div className="h-px bg-border ml-16" />

          {/* Language Toggle */}
          <div className="flex flex-col gap-3 px-4 py-4 min-h-[64px] justify-center">
            <div className="flex items-center gap-4 mb-1">
              <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
                <span className="material-symbols-outlined text-[24px]">translate</span>
              </div>
              <p className="text-foreground text-base font-medium flex-1">System Language</p>
            </div>
            <div className="flex w-full bg-muted p-1 rounded-lg ml-14" style={{ width: "calc(100% - 3.5rem)" }}>
              <button
                onClick={() => setLanguage("en")}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium text-center transition-all ${language === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium text-center transition-all ${language === "ar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {"\u0627\u0644\u0639\u0631\u0628\u064A\u0629"}
              </button>
            </div>
          </div>
        </div>

        {/* Formatting */}
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider px-4 pb-2 pt-6">FORMATTING</h3>
        <div className="bg-card border-y border-border">
          {/* Calendar System */}
          <div className="flex flex-col gap-3 px-4 py-4 min-h-[64px] justify-center">
            <div className="flex items-center gap-4 mb-1">
              <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
              <p className="text-foreground text-base font-medium flex-1">Calendar System</p>
            </div>
            <div className="flex w-full bg-muted p-1 rounded-lg ml-14" style={{ width: "calc(100% - 3.5rem)" }}>
              <button
                onClick={() => setCalendar("gregorian")}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium text-center transition-all ${calendar === "gregorian" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Gregorian
              </button>
              <button
                onClick={() => setCalendar("hijri")}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium text-center transition-all ${calendar === "hijri" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Hijri
              </button>
            </div>
          </div>
          <div className="h-px bg-border ml-16" />

          {/* Islamic Calendar Sync */}
          <div className="flex items-center gap-4 px-4 min-h-[72px] justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-foreground flex items-center justify-center rounded-lg bg-muted shrink-0 size-10">
                <span className="material-symbols-outlined text-[24px]">event_note</span>
              </div>
              <div className="flex flex-col pr-2">
                <p className="text-foreground text-base font-medium">Islamic Calendar Sync</p>
                <p className="text-muted-foreground text-xs leading-tight mt-0.5">Align maintenance schedules with Hijri dates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={islamicSync}
                onChange={() => setIslamicSync(!islamicSync)}
              />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
            </label>
          </div>
        </div>

        {/* Preview Card */}
        <h3 className="text-muted-foreground text-xs font-bold tracking-wider px-4 pb-2 pt-6">LOCALIZATION PREVIEW</h3>
        <div className="px-4 pb-4">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="mt-1 text-foreground">
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Address Format</p>
                <p className="text-foreground text-sm font-medium">4521 King Fahd Rd</p>
                <p className="text-foreground text-sm">Al Olaya, Riyadh 12214</p>
                <p className="text-foreground text-sm">Saudi Arabia</p>
              </div>
            </div>
            <div className="h-px bg-border w-full mb-4" />
            <div className="flex items-start gap-4">
              <div className="mt-1 text-foreground">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">{"Date & Time"}</p>
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">12 Rajab 1445 AH</span>
                  <span className="bg-foreground/10 text-foreground text-[10px] px-1.5 py-0.5 rounded font-bold">HIJRI</span>
                </div>
                <p className="text-foreground text-sm mt-0.5">09:41 AM</p>
              </div>
            </div>
          </div>
          <p className="px-2 mt-3 text-xs text-muted-foreground text-center leading-relaxed">
            Changes to language and calendar settings will reflect across all driver apps and dispatch panels immediately.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 border-t border-border bg-card px-4 pb-6 pt-2 z-20">
        <div className="flex gap-2">
          <button onClick={() => goTo("home")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground">
            <div className="flex h-8 items-center justify-center"><span className="material-symbols-outlined text-[24px]">home</span></div>
            <p className="text-xs font-medium">Home</p>
          </button>
          <button onClick={() => goTo("kanban")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground">
            <div className="flex h-8 items-center justify-center"><span className="material-symbols-outlined text-[24px]">directions_car</span></div>
            <p className="text-xs font-medium">Fleet</p>
          </button>
          <button onClick={() => goTo("delivery-note")} className="flex flex-1 flex-col items-center gap-1 text-muted-foreground">
            <div className="flex h-8 items-center justify-center"><span className="material-symbols-outlined text-[24px]">list_alt</span></div>
            <p className="text-xs font-medium">Activity</p>
          </button>
          <button onClick={() => goTo("profile")} className="flex flex-1 flex-col items-center gap-1 text-foreground">
            <div className="flex h-8 items-center justify-center"><span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span></div>
            <p className="text-xs font-medium">Account</p>
          </button>
        </div>
      </div>
    </div>
  )
}
