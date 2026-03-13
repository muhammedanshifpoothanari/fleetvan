"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Van } from "@/lib/app-context"

interface VehicleRegistrationProps {
  onBack: () => void
}

export default function VehicleRegistration({ onBack }: VehicleRegistrationProps) {
  const { state, dispatch, goTo } = useApp()
  const [plate, setPlate] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [maxWeightKg, setMaxWeightKg] = useState("")
  const [maxVolumeCbm, setMaxVolumeCbm] = useState("")
  const [maxPallets, setMaxPallets] = useState("")
  const [isRefrigerated, setIsRefrigerated] = useState(false)
  const [allowHazardous, setAllowHazardous] = useState(false)
  const [vinNumber, setVinNumber] = useState("")
  const [insuranceExpiry, setInsuranceExpiry] = useState("")
  const [permitExpiry, setPermitExpiry] = useState("")
  const [driverSearch, setDriverSearch] = useState("")
  const [assignedDriverId, setAssignedDriverId] = useState("")
  const [registered, setRegistered] = useState(false)
  const [docsUploaded, setDocsUploaded] = useState<Record<string, boolean>>({})

  const filteredDrivers = state.drivers.filter(
    (d) => !d.vanId && d.name.toLowerCase().includes(driverSearch.toLowerCase())
  )

  const canRegister = plate.trim().length > 2 && model.trim().length > 2

  const register = () => {
    const newVan: Van = {
      id: `V${Date.now()}`,
      plate: plate.trim().toUpperCase(),
      model: model.trim(),
      year: year.trim() || String(new Date().getFullYear()),
      status: assignedDriverId ? "assigned" : "pending",
      driverId: assignedDriverId || undefined,
      loadingPercent: 0,
      maxWeightKg: Number(maxWeightKg) || 0,
      maxVolumeCbm: Number(maxVolumeCbm) || 0,
      maxPallets: Number(maxPallets) || 0,
      isRefrigerated,
      allowHazardous,
    }
    dispatch({ type: "REGISTER_VAN", van: newVan })
    if (assignedDriverId) {
      dispatch({ type: "SET_VAN_STATUS", vanId: newVan.id, status: "assigned", extra: { driverId: assignedDriverId } })
    }
    setRegistered(true)
  }

  if (registered) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background px-8 gap-6">
        <div className="w-24 h-24 rounded-full bg-ugreen/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-ugreen text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        </div>
        <div className="text-center">
          <h2 className="text-[26px] font-black text-foreground">{plate.toUpperCase()}</h2>
          <p className="text-muted-foreground text-[13px] mt-1">Van registered successfully</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 w-full space-y-3">
          {[
            { label: "Plate", value: plate.toUpperCase() },
            { label: "Model", value: model },
            { label: "Year", value: year || "—" },
            { label: "Max Weight", value: maxWeightKg ? `${maxWeightKg} kg` : "—" },
            { label: "Volume", value: maxVolumeCbm ? `${maxVolumeCbm} m³` : "—" },
            { label: "Pallets", value: maxPallets || "—" },
            { label: "Type", value: isRefrigerated ? "Refrigerated" : allowHazardous ? "Hazmat" : "Standard Dry" },
            { label: "Driver", value: state.drivers.find((d) => d.id === assignedDriverId)?.name ?? "Unassigned" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">{row.label}</span>
              <span className="text-[13px] font-bold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => goTo("kanban")} className="flex-1 h-[52px] rounded-xl bg-foreground text-background font-black text-[14px] active:opacity-90 transition-colors">
            Fleet Board
          </button>
          <button onClick={onBack} className="flex-1 h-[52px] rounded-xl border border-border text-foreground font-bold text-[14px] active:bg-card transition-colors">
            Add Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center uber-press"
          >
            <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-foreground text-[20px] font-black tracking-tight">Register Van</h2>
            <p className="text-muted-foreground text-[11px]">Add a new vehicle to your fleet</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>

        {/* Van details */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plate number</label>
            <div className="relative">
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="e.g. 1234 ABC"
                type="text"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-muted-foreground text-[20px]">badge</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">VIN Number</label>
            <input
              value={vinNumber}
              onChange={(e) => setVinNumber(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
              placeholder="e.g. 1HGCM82633A004352"
              type="text"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Insurance Expiry</label>
              <input
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Permit Expiry</label>
              <input
                value={permitExpiry}
                onChange={(e) => setPermitExpiry(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Make & model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
              placeholder="e.g. Toyota HiAce"
              type="text"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Year</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="YYYY"
                type="number"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Max Weight <span className="text-muted-foreground font-normal normal-case">(kg)</span>
              </label>
              <input
                value={maxWeightKg}
                onChange={(e) => setMaxWeightKg(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="e.g. 3000"
                type="number"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Max Volume <span className="text-muted-foreground font-normal normal-case">(m³)</span>
              </label>
              <input
                value={maxVolumeCbm}
                onChange={(e) => setMaxVolumeCbm(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="e.g. 14"
                type="number"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Pallet Slots
              </label>
              <input
                value={maxPallets}
                onChange={(e) => setMaxPallets(e.target.value)}
                className="w-full h-12 rounded-xl border border-border bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
                placeholder="e.g. 4"
                type="number"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-2 mb-2 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isRefrigerated} onChange={(e) => setIsRefrigerated(e.target.checked)} className="accent-ugreen w-4 h-4" />
              <span className="text-[13px] font-bold text-foreground">Refrigerated</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" checked={allowHazardous} onChange={(e) => setAllowHazardous(e.target.checked)} className="accent-ugreen w-4 h-4" />
              <span className="text-[13px] font-bold text-foreground">Hazmat Allowed</span>
            </label>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Driver assignment */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Assign primary driver</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
            <input
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-card pl-11 pr-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none transition-all"
              placeholder="Search driver name..."
              type="text"
            />
          </div>
          <p className="text-xs text-muted-foreground">You can reassign this later from the fleet dashboard.</p>

          {/* None option */}
          <button
            onClick={() => setAssignedDriverId("")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${!assignedDriverId ? "bg-muted border-border" : "bg-card border-border"
              }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!assignedDriverId ? "bg-border" : "bg-muted"}`}>
              <span className={`material-symbols-outlined text-[18px] ${!assignedDriverId ? "text-foreground" : "text-muted-foreground"}`}>block</span>
            </div>
            <p className={`font-bold text-[13px] flex-1 text-left ${!assignedDriverId ? "text-foreground" : "text-muted-foreground"}`}>No driver (assign later)</p>
            {!assignedDriverId && <span className="material-symbols-outlined text-ugreen text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          </button>

          {filteredDrivers.length > 0 && (
            <div className="space-y-2">
              {filteredDrivers.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setAssignedDriverId(d.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${assignedDriverId === d.id ? "bg-muted border-border" : "bg-card border-border"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] ${assignedDriverId === d.id ? "bg-ugreen/20 text-ugreen" : "bg-muted text-muted-foreground"}`}>
                    {d.initials}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-[13px] ${assignedDriverId === d.id ? "text-foreground" : "text-muted-foreground"}`}>{d.name}</p>
                    <p className="text-muted-foreground text-[11px]">{d.phone}</p>
                  </div>
                  {assignedDriverId === d.id && <span className="material-symbols-outlined text-ugreen text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Documents */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Required documents</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "verified_user", label: "Insurance" },
              { icon: "description", label: "Permits" },
            ].map((doc) => (
              <label
                key={doc.label}
                className={`flex flex-col items-center justify-center p-5 border-2 ${docsUploaded[doc.label] ? "border-solid border-ugreen/30 bg-ugreen/5" : "border-dashed border-border"} rounded-xl cursor-pointer active:bg-card transition-colors relative overflow-hidden`}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setDocsUploaded(p => ({ ...p, [doc.label]: true }))
                    }
                  }}
                />
                <div className={`w-10 h-10 rounded-full ${docsUploaded[doc.label] ? "bg-ugreen/20" : "bg-card"} flex items-center justify-center mb-2`}>
                  <span className={`material-symbols-outlined ${docsUploaded[doc.label] ? "text-ugreen" : "text-muted-foreground"}`}>
                    {docsUploaded[doc.label] ? "check_circle" : doc.icon}
                  </span>
                </div>
                <span className={`text-sm font-bold ${docsUploaded[doc.label] ? "text-ugreen" : "text-foreground"} text-center`}>
                  {docsUploaded[doc.label] ? "Uploaded" : doc.label}
                </span>
                <span className="text-[10px] text-muted-foreground text-center mt-1">
                  {docsUploaded[doc.label] ? "Tap to change" : "PDF or JPG"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 pt-4 border-t border-border shrink-0">
        <button
          onClick={register}
          disabled={!canRegister}
          className="uber-press w-full h-14 bg-ugreen disabled:bg-muted disabled:text-muted-foreground text-black rounded-xl text-[15px] font-black tracking-wide flex items-center justify-center gap-2 active:brightness-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          ADD VAN
        </button>
      </div>
    </div>
  )
}
