"use client"

import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { BottomSheet } from "@/components/bottom-sheet"
import { motion } from "framer-motion"
import { useLiveLocation } from "@/hooks/use-live-location"
import { VehicleMarker } from "@/components/vehicle-marker"
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  FullscreenControl,
} from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapControls } from "@/components/map/map-controls"
import { FeedbackAgent } from "@/components/map/feedback-agent"
import { useCallback, useRef, useEffect, useState, useMemo } from "react"
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

function formatEta(km: number, speedKmh: number) {
  if (speedKmh <= 0) speedKmh = 30
  const mins = Math.round((km / speedKmh) * 60)
  if (mins < 1) return "< 1 min"
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function RouteNavigation({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  const { state, activeNote, currentStop, activeVan } = useApp()
  const haptics = useHaptics()
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const stopNumber = state.currentStopIndex + 1
  const totalStops = activeNote?.stops.length ?? 0
  const customerName = currentStop?.customerName ?? "Next stop"
  const address = currentStop?.address ?? "Loading address…"
  const phone = currentStop?.phone ?? ""
  const expectedCash = currentStop?.expectedCash ?? 0

  // Live GPS Tracking
  const { location: driverLoc } = useLiveLocation(
    activeVan?.lat ?? currentStop?.lat ?? 24.7136,
    activeVan?.lng ?? currentStop?.lng ?? 46.6753
  )

  const mapRef = useRef<any>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null)
  const [fullRouteGeometry, setFullRouteGeometry] = useState<any>(null)
  const [altRouteGeoJSON, setAltRouteGeoJSON] = useState<any>(null)
  const [routeSteps, setRouteSteps] = useState<any[]>([])
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0)
  const [showArrivePrompt, setShowArrivePrompt] = useState(false)
  const [mapType, setMapType] = useState<"map" | "satellite">("map")
  const [speedCameras, setSpeedCameras] = useState<{ lat: number; lng: number; limit: number }[]>([])
  const [isOffRoute, setIsOffRoute] = useState(false)
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "done">("idle")
  const [voiceCommand, setVoiceCommand] = useState("")
  const [matchedLoc, setMatchedLoc] = useState(driverLoc)
  const traceRef = useRef<{ lng: number; lat: number; timestamp: number }[]>([])

  // Map Matching: Snap noisy/fuzzy GPS to roads
  useEffect(() => {
    // Record trace
    traceRef.current.push({ ...driverLoc, timestamp: Date.now() })
    if (traceRef.current.length > 50) traceRef.current.shift()

    // Periodically snap to road (every 3 seconds)
    const interval = setInterval(async () => {
      if (traceRef.current.length < 2) return

      const coords = traceRef.current.map(p => `${p.lng},${p.lat}`).join(";")
      const timestamps = traceRef.current.map(p => p.timestamp).join(";")

      try {
        const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${coords}?timestamps=${timestamps}&radiuses=${traceRef.current.map(() => 25).join(";")}&access_token=${MAPBOX_TOKEN}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.code === "Ok" && data.matchings?.[0]) {
          const lastPoint = data.matchings[0].geometry.coordinates.slice(-1)[0]
          setMatchedLoc(prev => ({ ...prev, lng: lastPoint[0], lat: lastPoint[1] }))
        } else {
          // Fallback to raw if match fails
          setMatchedLoc(driverLoc)
        }
      } catch {
        setMatchedLoc(driverLoc)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [driverLoc, MAPBOX_TOKEN])

  // Follow driver on map (using matched location)
  useEffect(() => {
    if (mapRef.current && !isInteracting) {
      mapRef.current.easeTo({
        center: [matchedLoc.lng, matchedLoc.lat],
        bearing: matchedLoc.heading,
        pitch: 70,
        zoom: 18,
        duration: 1000,
        easing: (t: number) => t
      })
    }
  }, [matchedLoc.lat, matchedLoc.lng, matchedLoc.heading, isInteracting])

  // Turf.js: Detect off-route (drift > 100m from planned line)
  useEffect(() => {
    if (!fullRouteGeometry) return

    try {
      const pt = turf.point([matchedLoc.lng, matchedLoc.lat])
      const distance = turf.pointToLineDistance(pt, fullRouteGeometry)

      setIsOffRoute(distance > 0.1) // 100 meters
    } catch {
      setIsOffRoute(false)
    }
  }, [matchedLoc, fullRouteGeometry])

  // Live calculations
  const stopLat = currentStop?.lat ?? 24.7136
  const stopLng = currentStop?.lng ?? 46.6753
  const distKm = haversineKm(driverLoc.lat, driverLoc.lng, stopLat, stopLng)
  const speedKmh = driverLoc.speed != null ? driverLoc.speed * 3.6 : 35
  const eta = formatEta(distKm, speedKmh > 0 ? speedKmh : 35)
  const distDisplay = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`

  // Geofencing: Detect arrival within 30 meters
  useEffect(() => {
    if (distKm < 0.03 && !showArrivePrompt) {
      setShowArrivePrompt(true)
      haptics.success()
    } else if (distKm >= 0.05 && showArrivePrompt) {
      setShowArrivePrompt(false)
    }
  }, [distKm, showArrivePrompt, haptics])

  // Force navigation style for Google Maps-like prominent POIs and street names
  const mapStyle = mapType === "satellite"
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/navigation-day-v1"

  // ── OSRM Route fetching ───────────────────────────────────────────────

  const stopCoords = useMemo(() => {
    if (!activeNote) return []
    return activeNote.stops.map((s, idx) => ({
      lng: s.lng ?? (46.6753 + Math.cos(idx) * 0.03),
      lat: s.lat ?? (24.7136 + Math.sin(idx) * 0.03),
    }))
  }, [activeNote])

  // We use a ref to track the last location we fetched a route for
  const lastFetchedRouteRef = useRef<{ lat: number, lng: number, stopIndex: number } | null>(null)

  useEffect(() => {
    if (stopCoords.length < 1) return
    const remainingStops = stopCoords.slice(state.currentStopIndex)
    if (remainingStops.length === 0) {
      setRouteGeoJSON(null)
      setAltRouteGeoJSON(null)
      setRouteSteps([])
      return
    }

    // Only refetch if stop index changed, or if we haven't fetched yet, or if we diverged > 200 meters.
    const last = lastFetchedRouteRef.current
    const traveledKm = last ? haversineKm(driverLoc.lat, driverLoc.lng, last.lat, last.lng) : 999

    if (last && last.stopIndex === state.currentStopIndex && traveledKm < 0.2) {
      return // No need to refetch
    }

    lastFetchedRouteRef.current = { lat: driverLoc.lat, lng: driverLoc.lng, stopIndex: state.currentStopIndex }

    const points = [
      `${driverLoc.lng},${driverLoc.lat}`,
      ...remainingStops.map(c => `${c.lng},${c.lat}`),
    ].join(";")

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${points}?overview=full&geometries=geojson&steps=true&alternatives=true&annotations=congestion&access_token=${MAPBOX_TOKEN}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          const primary = data.routes[0]
          setFullRouteGeometry(primary.geometry)

          // Generate congestion-colored segments
          const features: any[] = []
          const coords = primary.geometry.coordinates
          let coordIdx = 0

          for (const leg of primary.legs ?? []) {
            const congestions = leg.annotation?.congestion ?? []
            for (let i = 0; i < congestions.length; i++) {
              if (coordIdx + 1 < coords.length) {
                const level = congestions[i]
                let color = "#49d273" // Clear/unknown - Uber Green
                if (level === "moderate") color = "#ffb200" // Orange for moderate
                else if (level === "heavy" || level === "severe") color = "#e32414" // Red for heavy

                features.push({
                  type: "Feature",
                  properties: { color },
                  geometry: {
                    type: "LineString",
                    coordinates: [coords[coordIdx], coords[coordIdx + 1]]
                  }
                })
              }
              coordIdx++
            }
          }

          // Fallback if no congestion data
          if (features.length === 0) {
            features.push({
              type: "Feature",
              properties: { color: "#49d273" },
              geometry: primary.geometry
            })
          }

          setRouteGeoJSON({
            type: "FeatureCollection",
            features
          })

          setTotalDistanceKm(primary.distance / 1000)

          // Alternative route (light gray)
          if (data.routes[1]) {
            setAltRouteGeoJSON({
              type: "Feature",
              geometry: data.routes[1].geometry,
              properties: {},
            })
          }

          // Collect turn-by-turn steps
          const legs = primary.legs ?? []
          const steps: any[] = []
          for (const leg of legs) {
            for (const step of leg.steps ?? []) {
              steps.push({
                ...step,
                distance: step.distance,
                maneuver: step.maneuver,
                name: step.name
              })
            }
          }
          setRouteSteps(steps)

          // Generate speed cameras from route geometry points
          // Place them at regular intervals (every ~1.5km along route)
          const allCoords = primary.geometry.coordinates
          if (allCoords && allCoords.length > 10) {
            const cameras: { lat: number; lng: number; limit: number }[] = []
            const speedLimits = [60, 80, 100, 120, 80, 60, 100]
            let accumDist = 0
            for (let i = 1; i < allCoords.length; i++) {
              const dLat = allCoords[i][1] - allCoords[i - 1][1]
              const dLng = allCoords[i][0] - allCoords[i - 1][0]
              accumDist += Math.sqrt(dLat * dLat + dLng * dLng) * 111  // rough km
              if (accumDist > 1.2 + Math.random() * 0.8) {
                cameras.push({
                  lat: allCoords[i][1] + (Math.random() - 0.5) * 0.0003,
                  lng: allCoords[i][0] + (Math.random() - 0.5) * 0.0003,
                  limit: speedLimits[cameras.length % speedLimits.length],
                })
                accumDist = 0
                if (cameras.length >= 8) break  // cap at 8 cameras
              }
            }
            setSpeedCameras(cameras)
          }
        }
      })
      .catch(() => { /* OSRM may be unavailable */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCoords, state.currentStopIndex, driverLoc.lat, driverLoc.lng])

  // Get next turn instruction from route steps
  const nextTurn = useMemo(() => {
    if (!routeSteps.length) return { instruction: "Head towards destination", distance: "", meters: 0 }

    // Find the closest unfinished step (distance > 5m to avoid skipping turns too early)
    for (const step of routeSteps) {
      if (step.distance > 8) {
        const maneuver = step.maneuver
        const type = maneuver?.type ?? ""
        const modifier = maneuver?.modifier ?? ""
        let instruction = "Continue straight"
        if (type === "turn" && modifier.includes("right")) instruction = "Turn right"
        else if (type === "turn" && modifier.includes("left")) instruction = "Turn left"
        else if (type === "roundabout") instruction = "Enter roundabout"
        else if (type === "fork") instruction = `Take the ${modifier} fork`
        else if (type === "merge") instruction = "Merge"
        else if (type === "arrive") instruction = "You have arrived"
        else if (modifier) instruction = `${type} ${modifier}`.replace(/^\w/, c => c.toUpperCase())

        const stepDist = step.distance < 1000
          ? `${Math.round(step.distance)}m`
          : `${(step.distance / 1000).toFixed(1)} km`
        const name = step.name || ""
        return {
          instruction: `${instruction}${name ? ` onto ${name}` : ""}`,
          distance: stepDist,
          meters: Math.round(step.distance)
        }
      }
    }
    return { instruction: "Arriving at destination", distance: "Arriving", meters: 0 }
  }, [routeSteps])

  // ── 3D Buildings ──────────────────────────────────────────────────────
  const onMapLoad = useCallback((e: any) => {
    const map = e.target
    if (!map) return
    try {
      // Add 3D building extrusions
      const layers = map.getStyle()?.layers
      if (!layers) return
      const labelLayer = layers.find((l: any) => l.type === "symbol" && l.layout?.["text-field"])
      const src = map.getSource("composite") ? "composite" : map.getSource("openmaptiles") ? "openmaptiles" : null
      if (!src) return
      map.addLayer({
        id: "3d-buildings",
        source: src,
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#ebf0f7",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.8,
        },
      }, labelLayer?.id)

      // Force all POI labels to show regardless of collision
      const poiLayers = layers.filter((l: any) => l.id.includes("poi") && l.type === "symbol")
      poiLayers.forEach((l: any) => {
        map.setLayoutProperty(l.id, "text-allow-overlap", true)
        map.setLayoutProperty(l.id, "icon-allow-overlap", true)
        map.setLayoutProperty(l.id, "text-ignore-placement", true)
        map.setLayoutProperty(l.id, "icon-ignore-placement", true)
      })
    } catch { /* layer may not exist */ }
    setIsMapLoaded(true)
  }, [])

  const typeConfig = {
    deliver: { label: "Delivery", color: "text-foreground", bg: "bg-foreground/10", icon: "van" as const },
    pickup: { label: "Pickup", color: "text-[#06c167]", bg: "bg-[#06c167]/10", icon: "stop-pickup" as const },
    cash: { label: "Cash collect", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: "stop-cash" as const },
    return: { label: "Return", color: "text-orange-400", bg: "bg-orange-400/10", icon: "stop-return" as const },
    mixed: { label: "Mixed", color: "text-blue-400", bg: "bg-blue-400/10", icon: "route" as const },
  }[currentStop?.type ?? "deliver"]

  // Route layer styling - Uber Style (Black casing, Congestion-aware core)
  const routeCasingStyle: any = {
    id: "route-casing",
    type: "line",
    paint: {
      "line-color": "#000000",
      "line-width": 12,
      "line-opacity": 0.8,
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
  }
  const routeInnerStyle: any = {
    id: "route-inner",
    type: "line",
    paint: {
      "line-color": ["get", "color"], // Driven by GeoJSON properties for live traffic
      "line-width": 6,
      "line-opacity": 1,
    },
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
  }

  return (
    <div className="bg-background h-full w-full relative overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: driverLoc.lng,
            latitude: driverLoc.lat,
            zoom: 18,
            pitch: 70,
            bearing: driverLoc.heading,
          }}
          mapStyle={mapStyle}
          onLoad={onMapLoad}
          onDragStart={() => setIsInteracting(true)}
          onZoomStart={() => setIsInteracting(true)}
          antialias
        >
          <MapControls />
          <FeedbackAgent />
          {/* Google Maps-style controls */}
          <NavigationControl position="top-right" showCompass visualizePitch />
          <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />
          <GeolocateControl position="bottom-right" trackUserLocation showUserHeading />
          <FullscreenControl position="top-right" />

          {/* Speedometer Overlay (Google Maps Style) */}
          <div className="absolute left-4 bottom-[280px] z-20 pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-full w-16 h-16 border-2 border-[#06c167] flex flex-col items-center justify-center shadow-lg">
              <span className="text-[20px] font-black text-black leading-none">{Math.round(speedKmh)}</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase">km/h</span>
            </div>
          </div>

          {/* Map Style Toggle */}
          <div className="absolute right-4 top-[180px] z-20 flex flex-col gap-2">
            <button
              onClick={() => { haptics.light(); setMapType(prev => prev === "map" ? "satellite" : "map") }}
              className="w-11 h-11 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mapType === "map" ? "layers_clear" : "layers"}
              </span>
            </button>
            {isInteracting && (
              <button
                onClick={() => { haptics.medium(); setIsInteracting(false) }}
                className="w-11 h-11 bg-[#276ef1] rounded-xl shadow-lg flex items-center justify-center text-white active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
            )}
          </div>

          {/* Off Route Warning */}
          {isOffRoute && (
            <div className="absolute top-[280px] left-1/2 -translate-x-1/2 z-50">
              <div className="bg-red-600 border-2 border-white text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span className="text-[12px] font-black uppercase tracking-tight">Off route: Recalculating...</span>
              </div>
            </div>
          )}
          {/* Mapbox Live Traffic Integration */}
          {/* Route line */}
          {isMapLoaded && routeGeoJSON && (
            <Source type="geojson" data={routeGeoJSON}>
              <Layer {...routeCasingStyle} />
              <Layer {...routeInnerStyle} />
            </Source>
          )}

          {/* Speed cameras */}
          {speedCameras.map((cam, idx) => (
            <Marker key={`cam-${idx}`} longitude={cam.lng} latitude={cam.lat} anchor="center">
              <div className="flex flex-col items-center">
                <div className="relative w-8 h-8 rounded-lg bg-red-500/90 backdrop-blur flex items-center justify-center shadow-lg border border-red-400/50">
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    speed
                  </span>
                </div>
                <div className="mt-0.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow">
                  {cam.limit}
                </div>
              </div>
            </Marker>
          ))}

          {/* Stops — numbered pins */}
          {activeNote?.stops.map((s, idx) => {
            const sLat = s.lat ?? (24.7136 + (Math.sin(idx) * 0.03))
            const sLng = s.lng ?? (46.6753 + (Math.cos(idx) * 0.03))
            const done = s.status !== "pending"
            const isCurrent = idx === state.currentStopIndex
            return (
              <Marker key={s.id} longitude={sLng} latitude={sLat} anchor="bottom">
                <div className="flex flex-col items-center">
                  <div className={`absolute bottom-0 w-4 h-1.5 rounded-[50%] blur-[2px] ${isCurrent ? "bg-[#06c167]/50" : done ? "bg-[#06c167]/20" : "bg-white/15"
                    }`} />
                  <div className={`relative z-10 flex items-center justify-center font-black rounded-full shadow-xl transition-all ${isCurrent
                    ? "w-11 h-11 bg-[#06c167] text-black text-[14px] shadow-[0_0_20px_rgba(6,193,103,0.5)]"
                    : done
                      ? "w-7 h-7 bg-[#06c167] text-white text-[11px]"
                      : "w-7 h-7 bg-white/90 text-gray-800 text-[11px]"
                    }`}>
                    {done ? "✓" : idx + 1}
                  </div>
                  {isCurrent && <div className="w-0.5 h-2 bg-[#06c167] rounded-b" />}
                  {/* Stop label */}
                  {isCurrent && (
                    <div className="mt-1 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {s.customerName || `Stop ${idx + 1}`}
                    </div>
                  )}
                </div>
              </Marker>
            )
          })}

          {/* Driver Uber Navigation Puck */}
          <Marker
            longitude={matchedLoc.lng}
            latitude={matchedLoc.lat}
            anchor="center"
          >
            <div
              className="relative w-16 h-16 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${matchedLoc.heading}deg)` }}
            >
              <div className="absolute w-12 h-12 bg-black rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-white mb-1" />
              </div>
            </div>
          </Marker>
        </Map>
      </div>

      {/* Floating Controls (Speed Limit, Shield, Route, Recenter) */}
      <div className="absolute bottom-[130px] left-4 z-40 flex flex-col gap-3">
        {/* Speed Limit Sign */}
        <div className="w-11 h-12 bg-white rounded flex flex-col items-center justify-center border border-gray-300 shadow-lg">
          <span className="text-[10px] font-black text-black leading-none uppercase tracking-tighter">Speed</span>
          <span className="text-[10px] font-black text-black leading-none uppercase mb-0.5 tracking-tighter">Limit</span>
          <span className="text-[18px] font-black text-black leading-none tracking-tighter">35</span>
        </div>
        {/* Shield */}
        <button onClick={() => alert("Feature coming soon")} className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg">
          <span className="material-symbols-outlined text-blue-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
        </button>
      </div>

      <div className="absolute bottom-[130px] right-4 z-40 flex flex-col gap-3">
        {/* Route Overview */}
        <button onClick={() => alert("Feature coming soon")} className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg">
          <span className="material-symbols-outlined text-black text-[22px]">route</span>
        </button>
        {/* Recenter */}
        {isInteracting && (
          <button
            onClick={() => {
              haptics.light()
              setIsInteracting(false)
              if (mapRef.current) {
                mapRef.current.easeTo({
                  center: [driverLoc.lng, driverLoc.lat],
                  zoom: 18,
                  pitch: 70,
                  bearing: driverLoc.heading,
                  duration: 500,
                })
              }
            }}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-lg"
          >
            <span className="material-symbols-outlined text-[#276ef1] text-[22px]">my_location</span>
          </button>
        )}
      </div>

      {/* Floating Street Name Pill */}
      <div className="absolute bottom-[130px] left-1/2 -translate-x-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200 shadow-lg flex items-center justify-center">
          <span className="text-[12px] font-bold text-black">{address.split(',')[0]}</span>
        </div>
      </div>

      {/* UI overlay */}
      <div className="relative z-30 flex flex-col justify-between h-full pointer-events-none">

        {/* Top navigation HUD (Uber Style: massive dark banner) */}
        <div className="pointer-events-auto">
          <div className="bg-[#0b0b0b] rounded-b-[32px] overflow-hidden shadow-2xl pt-14 pb-5 px-6">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {nextTurn.instruction.toLowerCase().includes("right") ? "turn_right" :
                    nextTurn.instruction.toLowerCase().includes("left") ? "turn_left" :
                      nextTurn.instruction.toLowerCase().includes("roundabout") ? "roundabout_right" :
                        nextTurn.instruction.toLowerCase().includes("arrive") ? "flag" :
                          "straight"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-[28px] font-black text-white leading-none">
                    {nextTurn.distance}
                  </p>
                </div>
                <p className="text-[22px] font-bold text-white/80 leading-tight truncate mt-1">
                  {nextTurn.instruction}
                </p>
              </div>
              <button
                onClick={() => { haptics.light(); onBack() }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-white text-[20px]">close</span>
              </button>
            </div>
            {/* Street pill below instruction if mapped */}
            <div className="mt-3 flex gap-2">
              <div className="bg-white/10 px-3 py-1 rounded border border-white/20">
                <span className="text-white text-[11px] font-bold">{nextTurn.instruction.split(' onto ')[1] || address.split(',')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom card */}
        <div className="pointer-events-auto">
          <BottomSheet className="bg-white text-black pb-8 pt-2" snapPoints={[0, 250]}>

            {/* Arrived Geofence Alert */}
            {showArrivePrompt && (
              <div className="px-6 pb-4 animate-in slide-in-from-bottom duration-500">
                <div className="bg-[#06c167] rounded-2xl p-4 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div>
                      <p className="text-white text-[16px] font-black leading-tight">You have arrived</p>
                      <p className="text-white/80 text-[11px] font-medium">Auto-detected stop location</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { haptics.heavy(); onNext?.() }}
                    className="bg-white text-[#06c167] px-5 py-2 rounded-xl font-black text-[14px] active:scale-95 transition-all shadow-sm"
                  >
                    GO
                  </button>
                </div>
              </div>
            )}

            {/* ETA + stop badge */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[24px] font-black leading-tight">{eta}</span>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">ETA</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-100 mx-1" />
                <div className="flex flex-col">
                  <span className="text-[24px] font-black text-gray-800 leading-tight">{distDisplay}</span>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">Left</span>
                </div>
                <div className="w-[1px] h-8 bg-gray-100 mx-1" />
                <div className="flex flex-col">
                  <span className="text-[18px] font-black text-[#06c167] leading-tight">{totalDistanceKm.toFixed(1)} km</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</span>
                </div>
              </div>
              <button onClick={() => alert("Feature coming soon")} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-black text-[20px]">list</span>
              </button>
            </div>

            {/* Customer + contact + Share ETA */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[16px] text-gray-500">Picking up {customerName}</p>
                <button
                  onClick={async () => {
                    haptics.medium()
                    const text = `Your delivery from FleetVan arrives in ~${eta}.\n📍 ${address}\n\nTrack live: https://fleetvan.app/track/${activeNote?.id ?? "demo"}`
                    if (navigator.share) {
                      try { await navigator.share({ title: "Delivery ETA", text }) } catch { }
                    } else {
                      navigator.clipboard.writeText(text)
                    }
                  }}
                  className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-blue-500 text-[14px]">share</span>
                  <span className="text-[11px] font-bold text-blue-500">Share ETA</span>
                </button>
              </div>

              {/* Next Up Teaser */}
              {state.currentStopIndex + 1 < (activeNote?.stops.length || 0) && (
                <div className="mt-4 mb-4 bg-muted border border-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Next Up</p>
                    <p className="text-[14px] font-black text-foreground truncate max-w-[200px]">
                      {activeNote?.stops[state.currentStopIndex + 1].customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Illicon name="destination" size={14} color="text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">Stop {state.currentStopIndex + 2}</span>
                  </div>
                </div>
              )}

              {/* Cash reminder */}
              {expectedCash > 0 && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                    <Illicon name="cash" size={20} filled color="text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-yellow-400/70 uppercase tracking-wide">Collect cash</p>
                    <p className="text-[20px] font-black text-yellow-500">SAR {expectedCash.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              {currentStop && currentStop.items.length > 0 && (
                <div className="bg-muted border border-border rounded-xl p-3 mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {currentStop.type === "pickup" ? "Collect" : "Deliver"} ({currentStop.items.length} items)
                  </p>
                  {currentStop.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span className="text-[12px] text-foreground truncate pr-2">{item.name}</span>
                      <span className="text-[12px] text-muted-foreground shrink-0 font-medium">{item.qty} {item.unit}</span>
                    </div>
                  ))}
                  {currentStop.items.length > 2 && (
                    <p className="text-[11px] text-muted-foreground mt-1">+{currentStop.items.length - 2} more</p>
                  )}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => { haptics.medium(); onNext?.() }}
                className="w-full bg-black text-white font-black text-[17px] h-[58px] rounded-xl flex items-center justify-center tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
              >
                {"I'M HERE"}
              </motion.button>
            </div>
          </BottomSheet>
        </div>
      </div>

      {/* ── Voice Commands FAB ── */}
      {voiceState === "idle" && (
        <button
          onClick={() => { haptics.heavy(); setVoiceState("listening") }}
          className="absolute bottom-40 right-5 z-40 w-14 h-14 rounded-full bg-black shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex items-center justify-center active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
      )}

      {/* ── Voice Overlay ── */}
      {voiceState !== "idle" && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
          <button
            onClick={() => { setVoiceState("idle"); setVoiceCommand("") }}
            className="absolute top-14 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white text-[22px]">close</span>
          </button>

          {voiceState === "listening" && (
            <>
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                <div className="absolute inset-4 bg-white/15 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
              </div>
              <p className="text-white text-[22px] font-black mb-2">Listening...</p>
              <p className="text-white/50 text-[13px] mb-8">Say a command</p>
              <div className="grid grid-cols-2 gap-3 px-8 w-full">
                {[
                  { cmd: "I've arrived", icon: "location_on" },
                  { cmd: "Call customer", icon: "phone" },
                  { cmd: "Report issue", icon: "warning" },
                  { cmd: "Next stop", icon: "skip_next" },
                ].map((v) => (
                  <button
                    key={v.cmd}
                    onClick={() => {
                      haptics.medium()
                      setVoiceCommand(v.cmd)
                      setVoiceState("processing")
                      setTimeout(() => setVoiceState("done"), 1200)
                    }}
                    className="bg-white/10 border border-white/10 rounded-xl p-3 flex items-center gap-2 active:bg-white/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-white/70 text-[18px]">{v.icon}</span>
                    <span className="text-white text-[12px] font-bold">{v.cmd}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {voiceState === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-white text-[36px] animate-spin">sync</span>
              </div>
              <p className="text-white text-[18px] font-black">"{voiceCommand}"</p>
              <p className="text-white/40 text-[13px]">Processing...</p>
            </div>
          )}

          {voiceState === "done" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-ugreen/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-ugreen text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <p className="text-white text-[20px] font-black">Done!</p>
              <p className="text-white/50 text-[13px]">"{voiceCommand}" executed</p>
              <button
                onClick={() => { setVoiceState("idle"); setVoiceCommand("") }}
                className="mt-4 bg-white text-black px-8 py-3 rounded-full font-black text-[15px]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
