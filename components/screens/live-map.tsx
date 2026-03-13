"use client"

import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { VehicleMarker } from "@/components/vehicle-marker"
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  FullscreenControl,
  Source,
  Layer,
} from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapControls } from "@/components/map/map-controls"
import { MapStyles } from "@/components/map/map-styles"
import { useCallback, useState, useEffect, useRef } from "react"

export default function LiveMap({ onBack }: { onBack: () => void }) {
  const { goTo, state } = useApp()
  const haptics = useHaptics()
  const inRouteVans = state.vans.filter((v) => v.status === "in_route")
  const issueVans = state.vans.filter((v) => v.status === "issue")
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const [mapType, setMapType] = useState<"map" | "satellite">("map")
  const mapStyle = mapType === "satellite"
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/navigation-day-v1"

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

      // Force Mapbox Navigation style to show all POI labels (shop names) without them fading out
      const poiLayers = layers.filter((l: any) => l.id.includes("poi") && l.type === "symbol")
      poiLayers.forEach((l: any) => {
        map.setLayoutProperty(l.id, "text-allow-overlap", true)
        map.setLayoutProperty(l.id, "icon-allow-overlap", true)
        map.setLayoutProperty(l.id, "text-ignore-placement", true)
        map.setLayoutProperty(l.id, "icon-ignore-placement", true)
      })
    } catch { /* layer may not exist */ }
  }, [])

  // Simulation and Isochrones
  const [simVans, setSimVans] = useState<Record<string, { lat: number; lng: number; heading: number }>>({})
  const [selectedVanId, setSelectedVanId] = useState<string | null>(null)
  const [isochroneData, setIsochroneData] = useState<any>(null)
  const [showIsochrones, setShowIsochrones] = useState(false)
  const [matrixPoint, setMatrixPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [matrixEtas, setMatrixEtas] = useState<Record<string, number>>({})
  const [isMatrixLoading, setIsMatrixLoading] = useState(false)
  const headingsRef = useRef<Record<string, number>>({})
  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Initialize simulation positions from state
    const initial: Record<string, { lat: number; lng: number; heading: number }> = {}
    state.vans.forEach(v => {
      if (v.lat && v.lng) {
        headingsRef.current[v.id] = headingsRef.current[v.id] ?? Math.random() * 360
        initial[v.id] = { lat: v.lat, lng: v.lng, heading: headingsRef.current[v.id] }
      }
    })
    setSimVans(initial)

    // Animate only in-route vans
    const interval = setInterval(() => {
      setSimVans(prev => {
        const next = { ...prev }
        state.vans.forEach(v => {
          if (v.status !== "in_route" || !prev[v.id]) return
          const h = headingsRef.current[v.id] + (Math.random() - 0.5) * 20
          headingsRef.current[v.id] = h
          const rad = (h * Math.PI) / 180
          const speed = 0.00008 + Math.random() * 0.00012
          next[v.id] = {
            lat: prev[v.id].lat + Math.cos(rad) * speed,
            lng: prev[v.id].lng + Math.sin(rad) * speed,
            heading: h,
          }
        })
        return next
      })
    }, 2500)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.vans])

  // Fetch Isochrones when van is selected and reachability is toggled
  useEffect(() => {
    if (!selectedVanId || !showIsochrones) {
      setIsochroneData(null)
      return
    }

    const van = state.vans.find(v => v.id === selectedVanId)
    const pos = simVans[selectedVanId]
    if (!pos) return

    const minutes = [5, 10, 15]
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${pos.lng},${pos.lat}?contours_minutes=${minutes.join(",")}&polygons=true&access_token=${MAPBOX_TOKEN}`

    fetch(url)
      .then(r => r.json())
      .then(data => setIsochroneData(data))
      .catch(() => setIsochroneData(null))
  }, [selectedVanId, showIsochrones, simVans, MAPBOX_TOKEN])

  // Fetch Matrix ETAs when a point is clicked
  useEffect(() => {
    if (!matrixPoint || state.vans.length === 0) return
    setIsMatrixLoading(true)

    // Sources: all vans. Destination: the clicked point.
    const sources = state.vans.map(v => {
      const pos = simVans[v.id] || { lat: 24.7136, lng: 46.6753 }
      return `${pos.lng},${pos.lat}`
    }).join(";")

    const url = `https://api.mapbox.com/matrix/v1/mapbox/driving/${sources};${matrixPoint.lng},${matrixPoint.lat}?sources=all&destinations=${state.vans.length}&annotations=duration&access_token=${MAPBOX_TOKEN}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.code === "Ok" && data.durations) {
          const newEtas: Record<string, number> = {}
          data.durations.forEach((d: number[], idx: number) => {
            if (idx < state.vans.length) {
              newEtas[state.vans[idx].id] = Math.round(d[0] / 60) // Durations to the last point (dest)
            }
          })
          setMatrixEtas(newEtas)
        }
      })
      .finally(() => setIsMatrixLoading(false))
  }, [matrixPoint, state.vans, simVans, MAPBOX_TOKEN])

  const selectedVanRaw = state.vans.find(v => v.id === selectedVanId) ?? state.vans[0]
  const selectedDriver = state.drivers.find(d => d.id === selectedVanRaw?.driverId)
  const selectedVan = { ...selectedVanRaw, driverName: selectedDriver?.name || "Driver" }

  return (
    <div className="bg-background text-foreground h-full flex flex-col relative overflow-hidden">

      {/* Search overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-2 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => { haptics.light(); onBack() }}
            className="uber-press h-12 w-12 flex items-center justify-center rounded-2xl bg-card border border-border shrink-0"
          >
            <Illicon name="back" size={22} color="text-foreground" />
          </button>
          <div className="flex-1 relative h-12">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Illicon name="search" size={22} color="text-muted-foreground" />
            </div>
            <input
              className="block w-full h-full pl-10 pr-3 rounded-2xl bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 text-[13px]"
              placeholder="Search vehicle, driver or plate..."
            />
          </div>
          <button onClick={() => alert("Feature coming soon")} className="uber-press h-12 w-12 flex items-center justify-center rounded-2xl bg-card border border-border shrink-0">
            <Illicon name="settings" size={22} color="text-foreground" />
          </button>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: `Active (${inRouteVans.length})`, dot: "bg-[#06c167]", active: true },
            { label: `Idle (${state.vans.filter(v => v.status === "pending").length})`, dot: "bg-yellow-400", active: false },
            { label: `Issues (${issueVans.length})`, dot: "bg-red-500", active: issueVans.length > 0 },
          ].map((f) => (
            <button onClick={() => alert("Feature coming soon")}
              key={f.label}
              className={`uber-press flex items-center gap-2 px-3 py-1.5 rounded-full border whitespace-nowrap ${f.active
                ? "bg-card border-border text-foreground"
                : "bg-card/60 border-border/50 text-muted-foreground"
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${f.dot} ${f.active ? "opacity-100" : "opacity-40"}`} />
              <span className="text-[11px] font-bold">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map type toggle & Map Controls */}
      <MapStyles />

      {/* Map area */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 46.6753,
            latitude: 24.7136,
            zoom: 12,
            pitch: 45
          }}
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          antialias
          onLoad={onMapLoad}
          onClick={(e) => {
            if (e.originalEvent.detail >= 2) { // Double click to clear
              setMatrixPoint(null)
              return
            }
            setMatrixPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng })
            haptics.light()
          }}
        >  {/* Google Maps-style controls */}
          <MapControls />
          <NavigationControl position="top-right" showCompass visualizePitch />
          <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
          <GeolocateControl position="bottom-right" trackUserLocation showUserHeading />
          <FullscreenControl position="top-right" />

          {/* New Delivery/Pickup Potential Spot */}
          {matrixPoint && (
            <Marker longitude={matrixPoint.lng} latitude={matrixPoint.lat} anchor="bottom" onClick={() => setMatrixPoint(null)}>
              <div className="flex flex-col items-center animate-bounce">
                <div className="w-10 h-10 bg-[#276ef1] rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="material-symbols-outlined text-white text-[20px]">add_location</span>
                </div>
                <div className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg mt-1 whitespace-nowrap">
                  {isMatrixLoading ? "Calculating ETAs..." : "New Stop Search"}
                </div>
              </div>
            </Marker>
          )}

          {/* Matrix ETA Badges over Vans */}
          {matrixPoint && state.vans.map(van => {
            const pos = simVans[van.id]
            const eta = matrixEtas[van.id]
            if (!pos || eta === undefined) return null
            return (
              <Marker key={`eta-${van.id}`} longitude={pos.lng} latitude={pos.lat} anchor="top" style={{ pointerEvents: "none" }}>
                <div className="mt-8 bg-[#276ef1] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white animate-in zoom-in-50">
                  {eta} MIN
                </div>
              </Marker>
            )
          })}

          {/* Isochrone Reachability Polygons */}
          {showIsochrones && isochroneData && (
            <Source id="isochrone" type="geojson" data={isochroneData}>
              <Layer
                id="isochrone-fill"
                type="fill"
                paint={{
                  "fill-color": [
                    "match",
                    ["get", "contour"],
                    5, "#06c167",
                    10, "#facc15",
                    15, "#f97316",
                    "#06c167"
                  ],
                  "fill-opacity": 0.15
                }}
              />
              <Layer
                id="isochrone-outline"
                type="line"
                paint={{
                  "line-color": [
                    "match",
                    ["get", "contour"],
                    5, "#06c167",
                    10, "#facc15",
                    15, "#f97316",
                    "#06c167"
                  ],
                  "line-width": 2,
                  "line-dasharray": [2, 1]
                }}
              />
            </Source>
          )}
          {state.vans.map(van => {
            const pos = simVans[van.id]
            if (!pos) return null;
            const isIssue = van.status === "issue";
            const isActive = van.status === "in_route";
            return (
              <Marker
                key={van.id}
                longitude={pos.lng}
                latitude={pos.lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelectedVanId(van.id)
                  haptics.light()
                }}
              >
                <div className={`transition-transform duration-300 ${selectedVanId === van.id ? "scale-125" : "scale-100"}`}>
                  <VehicleMarker
                    heading={pos.heading}
                    color={isActive ? "#06c167" : isIssue ? "#ef4444" : "#facc15"}
                    size={isActive ? 38 : 30}
                    label={van.plate}
                    isActive={isActive}
                    isIssue={isIssue}
                  />
                </div>
              </Marker>
            )
          })}
        </Map>

        {/* Map controls */}
        <div className="absolute right-4 top-44 flex flex-col gap-2 z-20">
          {[
            { name: "performance" as const },
            { name: "my-location" as const },
          ].map((btn) => (
            <button onClick={() => alert("Feature coming soon")} key={btn.name} className="uber-press w-11 h-11 bg-card/90 backdrop-blur border border-border shadow-lg rounded-xl flex items-center justify-center text-muted-foreground">
              <Illicon name={btn.name} size={22} color="text-muted-foreground" />
            </button>
          ))}
          <div className="flex flex-col bg-card/90 backdrop-blur border border-border shadow-lg rounded-xl overflow-hidden">
            <button onClick={() => alert("Feature coming soon")} className="uber-press w-11 h-11 flex items-center justify-center text-muted-foreground border-b border-border">
              <Illicon name="check" size={22} color="text-muted-foreground" />
            </button>
            <button onClick={() => alert("Feature coming soon")} className="uber-press w-11 h-11 flex items-center justify-center text-muted-foreground">
              <Illicon name="close" size={22} color="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail bottom card */}
      <div className="absolute bottom-[68px] left-4 right-4 z-30">
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-8 h-1 bg-border rounded-full mx-auto mt-3 mb-1" />
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-[16px] font-black text-foreground">
                    {selectedVan?.driverName?.split(' ').map(n => n[0]).join('') || "DR"}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${selectedVan?.status === "in_route" ? "bg-[#06c167]" : "bg-yellow-400"}`} />
                </div>
                <div>
                  <h3 className="text-foreground font-black text-[16px] leading-tight">{selectedVan?.driverName || "Driver"}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5">
                    <Illicon name="van" size={13} color="text-muted-foreground" />
                    <span>Van {selectedVan?.plate || "4022 KSA"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${selectedVan?.status === "in_route"
                  ? "bg-[#06c167]/10 border-[#06c167]/20 text-[#06c167]"
                  : "bg-yellow-400/10 border-yellow-400/20 text-yellow-600"
                  }`}>
                  {selectedVan?.status === "in_route" ? "Active" : "Idle"}
                </span>

                <button
                  onClick={() => { haptics.light(); setShowIsochrones(!showIsochrones) }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${showIsochrones ? "bg-[#276ef1] border-[#276ef1] text-white shadow-md shadow-[#276ef1]/20" : "bg-muted border-border text-muted-foreground"
                    }`}
                >
                  <span className="material-symbols-outlined text-[14px]">radar</span>
                  <span className="text-[10px] font-bold">Reachability</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-muted-foreground">Route to Olaya Dist.</span>
                <span className="text-[#06c167] font-bold">75%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#06c167] rounded-full" style={{ width: "75%" }} />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                <span>10:30 AM Start</span><span>ETA 12:45 PM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { name: "fuel" as const, label: "Fuel", value: "45%" },
                { name: "earnings" as const, label: "Sales today", value: "SAR 1,250" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted border border-border rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wide mb-1">
                    <Illicon name={stat.name} size={16} color="text-muted-foreground" />
                    {stat.label}
                  </div>
                  <p className="text-[18px] font-black text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
              <button onClick={() => window.location.href = "tel:+966500000000"} className="uber-press flex items-center justify-center gap-2 bg-foreground text-background font-black text-[14px] py-3 px-4 rounded-xl">
                <Illicon name="call" size={18} color="text-background" />
                Call driver
              </button>
              <button onClick={() => alert("Feature coming soon")} className="uber-press w-12 bg-muted border border-border text-foreground rounded-xl flex items-center justify-center">
                <Illicon name="more" size={22} color="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="flex-none bg-background border-t border-border z-40 shrink-0">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "map", label: "Live map", active: true, onClick: () => { } },
            { icon: "local_shipping", label: "Vehicles", active: false, onClick: () => goTo("kanban") },
            { icon: "group", label: "Drivers", active: false, onClick: () => goTo("driver-registration") },
            { icon: "trending_up", label: "Analytics", active: false, onClick: () => goTo("dashboard") },
          ].map((item) => (
            <button key={item.label} onClick={item.onClick} className="uber-press flex flex-col items-center gap-1 min-w-[56px]">
              <span
                className={`material-symbols-outlined text-[24px] ${item.active ? "text-foreground" : "text-muted-foreground"}`}
                style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold ${item.active ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
