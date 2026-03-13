"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { useEffect } from "react"
import { useHaptics } from "@/hooks/use-haptics"
import { useAudio } from "@/hooks/use-audio"
import ScreenTransition, { type TransitionType } from "@/components/screen-transition"
import { ThemeToggle } from "@/components/theme-toggle"
import { DynamicIsland } from "@/components/dynamic-island"

// Driver flow screens
import DriverHome from "@/components/screens/driver-home"
import PreTripCheck from "@/components/screens/pre-trip-check"
import DeliveryInbox from "@/components/screens/delivery-inbox"
import WarehouseLoading from "@/components/screens/warehouse-loading"
import RouteNavigation from "@/components/screens/route-navigation"
import StopAction from "@/components/screens/stop-action"
import DailySummary from "@/components/screens/daily-summary"
import ActiveRoute from "@/components/screens/active-route"
import VanInventory from "@/components/screens/van-inventory"
import Earnings from "@/components/screens/earnings"
import DriverProfile from "@/components/screens/driver-profile"

// Company flow screens
import KanbanDashboard from "@/components/screens/kanban-dashboard"
import LiveMap from "@/components/screens/live-map"
import AlertsPanel from "@/components/screens/alerts-panel"
import SalesDashboard from "@/components/screens/sales-dashboard"
import StockTransfer from "@/components/screens/stock-transfer"
import StockReconciliation from "@/components/screens/stock-reconciliation"
import FleetMaintenance from "@/components/screens/fleet-maintenance"
import VehicleRegistration from "@/components/screens/vehicle-registration"
import DriverPerformance from "@/components/screens/driver-performance"
import FleetSettings from "@/components/screens/fleet-settings"
import Localization from "@/components/screens/localization"
import DeliveryNote from "@/components/screens/delivery-note"
import DriverRegistration from "@/components/screens/driver-registration"
import LiveTracking from "@/components/screens/live-tracking"

// ── Transition map — determines the Uber motion style per screen ─────────────
function getTransition(screen: string, direction: string): TransitionType {
  // Context-change screens (portals) use fade
  if (screen === "launcher" || screen === "driver-portal" || screen === "company-portal") return "fade"
  // Going back: drill-back
  if (direction === "back") return "drill-back"
  // Root navigation: fade
  if (direction === "root") return "fade"
  // Sheet-style screens: slide-up
  if (["profile", "earnings", "alerts", "settings", "localization"].includes(screen)) return "slide-up"
  // Default: drill-forward
  return "drill-forward"
}

