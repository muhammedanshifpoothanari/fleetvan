"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Driver } from "@/lib/app-context"

const STEPS = ["Personal", "ID & License", "Assign Van"]

export default function DriverRegistration({ onBack }: { onBack: () => void; onNext?: () => void }) {
  const { state, dispatch, goTo } = useApp()
  const [step, setStep] = useState(0)
  const [registered, setRegistered] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [licenseNum, setLicenseNum] = useState("")
  const [password, setPassword] = useState("")
  const [emergencyContact, setEmergencyContact] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [nationality, setNationality] = useState("")
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [docsUploaded, setDocsUploaded] = useState<Record<string, boolean>>({})
  const [assignedVanId, setAssignedVanId] = useState(
    state.vans.find((v) => !v.driverId)?.id ?? state.vans[0]?.id ?? ""
  )

  const availableVans = state.vans.filter((v) => !v.driverId || v.id === assignedVanId)
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("")

  const canProceed = () => {
    if (step === 0) return name.trim().length > 1 && phone.trim().length > 7
    if (step === 1) return nationalId.trim().length > 5 && licenseNum.trim().length > 4
    return true
  }

  const register = () => {
    const newDriver: Driver = {
      id: `D${Date.now()}`, name: name.trim(), phone: phone.trim(), initials,
      vanId: assignedVanId, status: "offline", rating: 0, trips: 0, acceptance: 100,
    }
    dispatch({ type: "REGISTER_DRIVER", driver: newDriver })
    if (assignedVanId) dispatch({ type: "SET_VAN_STATUS", vanId: assignedVanId, status: "assigned", extra: { driverId: newDriver.id } })
    setRegistered(true)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background px-8 gap-6">
        <div className="w-24 h-24 rounded-full bg-ugreen/15 flex items-center justify-center text-[32px] font-black text-ugreen">
          {initials}
        </div>
        <div className="text-center">
          <h2 className="text-[26px] font-black text-foreground">{name}</h2>
          <p className="text-muted-foreground text-[13px] mt-1">Driver registered successfully</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 w-full space-y-3">
          {[
            { label: "Phone", value: phone },
            { label: "National ID", value: nationalId },
            { label: "License", value: licenseNum },
            { label: "Assigned Van", value: state.vans.find((v) => v.id === assignedVanId)?.plate ?? "None" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">{row.label}</span>
              <span className="text-[13px] font-bold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Driver now appears in the fleet board and can be assigned to delivery notes.
        </p>
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
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-5 border-b border-border shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
          <span className="material-symbols-outlined text-foreground text-[22px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-[20px] font-black tracking-tight text-foreground">Register Driver</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{STEPS[step]} — Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-5 pt-4 pb-0 shrink-0">
        {STEPS.map((s, idx) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${idx <= step ? "bg-foreground" : "bg-muted"}`} />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 space-y-4" style={{ scrollbarWidth: "none" }}>

        {/* Step 0 — Personal */}
        {step === 0 && (
          <>
            <div className="flex justify-center mb-4">
              <label className="w-24 h-24 rounded-full bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted transition-colors overflow-hidden relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setPhotoUploaded(true)
                    }
                  }}
                />
                {photoUploaded ? (
                  <div className="w-full h-full bg-ugreen/20 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-ugreen text-[32px]">check_circle</span>
                  </div>
                ) : name.length > 1 ? (
                  <span className="text-[28px] font-black text-foreground">{initials}</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-muted-foreground text-[28px]">add_a_photo</span>
                    <span className="text-[10px] font-medium text-muted-foreground">Photo</span>
                  </>
                )}
              </label>
            </div>
            {[
              { label: "Full Name", placeholder: "e.g. Ahmed Al-Sudairi", value: name, onChange: setName, type: "text" },
              { label: "Phone Number", placeholder: "+966 5X XXX XXXX", value: phone, onChange: setPhone, type: "tel" },
              { label: "Nationality", placeholder: "e.g. Saudi Arabian", value: nationality, onChange: setNationality, type: "text" },
              { label: "Emergency Contact", placeholder: "+966 5X XXX XXXX", value: emergencyContact, onChange: setEmergencyContact, type: "tel" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground text-[15px] font-medium placeholder-u500 focus:outline-none focus:border-border transition-colors"
                />
              </div>
            ))}
          </>
        )}

        {/* Step 1 — ID & License */}
        {step === 1 && (
          <>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-ugreen text-[18px] mt-0.5 shrink-0">shield_person</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Documents are encrypted and stored securely. Only accessible to fleet managers. GCC compliance enforced.
              </p>
            </div>
            {[
              { label: "National ID / Iqama", placeholder: "e.g. 1098765432", value: nationalId, onChange: setNationalId, type: "text" },
              { label: "Driving License Number", placeholder: "e.g. LIC-2024-00234", value: licenseNum, onChange: setLicenseNum, type: "text" },
              { label: "Blood Group", placeholder: "e.g. O+, A-, B+", value: bloodGroup, onChange: setBloodGroup, type: "text" },
              { label: "Login Password", placeholder: "Min 8 characters", value: password, onChange: setPassword, type: "password" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground text-[15px] font-medium placeholder-u500 focus:outline-none focus:border-border transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-3">Documents</label>
              <div className="grid grid-cols-2 gap-2">
                {["ID Front", "ID Back", "License", "Selfie"].map((doc) => (
                  <label key={doc} className={`bg-card border ${docsUploaded[doc] ? "border-solid border-ugreen/30 bg-ugreen/5" : "border-dashed border-border"} rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer active:bg-muted transition-colors`}>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          setDocsUploaded(p => ({ ...p, [doc]: true }))
                        }
                      }}
                    />
                    <span className={`material-symbols-outlined ${docsUploaded[doc] ? "text-ugreen" : "text-muted-foreground"} text-[28px]`}>
                      {docsUploaded[doc] ? "check_circle" : "upload_file"}
                    </span>
                    <span className={`text-[10px] font-medium ${docsUploaded[doc] ? "text-ugreen font-bold" : "text-muted-foreground"} text-center leading-tight px-2`}>
                      {docsUploaded[doc] ? "Uploaded" : doc}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Assign Van */}
        {step === 2 && (
          <>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-ugreen/15 flex items-center justify-center text-[22px] font-black text-ugreen">
                  {initials}
                </div>
                <div>
                  <p className="text-[18px] font-black text-foreground">{name}</p>
                  <p className="text-muted-foreground text-[13px]">{phone}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-3">Assign Van (Optional)</label>
              {availableVans.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-5 text-center">
                  <span className="material-symbols-outlined text-muted-foreground text-[32px] block mb-2">local_shipping</span>
                  <p className="text-[13px] text-muted-foreground">No available vans. Register a van first.</p>
                  <button onClick={() => goTo("register")} className="text-[13px] font-bold text-ugreen mt-2">Register a Van</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setAssignedVanId("")}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${!assignedVanId ? "bg-muted border-border" : "bg-card border-border"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!assignedVanId ? "bg-border" : "bg-muted"}`}>
                      <span className={`material-symbols-outlined text-[20px] ${!assignedVanId ? "text-foreground" : "text-muted-foreground"}`}>block</span>
                    </div>
                    <p className={`font-bold text-[14px] ${!assignedVanId ? "text-foreground" : "text-muted-foreground"}`}>No van (assign later)</p>
                    {!assignedVanId && (
                      <span className="ml-auto material-symbols-outlined text-ugreen text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                  {availableVans.map((van) => (
                    <button
                      key={van.id}
                      onClick={() => setAssignedVanId(van.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${assignedVanId === van.id ? "bg-muted border-border" : "bg-card border-border"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${assignedVanId === van.id ? "bg-border" : "bg-muted"}`}>
                        <span className={`material-symbols-outlined text-[20px] ${assignedVanId === van.id ? "text-foreground" : "text-muted-foreground"}`}>local_shipping</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-bold text-[14px] ${assignedVanId === van.id ? "text-foreground" : "text-muted-foreground"}`}>{van.model}</p>
                        <p className={`text-[11px] ${assignedVanId === van.id ? "text-muted-foreground" : "text-muted-foreground"}`}>{van.plate} · {van.year}</p>
                      </div>
                      {assignedVanId === van.id && (
                        <span className="material-symbols-outlined text-ugreen text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-5 pb-8 pt-4 border-t border-border">
        {step < STEPS.length - 1 ? (
          <button
            disabled={!canProceed()}
            onClick={() => setStep((s) => s + 1)}
            className="w-full h-[58px] bg-foreground disabled:bg-muted disabled:text-muted-foreground text-background font-black text-[17px] rounded-xl active:opacity-90 transition-all"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={register}
            className="w-full h-[58px] bg-ugreen text-black font-black text-[17px] rounded-xl active:brightness-90 transition-all flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(6,193,103,0.3)]"
          >
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
            Register Driver
          </button>
        )}
      </div>
    </div>
  )
}
