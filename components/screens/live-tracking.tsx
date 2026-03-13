"use client"

import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { VehicleMarker } from "@/components/vehicle-marker"
import Map, {
    Marker,
    Source,
    Layer,
    NavigationControl,
    ScaleControl,
} from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapControls } from "@/components/map/map-controls"
import { MapStyles } from "@/components/map/map-styles"
import { useCallback, useRef, useEffect, useState, useMemo } from "react"

// ── Helpers ─────────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t
}

/**
 * Uber-style "Your driver is on the way" live tracking screen.
 * Shows the HiAce smoothly animating along the route line towards the destination.
 */
export default function LiveTracking({ onBack }: { onBack: () => void }) {
    const { state, activeNote } = useApp()
    const haptics = useHaptics()

    const currentStop = activeNote?.stops[state.currentStopIndex]
    const stopLat = currentStop?.lat ?? 24.7136
    const stopLng = currentStop?.lng ?? 46.6753

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const mapStyle = "mapbox://styles/mapbox/navigation-day-v1"

    // ── Route fetching from OSRM ──────────────────────────────────────────
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null)
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
    const [routeDistKm, setRouteDistKm] = useState(0)
    const [routeDurMin, setRouteDurMin] = useState(0)

    // Simulate a starting point slightly away from destination
    const startLat = stopLat - 0.015
    const startLng = stopLng + 0.012

    useEffect(() => {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${stopLng},${stopLat}?overview=full&geometries=geojson&steps=true`
        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (data.routes?.[0]) {
                    const route = data.routes[0]
                    setRouteGeoJSON({
                        type: "Feature",
                        geometry: route.geometry,
                        properties: {},
                    })
                    setRouteCoords(route.geometry.coordinates)
                    setRouteDistKm(route.distance / 1000)
                    setRouteDurMin(Math.round(route.duration / 60))
                }
            })
            .catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Animate HiAce along route ──────────────────────────────────────────
    const [progress, setProgress] = useState(0) // 0-1
    const [vanPos, setVanPos] = useState({ lat: startLat, lng: startLng, heading: 0 })

    useEffect(() => {
        if (routeCoords.length < 2) return
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 0.004
                return next >= 1 ? 1 : next
            })
        }, 100)
        return () => clearInterval(interval)
    }, [routeCoords])

    useEffect(() => {
        if (routeCoords.length < 2) return
        const totalPoints = routeCoords.length
        const exactIdx = progress * (totalPoints - 1)
        const idx = Math.floor(exactIdx)
        const t = exactIdx - idx
        const nextIdx = Math.min(idx + 1, totalPoints - 1)

        const lng = lerp(routeCoords[idx][0], routeCoords[nextIdx][0], t)
        const lat = lerp(routeCoords[idx][1], routeCoords[nextIdx][1], t)

        // Calculate heading
        const dLng = routeCoords[nextIdx][0] - routeCoords[idx][0]
        const dLat = routeCoords[nextIdx][1] - routeCoords[idx][1]
        let heading = (Math.atan2(dLng, dLat) * 180) / Math.PI
        if (heading < 0) heading += 360

        setVanPos({ lat, lng, heading })
    }, [progress, routeCoords])

    // Remaining distance/time
    const remainingKm = routeDistKm * (1 - progress)
    const remainingMin = Math.max(1, Math.round(routeDurMin * (1 - progress)))
    const distDisplay = remainingKm < 1 ? `${Math.round(remainingKm * 1000)}m` : `${remainingKm.toFixed(1)} km`
    const arrived = progress >= 0.98

    // Cinematic follow mode
    const mapRef = useRef<any>(null)
    const [isInteracting, setIsInteracting] = useState(false)
    const [isMapLoaded, setIsMapLoaded] = useState(false)

    useEffect(() => {
        if (mapRef.current && routeCoords.length > 2 && !isInteracting) {
            // Smoothly ease the camera to follow the van
            mapRef.current.easeTo({
                center: [vanPos.lng, vanPos.lat],
                bearing: vanPos.heading,
                pitch: 70, // cinematic high angle
                zoom: 17.5,
                duration: 100, // matches the 100ms interval for seamless animation
                easing: (t: number) => t // linear easing for constant speed
            })
        }
    }, [vanPos, routeCoords.length, isInteracting])

    // 3D buildings
    const onMapLoad = useCallback((e: any) => {
        const map = e.target; if (!map) return
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
        } catch { }
        setIsMapLoaded(true)
    }, [])

    // Route styling
    const routeLine: any = {
        id: "tracking-route", type: "line",
        paint: { "line-color": "#276ef1", "line-width": 5, "line-opacity": 0.85, "line-blur": 1 },
        layout: { "line-join": "round", "line-cap": "round" },
    }
    const routeGlow: any = {
        id: "tracking-glow", type: "line",
        paint: { "line-color": "#276ef1", "line-width": 14, "line-opacity": 0.12, "line-blur": 10 },
        layout: { "line-join": "round", "line-cap": "round" },
    }
    // Traveled portion (dimmer)
    const traveledGeoJSON = useMemo(() => {
        if (!routeCoords.length) return null
        const idx = Math.floor(progress * (routeCoords.length - 1))
        return {
            type: "Feature" as const,
            geometry: { type: "LineString" as const, coordinates: routeCoords.slice(0, idx + 1) },
            properties: {},
        }
    }, [routeCoords, progress])
    const traveledLine: any = {
        id: "traveled-route", type: "line",
        paint: { "line-color": "#276ef1", "line-width": 5, "line-opacity": 0.3 },
        layout: { "line-join": "round", "line-cap": "round" },
    }

    // Driver info
    const driverName = state.drivers[0]?.name ?? "Ahmad"
    const driverInitials = state.drivers[0]?.initials ?? "AH"
    const vanPlate = state.vans[0]?.plate ?? "RYD 4529"
    const vanModel = state.vans[0]?.model ?? "Toyota HiAce"

    return (
        <div className="bg-background h-full w-full relative overflow-hidden">
            {/* Map */}
            <div className="absolute inset-0 z-0">
                <Map
                    ref={mapRef}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{ longitude: stopLng, latitude: stopLat, zoom: 17.5, pitch: 70, bearing: 0 }}
                    mapStyle={mapStyle}
                    onLoad={onMapLoad}
                    onDragStart={() => setIsInteracting(true)}
                    onZoomStart={() => setIsInteracting(true)}
                    antialias
                >
                    <MapControls />
                    <MapStyles />
                    <NavigationControl position="top-right" showCompass visualizePitch />
                    <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />

                    {/* Route line */}
                    {isMapLoaded && routeGeoJSON && (
                        <Source type="geojson" data={routeGeoJSON}>
                            <Layer {...routeGlow} />
                            <Layer {...routeLine} />
                        </Source>
                    )}
                    {/* Traveled portion */}
                    {isMapLoaded && traveledGeoJSON && (
                        <Source type="geojson" data={traveledGeoJSON}>
                            <Layer {...traveledLine} />
                        </Source>
                    )}

                    {/* Destination pin */}
                    <Marker longitude={stopLng} latitude={stopLat} anchor="bottom">
                        <div className="flex flex-col items-center">
                            <div className="absolute bottom-0 w-5 h-2 rounded-[50%] bg-[#276ef1]/40 blur-[3px]" />
                            <div className="relative z-10 w-12 h-12 bg-[#276ef1] rounded-full flex items-center justify-center border-4 border-white shadow-[0_4px_24px_rgba(39,110,241,0.6)]">
                                <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                            </div>
                            <div className="w-0.5 h-3 bg-[#276ef1] rounded-b" />
                            <div className="mt-1 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                {currentStop?.customerName ?? "Destination"}
                            </div>
                        </div>
                    </Marker>

                    {/* HiAce moving along route */}
                    <Marker longitude={vanPos.lng} latitude={vanPos.lat} anchor="center">
                        <VehicleMarker
                            heading={vanPos.heading}
                            color="#06c167"
                            size={46}
                            isActive
                        />
                    </Marker>
                </Map>
            </div>

            {/* Top bar — back + share + re-center */}
            <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-3 bg-gradient-to-b from-background/90 via-background/50 to-transparent">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { haptics.light(); onBack() }}
                        className="uber-press w-11 h-11 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center shadow-lg"
                    >
                        <Illicon name="back" size={22} color="text-foreground" />
                    </button>
                    {isInteracting ? (
                        <button
                            onClick={() => { haptics.medium(); setIsInteracting(false) }}
                            className="bg-background/90 backdrop-blur border-2 border-[#276ef1] rounded-full px-4 py-2 shadow-lg flex items-center gap-2 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[#276ef1] text-[18px]">my_location</span>
                            <span className="text-[12px] font-bold text-[#276ef1]">Re-center</span>
                        </button>
                    ) : (
                        <div className="bg-background/90 backdrop-blur border border-border rounded-full px-4 py-2 shadow-lg">
                            <span className="text-[12px] font-bold text-foreground">
                                {arrived ? "🎉 Arrived!" : "🚚 On the way"}
                            </span>
                        </div>
                    )}
                    <button onClick={() => alert("Feature coming soon")} className="uber-press w-11 h-11 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-foreground text-[20px]">share</span>
                    </button>
                </div>
            </div>

            {/* Bottom card — Uber style driver card */}
            <div className="absolute bottom-0 left-0 right-0 z-30">
                <div className="bg-background border-t border-border rounded-t-3xl shadow-2xl pb-8">
                    <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-4" />

                    {/* ETA banner */}
                    <div className="mx-5 mb-4 bg-foreground text-background rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold opacity-70 uppercase tracking-wider">
                                {arrived ? "Driver has arrived" : "Arriving in"}
                            </p>
                            <p className="text-[32px] font-black leading-none mt-1">
                                {arrived ? "Now" : `${remainingMin} min`}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold opacity-70 uppercase">Distance</p>
                            <p className="text-[18px] font-black mt-1">{arrived ? "0m" : distDisplay}</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mx-5 mb-4">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#06c167] rounded-full transition-all duration-300"
                                style={{ width: `${Math.round(progress * 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground font-bold">Picked up</span>
                            <span className="text-[10px] text-muted-foreground font-bold">{Math.round(progress * 100)}%</span>
                            <span className="text-[10px] text-muted-foreground font-bold">Delivered</span>
                        </div>
                    </div>

                    {/* Driver info card */}
                    <div className="mx-5 flex items-center gap-4 bg-muted/50 border border-border rounded-2xl p-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-[#06c167] flex items-center justify-center text-black font-black text-[16px] shrink-0 border-2 border-white shadow-lg">
                            {driverInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-black text-foreground">{driverName}</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">{vanModel} · <span className="font-bold">{vanPlate}</span></p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-400 text-[11px]">★ ★ ★ ★ ★</span>
                                <span className="text-[11px] text-muted-foreground font-bold">{state.drivers[0]?.rating ?? 4.9}</span>
                            </div>
                        </div>
                        {/* Contact buttons */}
                        <div className="flex gap-2 shrink-0">
                            <button onClick={() => alert("Feature coming soon")} className="uber-press w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center">
                                <Illicon name="call" size={20} color="text-foreground" />
                            </button>
                            <button onClick={() => alert("Feature coming soon")} className="uber-press w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center">
                                <Illicon name="chat" size={20} color="text-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Delivery items summary */}
                    {currentStop && currentStop.items.length > 0 && (
                        <div className="mx-5 mt-3 bg-muted/30 border border-border rounded-xl p-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                📦 {currentStop.items.length} items being delivered
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {currentStop.items.slice(0, 4).map(item => (
                                    <span key={item.id} className="text-[11px] bg-background border border-border px-2 py-0.5 rounded-full text-foreground font-medium">
                                        {item.qty}× {item.name}
                                    </span>
                                ))}
                                {currentStop.items.length > 4 && (
                                    <span className="text-[11px] text-muted-foreground font-bold px-2 py-0.5">+{currentStop.items.length - 4} more</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
