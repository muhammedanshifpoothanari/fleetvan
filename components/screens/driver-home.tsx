"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Map, Marker } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/hooks/use-audio"
import { useLiveLocation } from "@/hooks/use-live-location"
import { VehicleMarker } from "@/components/vehicle-marker"
import { Source, Layer } from "react-map-gl/mapbox"
import * as turf from "@turf/turf"

// ── Helpers ─────────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function DriverHome({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { state, dispatch, goTo, activeNote, activeDriver, activeVan } = useApp()
  const haptics = useHaptics()
  const { playClick } = useAudio()
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Live GPS Tracking
  const { location: driverLoc } = useLiveLocation(
    activeVan?.lat ?? 24.7136,
    activeVan?.lng ?? 46.6753
  )

  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null)

  const pendingStops = activeNote?.stops.filter((s) => s.status === "pending").length ?? 0
  const hasNewNote = activeNote && activeNote.status === "sent"
  const isOnline = state.driverStatus !== "offline"

  // Fetch Route Line (Uber Style)
  useEffect(() => {
    if (!activeNote || activeNote.stops.length === 0) return

    const remainingStops = activeNote.stops.slice(state.currentStopIndex)
    if (remainingStops.length === 0) return

    const points = [
      `${driverLoc.lng},${driverLoc.lat}`,
      ...remainingStops.map(s => `${s.lng},${s.lat}`)
    ].join(";")

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${points}?overview=full&geometries=geojson&access_token=${MAPBOX_TOKEN}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          setRouteGeoJSON({
            type: "Feature",
            geometry: data.routes[0].geometry,
            properties: {}
          })
        }
      })
      .catch(() => { })
  }, [activeNote, state.currentStopIndex, driverLoc.lat, driverLoc.lng, MAPBOX_TOKEN])

  // Dynamic map center
  const mapCenter = useMemo(() => {
    return {
      lat: driverLoc.lat,
      lng: driverLoc.lng,
    }
  }, [driverLoc])

  // Dynamic weekly earnings
  const weeklyEarnings = useMemo(() => {
    const total = state.deliveryNotes
      .filter((n) => n.status === "completed")
      .reduce((sum, note) => {
        return sum + note.stops.reduce((s, stop) => {
          return s + (stop.collectedCash ?? 0) + stop.items.reduce((a, i) => a + (i.delivered ?? 0) * i.price, 0)
        }, 0)
      }, 0)
    return total > 0 ? `SAR ${total.toLocaleString()}` : "SAR 0"
  }, [state.deliveryNotes])

  // 3D Buildings Loader
  const onMapLoad = useCallback((e: any) => {
    const map = e.target
    if (!map) return
    try {
      const layers = map.getStyle()?.layers
      if (!layers) return
      const labelLayerId = layers.find((l: any) => l.type === "symbol" && l.layout?.["text-field"])?.id

      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14, 0, 15.05, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.6,
        },
      }, labelLayerId)

      map.setFog({
        "range": [0.5, 10],
        "color": "#1a1a2e",
        "horizon-blend": 0.1,
        "high-color": "#0d0d0d",
        "space-color": "#000",
        "star-intensity": 0.2
      })
    } catch { }
  }, [])

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-black">
      {/* Live Mapbox Map — full bleed background */}
      <div className="absolute inset-0 z-0">
        {MAPBOX_TOKEN ? (
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              longitude: mapCenter.lng,
              latitude: mapCenter.lat,
              zoom: 17,
              pitch: 65,
              bearing: driverLoc.heading,
            }}
            mapStyle="mapbox://styles/mapbox/navigation-night-v1"
            style={{ width: "100%", height: "100%" }}
            onLoad={onMapLoad}
            antialias
            attributionControl={false}
          >
            {/* Nav Line (Uber Style) */}
            {routeGeoJSON && (
              <Source type="geojson" data={routeGeoJSON}>
                <Layer
                  id="nav-casing"
                  type="line"
                  paint={{
                    "line-color": "#000",
                    "line-width": 10,
                    "line-opacity": 0.8
                  }}
                  layout={{ "line-join": "round", "line-cap": "round" }}
                />
                <Layer
                  id="nav-line"
                  type="line"
                  paint={{
                    "line-color": "#276ef1",
                    "line-width": 4,
                  }}
                  layout={{ "line-join": "round", "line-cap": "round" }}
                />
              </Source>
            )}

            {/* Pin each active stop on the map */}
            {activeNote?.stops.map((stop, idx) =>
              stop.lat && stop.lng ? (
                <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat} anchor="bottom">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md text-[11px] font-black text-white transition-all ${idx === state.currentStopIndex ? "scale-125 bg-[#06c167]" : "bg-[#444]"}`}
                      style={{ background: stop.status === "pending" ? (idx === state.currentStopIndex ? "#06c167" : "#06c16799") : "#444" }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                </Marker>
              ) : null
            )}

            {/* Toyota HiAce Vehicle Marker */}
            <Marker longitude={driverLoc.lng} latitude={driverLoc.lat} anchor="center">
              <VehicleMarker
                heading={driverLoc.heading}
                label={activeVan?.plate}
                size={38}
              />
            </Marker>
          </Map>
        ) : (
          /* Fallback if no token */
          <div className="w-full h-full bg-gradient-to-b from-[#1a1a2e] to-[#0d0d0d]" />
        )}

        {/* Dark overlay so UI is readable over the map */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none" />




      </div>



      {/* Offline-First Banner */}
      {!state.isSynced && (
        <div className="absolute top-28 left-4 right-4 z-30">
          <div className="bg-yellow-500/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="material-symbols-outlined text-black text-[20px] animate-spin">sync</span>
            <div className="flex-1">
              <p className="text-black text-[12px] font-black">Offline — 3 actions queued</p>
              <p className="text-black/60 text-[10px]">Will sync when connection returns</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-black/30 animate-pulse" />
          </div>
        </div>
      )}

      <div className="relative z-20 w-full pt-12 px-4 flex justify-between items-start">
        <div className="w-11" /> {/* Layout balancer */}

        <div className="flex flex-col gap-2 items-center">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full py-2 px-4 flex flex-col items-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">This week</span>
            <span className="text-[15px] font-black text-foreground leading-none">{weeklyEarnings}</span>
          </div>

          {/* Mars Tokens Badge */}
          <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 backdrop-blur-md transition-all ${state.ludicrousMode ? "bg-cyan-500/20 border-cyan-500/40" : "bg-black/40 border-white/10"}`}>
            <span className="text-[14px]">🪐</span>
            <span className={`text-[12px] font-black ${state.ludicrousMode ? "text-cyan-400" : "text-white"}`}>{state.marsTokens}</span>
          </div>
        </div>

        <button
          onClick={() => { haptics.tick(); playClick() }}
          className="uber-press h-11 w-11 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center"
        >
          <Illicon name="my-location" size={22} color="text-foreground" />
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* New delivery pill */}
        {hasNewNote && (
          <div className="px-4 pb-3 flex justify-center">
            <button
              onClick={() => { haptics.medium(); goTo("inbox") }}
              className="uber-press bg-ugreen text-black px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(6,193,103,0.4)] flex items-center gap-2"
            >
              <Illicon name="inbox" size={18} filled color="text-black" />
              <span className="font-black text-[13px]">New delivery — {pendingStops} stops</span>
            </button>
          </div>
        )}

        <div className="bg-background border-t border-border pt-4 pb-2 px-5 flex flex-col gap-5">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto -mt-1" />

          {/* Driver row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-black text-foreground tracking-tight leading-tight">
                  {activeDriver?.name ?? "Driver"}
                </h2>
                {/* Streak flame badge */}
                <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  <span className="text-[14px] animate-pulse">🔥</span>
                  <span className="text-[11px] font-black text-orange-500">12</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] text-muted-foreground">{activeVan?.model}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-[11px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {activeVan?.plate}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${isOnline
              ? "bg-ugreen/10 border-ugreen/30 text-ugreen"
              : "bg-muted border-border text-muted-foreground"
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-ugreen animate-pulse" : "bg-muted-foreground"}`} />
              {isOnline ? state.driverStatus.replace("_", " ") : "Offline"}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-border">
            {[
              { label: "Rating", value: `${activeDriver?.rating ?? "4.9"}★` },
              { label: "Acceptance", value: `${activeDriver?.acceptance ?? 98}%` },
              { label: "Trips", value: (activeDriver?.trips ?? 847).toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                <span className="text-[17px] font-black text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Go Online CTA */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              haptics.heavy()
              playClick()
              dispatch({ type: "SET_DRIVER_STATUS", status: "online" })
              onNext?.()
            }}
            className={`w-full h-[58px] rounded-xl flex items-center justify-center gap-3 font-black text-[18px] tracking-wide ${isOnline
              ? "bg-ugreen text-black shadow-[0_4px_24px_rgba(6,193,103,0.35)]"
              : "bg-white text-black"
              }`}
          >
            <Illicon name="go-online" size={24} filled color="text-black" />
            {isOnline ? "CONTINUE SHIFT" : "GO ONLINE"}
          </motion.button>

          {/* Bottom nav */}
          <div className="flex justify-between items-center pb-4 pt-1">
            {([
              { id: "home", label: "Home", icon: "destination" as const, active: true },
              { id: "earnings", label: "Earnings", icon: "earnings" as const, active: false },
              { id: "inbox", label: "Inbox", icon: "inbox" as const, active: false, badge: pendingStops > 0 },
              { id: "profile", label: "Account", icon: "driver" as const, active: false },
            ] as { id: string; label: string; icon: any; active: boolean; badge?: boolean }[]).map((item) => (
              <button
                key={item.id}
                onClick={() => { haptics.tick(); goTo(item.id) }}
                className="relative flex flex-col items-center gap-1 uber-press"
              >
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ugreen rounded-full border border-background" />
                )}
                <Illicon
                  name={item.icon}
                  size={26}
                  filled={item.active}
                  color={item.active ? "text-foreground" : "text-muted-foreground"}
                />
                <span className={`text-[10px] ${item.active ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