// ── AppShell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { state, dispatch, goTo } = useApp()
  const screen = state.screen
  const transition = getTransition(screen, state.navDirection)
  const haptics = useHaptics()
  const { playSwoosh, playPop } = useAudio()
  const ludic = state.ludicrousMode

  // Track screen changes for haptics and audio
  useEffect(() => {
    if (state.screen) {
      haptics.light()
      playSwoosh()
    }
  }, [state.screen, haptics, playSwoosh])

  // ── Smart Resume: skip launcher if driver is mid-shift ──────────────────
  useEffect(() => {
    if (screen === "launcher" && state.driverStatus !== "offline") {
      // Auto-navigate based on current driver state
      if (state.driverStatus === "in_route") {
        goTo("navigation", "fade")
      } else if (state.driverStatus === "loading") {
        goTo("warehouse", "fade")
      } else if (state.driverStatus === "completed") {
        goTo("summary", "fade")
      } else {
        // online or other active state
        goTo("home", "fade")
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const back = () => goTo("driver-portal", "back")
  const backToCompany = () => goTo("company-portal", "back")

  function renderScreen() {
    // ── Role select ──────────────────────────────────────────────────────────
    if (screen === "launcher") return <RoleSelect />
    if (screen === "driver-portal") return <DriverPortal />
    if (screen === "company-portal") return <CompanyPortal />

    // ── Driver flow ──────────────────────────────────────────────────────────
    if (screen === "home") return <DriverHome onBack={() => goTo("driver-portal", "back")} onNext={() => goTo("precheck")} />
    if (screen === "precheck") return <PreTripCheck onBack={() => goTo("home", "back")} onNext={() => goTo("inbox")} />
    if (screen === "inbox") return <DeliveryInbox onBack={() => goTo("home", "back")} onNext={() => goTo("warehouse")} />
    if (screen === "warehouse") return (
      <WarehouseLoading
        onBack={() => goTo("inbox", "back")}
        onNext={() => {
          dispatch({ type: "SET_DRIVER_STATUS", status: "in_route" })
          dispatch({ type: "SET_VAN_STATUS", vanId: state.vans[0]?.id ?? "", status: "in_route" })
          goTo("navigation")
        }}
      />
    )
    if (screen === "navigation") return <RouteNavigation onBack={() => goTo("warehouse", "back")} onNext={() => goTo("stop-action")} />
    if (screen === "stop-action") return (
      <StopAction
        onBack={() => goTo("navigation", "back")}
        onNext={() => {
          if (state.driverStatus === "completed") {
            goTo("summary")
          } else {
            goTo("navigation")
          }
        }}
      />
    )
    if (screen === "summary") return (
      <DailySummary
        onBack={() => goTo("launcher", "root")}
        onNext={() => {
          dispatch({ type: "SET_DRIVER_STATUS", status: "offline" })
          goTo("launcher", "root")
        }}
      />
    )

    // ── Driver extra screens ─────────────────────────────────────────────────
    if (screen === "route") return <ActiveRoute onBack={back} />
    if (screen === "inventory") return <VanInventory onBack={() => { if (state.prevScreen === "company-portal") backToCompany(); else back() }} />
    if (screen === "earnings") return <Earnings onBack={back} />
    if (screen === "profile") return <DriverProfile onBack={back} />

    // ── Company screens ──────────────────────────────────────────────────────
    if (screen === "kanban") return <KanbanDashboard onBack={() => goTo("launcher", "root")} />
    if (screen === "map") return <LiveMap onBack={backToCompany} />
    if (screen === "alerts") return <AlertsPanel onBack={backToCompany} />
    if (screen === "dashboard") return <SalesDashboard onBack={backToCompany} />
    if (screen === "stock-transfer") return <StockTransfer onBack={backToCompany} />
    if (screen === "stock") return <StockReconciliation onBack={backToCompany} />
    if (screen === "maintenance") return <FleetMaintenance onBack={backToCompany} />
    if (screen === "register") return <VehicleRegistration onBack={backToCompany} />
    if (screen === "performance") return <DriverPerformance onBack={backToCompany} />
    if (screen === "settings") return <FleetSettings onBack={backToCompany} />
    if (screen === "localization") return <Localization onBack={backToCompany} />
    if (screen === "delivery-note") return <DeliveryNote onBack={backToCompany} />
    if (screen === "driver-registration") return <DriverRegistration onBack={backToCompany} />
    if (screen === "tracking") return <LiveTracking onBack={backToCompany} />

    return <RoleSelect />
  }

  return (
    <div className={`h-full w-full ${ludic ? "cyber-mode" : ""}`}>
      <style jsx global>{`
        .cyber-mode {
          --ugreen: #06b6d4 !important; /* Neon Cyan */
          --background: #020617 !important; /* Deep Navy */
          --card: #0f172a !important;
          --border: #1e293b !important;
          --muted: #0f172a !important;
          --foreground: #f8fafc !important;
          --muted-foreground: #94a3b8 !important;
        }
        .cyber-mode * {
          transition-duration: 0.1s !important;
        }
        .cyber-mode .bg-ugreen {
          background-color: var(--ugreen) !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4) !important;
        }
        .cyber-mode .border-ugreen\/30 {
          border-color: rgba(6, 182, 212, 0.3) !important;
        }
        .cyber-mode .text-ugreen {
          color: var(--ugreen) !important;
        }
      `}</style>
      <DynamicIsland />
      <ScreenTransition
        screenKey={screen}
        transition={transition}
        speed={ludic ? 0.3 : 1}
      >
        {renderScreen()}
      </ScreenTransition>

      {/* Ludicrous Alert Overlay */}
      {ludic && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-cyan-500 text-black px-3 py-1 rounded-full text-[10px] font-black tracking-tighter animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            LUDICROUS MODE ACTIVE
          </div>
        </div>
      )}
    </div>
  )
}

// ── Role Select ──────────────────────────────────────────────────────────────
function RoleSelect() {
  const { state, dispatch, goTo } = useApp()
  const haptics = useHaptics()

  return (
    <div className="h-dvh bg-background text-foreground flex flex-col overflow-hidden">
      {/* Wordmark + Theme Toggle */}
      <div className="px-6 pt-16 pb-8 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-ugreen flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-black text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
          </div>
          <span className="text-[17px] font-black tracking-tight text-foreground">FLEETVAN</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero copy */}
      <div className="px-6 mb-12">
        <h1 className="text-[38px] font-black leading-[1.08] tracking-tight text-foreground text-balance">
          Let's get<br />moving.
        </h1>
        <p className="text-muted-foreground text-[14px] mt-3 leading-relaxed">
          Pick your role to get started.
        </p>
      </div>

      {/* Role cards */}
      <div className="px-5 flex flex-col gap-3 flex-1">
        {/* Driver */}
        <button
          onClick={() => goTo("driver-portal", "forward")}
          className="flex-1 max-h-[200px] rounded-2xl overflow-hidden relative bg-ugreen active:brightness-90 transition-all flex flex-col justify-between p-6"
          style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-black/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-black text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            </div>
            <span className="material-symbols-outlined text-black/40 text-[28px]">arrow_outward</span>
          </div>
          <div className="text-left">
            <p className="text-black font-black text-[24px] tracking-tight leading-none">I'm a driver</p>
            <p className="text-black/60 text-[13px] mt-1">Go online, deliver, earn</p>
          </div>
        </button>

        {/* Company */}
        <button
          onClick={() => goTo("company-portal", "forward")}
          className="flex-1 max-h-[200px] rounded-2xl overflow-hidden relative bg-card active:bg-muted flex flex-col justify-between p-6 border border-border"
          style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-foreground text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>business</span>
            </div>
            <span className="material-symbols-outlined text-foreground/30 text-[28px]">arrow_outward</span>
          </div>
          <div className="text-left">
            <p className="text-foreground font-black text-[24px] tracking-tight leading-none">I manage the fleet</p>
            <p className="text-muted-foreground text-[13px] mt-1">Dispatch, track, manage</p>
          </div>
        </button>
      </div>

      <p className="text-center text-muted-foreground text-[11px] py-6">Powered by real-time decisions</p>
    </div>
  )
}

// ── Driver Portal ─────────────────────────────────────────────────────────────
function DriverPortal() {
  const { state, goTo } = useApp()
  const driver = state.drivers[0]
  const van = state.vans.find((v) => v.id === driver?.vanId)
  const activeNote = state.deliveryNotes.find((n) => n.id === state.activeNoteId)
  const pendingStops = activeNote?.stops.filter((s) => s.status === "pending").length ?? 0

  const quickLinks = [
    { id: "inbox", label: "Inbox", icon: "inbox", badge: pendingStops },
    { id: "inventory", label: "Van", icon: "inventory_2", badge: 0 },
    { id: "earnings", label: "Earnings", icon: "payments", badge: 0 },
    { id: "profile", label: "Account", icon: "person", badge: 0 },
  ]

  return (
    <div className="h-dvh bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-12 pb-0 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo("launcher", "back")}
            className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 active:bg-muted/80"
            style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
          >
            <span className="material-symbols-outlined text-foreground text-[20px]">arrow_back</span>
          </button>
          <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">Driver</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8" style={{ scrollbarWidth: "none" }}>
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-[32px] font-black tracking-tight leading-[1.1] text-foreground">
            {state.driverStatus === "offline"
              ? <>Ready<br />when you are.</>
              : <>You're on<br />the road.</>}
          </h1>
          <p className="text-muted-foreground text-[13px] mt-2">{driver?.name ?? "Driver"} · {van?.plate ?? "—"}</p>
        </div>

        {/* Status card */}
        <div className="rounded-2xl overflow-hidden border border-border mb-4 bg-card">
          <div className="bg-card px-5 pt-5 pb-4 flex items-center gap-4">
            <div className="h-[52px] w-[52px] rounded-full bg-muted border border-border flex items-center justify-center text-[18px] font-black text-foreground shrink-0">
              {driver?.initials ?? "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-foreground leading-tight">{driver?.name ?? "Driver"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {van?.model} · <span className="font-mono text-muted-foreground">{van?.plate}</span>
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${state.driverStatus === "offline"
              ? "border-border text-muted-foreground"
              : "border-ugreen/30 text-ugreen bg-ugreen/10"
              }`}>
              {state.driverStatus === "offline" ? "Offline" : state.driverStatus.replace("_", " ")}
            </div>
          </div>

          {/* New note strip */}
          {activeNote && activeNote.status === "sent" && (
            <button
              onClick={() => goTo("inbox")}
              className="w-full bg-ugreen/10 border-t border-ugreen/15 px-5 py-3 flex items-center gap-3 active:bg-ugreen/15"
              style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
            >
              <div className="w-7 h-7 rounded-full bg-ugreen flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-black text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-ugreen text-[12px] font-bold">You have a new delivery</p>
                <p className="text-ugreen/60 text-[11px]">{pendingStops} stops waiting for you</p>
              </div>
              <span className="material-symbols-outlined text-ugreen/60 text-[18px]">chevron_right</span>
            </button>
          )}

          <button
            onClick={() => goTo("home")}
            className="w-full bg-ugreen active:brightness-90 px-5 py-[18px] flex items-center justify-center gap-2"
            style={{ transition: `filter 200ms cubic-bezier(0, 0, 1, 1)` }}
          >
            <span className="material-symbols-outlined text-black text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {state.driverStatus === "offline" ? "power_settings_new" : "play_circle"}
            </span>
            <span className="text-black font-black text-[17px] tracking-wide">
              {state.driverStatus === "offline" ? "GO ONLINE" : "CONTINUE ROUTE"}
            </span>
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-2">
          {quickLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className="relative flex flex-col items-center gap-2 bg-card border border-border rounded-2xl py-4 active:bg-muted"
              style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
            >
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-ugreen rounded-full flex items-center justify-center text-[9px] font-black text-black">
                  {item.badge}
                </span>
              )}
              <span className="material-symbols-outlined text-foreground text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Today's summary */}
        {state.driverStatus !== "offline" && (
          <div className="mt-4 bg-card border border-border rounded-2xl p-5">
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3">Today</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Stops", value: `${activeNote?.stops.filter(s => s.status === "done").length ?? 0}/${activeNote?.stops.length ?? 0}` },
                { label: "Cash", value: `${state.cashCollected ?? 0} SAR` },
                { label: "Status", value: state.driverStatus.replace("_", " ") },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-[22px] font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Company Portal ────────────────────────────────────────────────────────────
function CompanyPortal() {
  const { state, goTo } = useApp()
  const inRouteCount = state.vans.filter((v) => v.status === "in_route").length
  const issueCount = state.vans.filter((v) => v.status === "issue").length

  return (
    <div className="h-dvh bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-12 pb-0 flex items-center justify-between gap-3 shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo("launcher", "back")}
            className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 active:bg-muted/80"
            style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
          >
            <span className="material-symbols-outlined text-foreground text-[20px]">arrow_back</span>
          </button>
          <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">Company</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8 bg-background" style={{ scrollbarWidth: "none" }}>
        {/* Heading + live pill */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-[32px] font-black tracking-tight leading-[1.08] text-foreground">
            Your fleet,<br />in real time.
          </h1>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold mt-1 ${inRouteCount > 0 ? "bg-ugreen/10 text-ugreen" : "bg-muted text-muted-foreground"
            }`}>
            {inRouteCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-ugreen animate-pulse" />}
            {inRouteCount > 0 ? `${inRouteCount} live` : "All idle"}
          </div>
        </div>

        {/* Live stats row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Vans", value: state.vans.length, accent: false },
            { label: "In route", value: inRouteCount, accent: true },
            { label: "Issues", value: issueCount, accent: issueCount > 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-foreground rounded-2xl px-4 py-4">
              <p className={`text-[26px] font-black leading-none ${stat.accent && stat.value > 0 ? (stat.label === "Issues" ? "text-red-400" : "text-ugreen") : "text-background"}`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-background/40 mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Fleet Board */}
        <button
          onClick={() => goTo("kanban")}
          className="w-full bg-foreground text-background rounded-2xl px-5 py-4 flex items-center gap-4 active:opacity-90 mb-2.5"
          style={{ transition: `opacity 200ms cubic-bezier(0, 0, 1, 1)` }}
        >
          <div className="w-11 h-11 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-background text-[22px]">view_kanban</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-black text-background">Fleet board</p>
            <p className="text-[12px] text-background/40">{state.vans.length} vans · {state.drivers.length} drivers</p>
          </div>
          {inRouteCount > 0 && (
            <span className="text-[10px] font-bold bg-ugreen/20 text-ugreen px-2.5 py-1 rounded-full">
              {inRouteCount} live
            </span>
          )}
          <span className="material-symbols-outlined text-background/30 text-[20px]">chevron_right</span>
        </button>

        {/* Create Delivery Note */}
        <button
          onClick={() => goTo("delivery-note")}
          className="w-full bg-ugreen text-black rounded-2xl px-5 py-4 flex items-center gap-4 active:brightness-90 mb-2.5"
          style={{ transition: `filter 200ms cubic-bezier(0, 0, 1, 1)` }}
        >
          <div className="w-11 h-11 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-black text-[22px]">description</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-black text-black">New delivery note</p>
            <p className="text-[12px] text-black/50">Build route · assign · send</p>
          </div>
          <span className="material-symbols-outlined text-black/30 text-[20px]">chevron_right</span>
        </button>

        {/* Register Driver + Add Van */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {([
            { id: "driver-registration", label: "Add driver", sub: `${state.drivers.length} active`, icon: "person_add" },
            { id: "register", label: "Add van", sub: `${state.vans.length} registered`, icon: "directions_car" },
          ] as { id: string; label: string; sub: string; icon: string }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className="bg-muted border border-border rounded-2xl p-4 flex items-center gap-3 active:bg-muted/80"
              style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
            >
              <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-foreground text-[20px]">{item.icon}</span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-foreground font-bold text-[13px] leading-tight">{item.label}</p>
                <p className="text-muted-foreground text-[10px]">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Section label */}
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-2.5">More tools</p>

        {/* Secondary tools grid */}
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "map", label: "Live map", icon: "map" },
            { id: "tracking", label: "Track", icon: "local_shipping" },
            { id: "dashboard", label: "Sales", icon: "bar_chart" },
            { id: "alerts", label: "Alerts", icon: "notifications", badge: issueCount },
            { id: "performance", label: "Drivers", icon: "groups" },
            { id: "maintenance", label: "Fleet", icon: "build" },
            { id: "inventory", label: "Inventory", icon: "inventory_2" },
            { id: "settings", label: "Settings", icon: "settings" },
          ] as { id: string; label: string; icon: string; badge?: number }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className="relative flex flex-col items-center gap-2 bg-muted border border-border rounded-2xl py-4 active:bg-muted/80"
              style={{ transition: `background-color 200ms cubic-bezier(0, 0, 1, 1)` }}
            >
              {(item.badge ?? 0) > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                  {item.badge}
                </span>
              )}
              <span className="material-symbols-outlined text-muted-foreground text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
