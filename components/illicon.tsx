"use client"

/**
 * Illicon — Uber-style transportation iconography system
 *
 * Rooted in transportation iconography. Bold, communicative, hard-working.
 * Designed for clarity at scale. Avoids decorative or childish styling.
 *
 * Usage:
 *   <Illicon name="van" size={24} filled />
 *   <Illicon name="stop-done" size={20} color="text-ugreen" />
 *
 * Icon names map directly to FLEETVAN operational contexts so they stay
 * semantically meaningful at every touchpoint.
 */

import type { CSSProperties } from "react"

export type IlliconName =
  // ── Navigation & Transport ──────────────────────────────────
  | "van"
  | "van-loading"
  | "van-depart"
  | "route"
  | "route-active"
  | "turn-right"
  | "turn-left"
  | "my-location"
  | "destination"
  | "warehouse"
  // ── Stop states ─────────────────────────────────────────────
  | "stop-pending"
  | "stop-done"
  | "stop-issue"
  | "stop-partial"
  | "stop-skipped"
  | "stop-cash"
  | "stop-pickup"
  | "stop-return"
  // ── Actions ──────────────────────────────────────────────────
  | "go-online"
  | "go-offline"
  | "check"
  | "check-circle"
  | "scan"
  | "report"
  | "call"
  | "chat"
  // ── Items & Cargo ────────────────────────────────────────────
  | "package"
  | "package-done"
  | "perishable"
  | "fragile"
  | "cash"
  | "receipt"
  // ── Vehicle ──────────────────────────────────────────────────
  | "tyre"
  | "engine"
  | "fuel"
  | "odometer"
  // ── Admin / Fleet ────────────────────────────────────────────
  | "fleet"
  | "driver"
  | "dispatch"
  | "alert"
  | "alert-critical"
  | "performance"
  | "earnings"
  | "inbox"
  | "settings"
  // ── Misc ────────────────────────────────────────────────────
  | "back"
  | "close"
  | "info"
  | "help"
  | "search"
  | "more"
  | "star"
  | "shield"
  | "sync"
  | "arrow-right"

/** Material Symbols glyph map — transportation-first naming */
const GLYPH: Record<IlliconName, string> = {
  // Transport
  "van": "local_shipping",
  "van-loading": "inventory",
  "van-depart": "logout",
  "route": "route",
  "route-active": "navigation",
  "turn-right": "turn_right",
  "turn-left": "turn_left",
  "my-location": "my_location",
  "destination": "location_on",
  "warehouse": "warehouse",
  // Stop states
  "stop-pending": "radio_button_unchecked",
  "stop-done": "check_circle",
  "stop-issue": "report_problem",
  "stop-partial": "unpublished",
  "stop-skipped": "block",
  "stop-cash": "payments",
  "stop-pickup": "inventory_2",
  "stop-return": "assignment_return",
  // Actions
  "go-online": "power_settings_new",
  "go-offline": "power_off",
  "check": "check",
  "check-circle": "check_circle",
  "scan": "qr_code_scanner",
  "report": "flag",
  "call": "call",
  "chat": "chat_bubble",
  // Items
  "package": "package_2",
  "package-done": "inventory_2",
  "perishable": "kitchen",
  "fragile": "front_hand",
  "cash": "payments",
  "receipt": "receipt_long",
  // Vehicle
  "tyre": "tire_repair",
  "engine": "settings",
  "fuel": "local_gas_station",
  "odometer": "speed",
  // Admin
  "fleet": "directions_car",
  "driver": "person",
  "dispatch": "send",
  "alert": "notifications",
  "alert-critical": "notification_important",
  "performance": "bar_chart",
  "earnings": "account_balance_wallet",
  "inbox": "inbox",
  "settings": "tune",
  // Misc
  "back": "arrow_back",
  "close": "close",
  "info": "info",
  "help": "help",
  "search": "search",
  "more": "more_vert",
  "star": "star",
  "shield": "gpp_good",
  "sync": "sync",
  "arrow-right": "arrow_forward",
}

interface IlliconProps {
  name: IlliconName
  size?: number
  filled?: boolean
  color?: string
  className?: string
  style?: CSSProperties
}

/**
 * Illicon renders a single transportation-inspired icon.
 * Uses Material Symbols with Uber's FILL axis to switch between
 * outlined (default, lighter weight) and filled (active, emphasis) states.
 */
export function Illicon({
  name,
  size = 24,
  filled = false,
  color,
  className = "",
  style,
}: IlliconProps) {
  const glyph = GLYPH[name]
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${color ?? ""} ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
        lineHeight: 1,
        ...style,
      }}
      aria-hidden="true"
    >
      {glyph}
    </span>
  )
}

/** Illicon wrapped in a circular badge — used for stop pins and status dots */
export function IlliconBadge({
  name,
  size = 20,
  filled = false,
  bgClass = "bg-u400",
  iconColor = "text-white",
  badgeSize = 40,
}: {
  name: IlliconName
  size?: number
  filled?: boolean
  bgClass?: string
  iconColor?: string
  badgeSize?: number
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 ${bgClass}`}
      style={{ width: badgeSize, height: badgeSize }}
    >
      <Illicon name={name} size={size} filled={filled} color={iconColor} />
    </div>
  )
}
