"use client"

import { useState, useCallback, useEffect } from "react"
import { useApp, CATALOG_ITEMS } from "@/lib/app-context"
import type { Stop, StopType, StopItem, DeliveryNote, LoadType } from "@/lib/app-context"
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

const STOP_TYPES: { value: StopType; label: string; icon: string; activeBg: string; activeText: string }[] = [
  { value: "deliver", label: "Deliver", icon: "local_shipping", activeBg: "bg-u900", activeText: "text-u100" },
  { value: "pickup", label: "Pickup", icon: "inventory", activeBg: "bg-ugreen", activeText: "text-black" },
  { value: "cash", label: "Cash", icon: "payments", activeBg: "bg-yellow-400", activeText: "text-black" },
  { value: "return", label: "Return", icon: "assignment_return", activeBg: "bg-orange-400", activeText: "text-black" },
  { value: "mixed", label: "Mixed", icon: "swap_horiz", activeBg: "bg-blue-500", activeText: "text-black" },
]

interface StopDraft {
  id: string; type: StopType; customerName: string; address: string; phone: string
  items: { catalogId: string; qty: number }[]; expectedCash: string
  lat?: number; lng?: number
}
function newStop(seq: number): StopDraft {
  return { id: `draft-${seq}-${Date.now()}`, type: "deliver", customerName: "", address: "", phone: "", items: [], expectedCash: "", lat: undefined, lng: undefined }
}

// ── Address Autocomplete ──────────────────────────────────────────────────
function AddressAutocomplete({ value, onChange, mapboxToken }: {
  value: string; onChange: (address: string, lat?: number, lng?: number) => void; mapboxToken?: string
}) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [show, setShow] = useState(false)

  // Debounced fetch
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }
    const delayId = setTimeout(async () => {
      try {
        // Enforce Saudi Arabia (SA) country bounds and bilingual language support to match local Google Maps accuracy
        // Enable 'entrances=true' to get precise door-level coordinates (routable points)
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&country=SA&language=en,ar&entrances=true`
        const res = await fetch(url)
        const data = await res.json()
        setSuggestions(data.features || [])
      } catch (e) {
        console.error("Geocoding failed", e)
      }
    }, 300)
    return () => clearTimeout(delayId)
  }, [query, mapboxToken])

  const getCategoryIcon = (feature: any) => {
    const category = feature.properties?.category || ""
    const poiCategory = feature.properties?.poi_category || ""
    if (category.includes("place") || poiCategory.includes("city")) return "location_city"
    if (category.includes("shopping") || poiCategory.includes("mall") || poiCategory.includes("shop")) return "shopping_bag"
    if (category.includes("food") || poiCategory.includes("restaurant") || poiCategory.includes("cafe")) return "restaurant"
    if (category.includes("transport") || poiCategory.includes("airport") || poiCategory.includes("station")) return "directions_bus"
    if (category.includes("health") || poiCategory.includes("hospital")) return "local_hospital"
    return "location_on"
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value) // Update text instantly
          setShow(true)
        }}
        onFocus={() => setShow(true)}
        placeholder="Street address, district, city"
        className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3.5 text-u900 text-[13px] placeholder-u500 focus:outline-none focus:border-u600 transition-colors"
      />
      {show && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-u300 border border-u500 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2">
          {suggestions.map((feature: any) => (
            <button
              key={feature.id}
              onClick={() => {
                const centerLng = feature.center[0]
                const centerLat = feature.center[1]

                // Advanced: Use 'entrance' routable point if available for 5-meter door accuracy
                const entrancePoint = feature.properties?.routable_points?.find((p: any) => p.name === "entrance")
                const finalLng = entrancePoint ? entrancePoint.longitude : centerLng
                const finalLat = entrancePoint ? entrancePoint.latitude : centerLat

                const placeName = feature.place_name
                setQuery(placeName)
                onChange(placeName, finalLat, finalLng)
                setShow(false)
              }}
              className="w-full text-left px-4 py-3 border-b border-u500/50 hover:bg-u400 transition-colors flex items-start gap-3 last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-u500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-u300 text-[18px]">
                  {getCategoryIcon(feature)}
                </span>
              </div>
              <div>
                <p className="text-white text-[13px] font-bold line-clamp-1">{feature.text}</p>
                <p className="text-u300 text-[11px] line-clamp-1">{feature.place_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Location Picker Overlay ───────────────────────────────────────────────
function LocationPicker({ initialLat, initialLng, onConfirm, onClose, mapboxToken }: {
  initialLat?: number; initialLng?: number
  onConfirm: (lat: number, lng: number, address?: string) => void
  onClose: () => void
  mapboxToken?: string
}) {
  const [pin, setPin] = useState<{ lat: number; lng: number }>({
    lat: initialLat ?? 24.7136, lng: initialLng ?? 46.6753,
  })
  const [isLoading, setIsLoading] = useState(false)

  const mapStyle = "mapbox://styles/mapbox/standard"

  const handleClick = useCallback((e: any) => {
    const lngLat = e.lngLat
    if (lngLat) setPin({ lat: lngLat.lat, lng: lngLat.lng })
  }, [])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      // Use 'entrances=true' for reverse geocoding to get door-level context
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pin.lng},${pin.lat}.json?access_token=${mapboxToken}&entrances=true`
      const res = await fetch(url)
      const data = await res.json()

      const feature = data.features?.[0]
      const entrancePoint = feature?.properties?.routable_points?.find((p: any) => p.name === "entrance")

      const finalLat = entrancePoint ? entrancePoint.latitude : pin.lat
      const finalLng = entrancePoint ? entrancePoint.longitude : pin.lng
      const address = feature?.place_name || `${finalLat.toFixed(5)}, ${finalLng.toFixed(5)}`

      onConfirm(finalLat, finalLng, address)
    } catch {
      onConfirm(pin.lat, pin.lng)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-u500 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center">
            <span className="material-symbols-outlined text-u900 text-[22px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-[18px] font-black text-u900">Pick Location</h2>
            <p className="text-[11px] text-u600">Tap on the map to place the pin</p>
          </div>
        </div>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="bg-ugreen text-black font-black px-5 py-2.5 rounded-xl text-[13px] active:brightness-90 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Confirm"}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{ longitude: pin.lng, latitude: pin.lat, zoom: 15, pitch: 45 }}
          mapStyle={mapStyle}
          onClick={handleClick}
          antialias
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass visualizePitch />
          <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />
          <GeolocateControl position="bottom-right" trackUserLocation showUserHeading />
          <Marker longitude={pin.lng} latitude={pin.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              {/* Shadow on ground */}
              <div className="absolute bottom-0 w-5 h-2 rounded-[50%] bg-[#06c167]/40 blur-[3px]" />
              {/* Pin */}
              <div className="relative z-10 w-11 h-11 bg-[#06c167] rounded-full flex items-center justify-center border-4 border-white shadow-[0_4px_24px_rgba(6,193,103,0.6)]">
                <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div className="w-0.5 h-3 bg-[#06c167] rounded-b" />
            </div>
          </Marker>
        </Map>

        {/* Coordinate readout */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md border border-u500 px-4 py-2.5 rounded-2xl shadow-2xl">
          <p className="text-[11px] text-u600 text-center font-bold">
            <span className="text-ugreen">{pin.lat.toFixed(5)}</span>,{" "}
            <span className="text-ugreen">{pin.lng.toFixed(5)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ItemPicker({ selectedItems, onChange, onClose }: {
  selectedItems: { catalogId: string; qty: number }[]
  onChange: (items: { catalogId: string; qty: number }[]) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<{ catalogId: string; qty: number }[]>(selectedItems)

  const adjust = (id: string, delta: number) => {
    setLocal((prev) => {
      const existing = prev.find((i) => i.catalogId === id)
      if (!existing) return delta > 0 ? [...prev, { catalogId: id, qty: delta }] : prev
      const newQty = existing.qty + delta
      if (newQty <= 0) return prev.filter((i) => i.catalogId !== id)
      return prev.map((i) => (i.catalogId === id ? { ...i, qty: newQty } : i))
    })
  }

  const setQty = (id: string, qty: number) => {
    setLocal((prev) => {
      if (qty <= 0) return prev.filter((i) => i.catalogId !== id)
      const existing = prev.find((i) => i.catalogId === id)
      if (!existing) return [...prev, { catalogId: id, qty }]
      return prev.map((i) => (i.catalogId === id ? { ...i, qty } : i))
    })
  }

  const totalSelected = local.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-u500 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center">
            <span className="material-symbols-outlined text-u900 text-[22px]">arrow_back</span>
          </button>
          <h2 className="text-[20px] font-black text-u900">Select Items</h2>
        </div>
        <button
          onClick={() => { onChange(local); onClose() }}
          className="bg-ugreen text-black font-black px-5 py-2.5 rounded-xl text-[13px] active:brightness-90"
        >
          Done {totalSelected > 0 ? `(${totalSelected})` : ""}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2" style={{ scrollbarWidth: "none" }}>
        {CATALOG_ITEMS.map((cat) => {
          const sel = local.find((i) => i.catalogId === cat.id)
          return (
            <div
              key={cat.id}
              className={`rounded-2xl p-4 border transition-all ${sel ? "bg-ugreen/8 border-ugreen/20" : "bg-u300 border-u500"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`font-bold text-[14px] ${sel ? "text-u900" : "text-u800"}`}>{cat.name}</p>
                  <p className="text-[11px] text-u600 mt-0.5">SAR {cat.price} / {cat.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(cat.id, -1)}
                    disabled={!sel}
                    className="w-9 h-9 rounded-full bg-u400 border border-u500 text-u900 flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <input
                    type="number"
                    value={sel?.qty ?? 0}
                    onChange={(e) => setQty(cat.id, parseInt(e.target.value) || 0)}
                    className="w-14 h-9 rounded-lg bg-u400 border border-u500 text-center text-u900 font-black text-[15px] outline-none focus:border-ugreen transition-colors"
                  />
                  <button
                    onClick={() => adjust(cat.id, 1)}
                    className="w-9 h-9 rounded-full bg-ugreen text-black flex items-center justify-center active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
              {/* Quick-add buttons for large quantities */}
              {sel && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-u500/50">
                  <span className="text-[10px] text-u600 font-bold uppercase">Quick:</span>
                  {[10, 25, 50, 100].map((n) => (
                    <button
                      key={n}
                      onClick={() => adjust(cat.id, n)}
                      className="px-2.5 py-1 rounded-lg bg-u400 border border-u500 text-[11px] font-bold text-u800 active:bg-u500 transition-colors"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DeliveryNoteScreen({ onBack }: { onBack: () => void; onNext?: () => void }) {
  const { state, dispatch, goTo } = useApp()
  const [stops, setStops] = useState<StopDraft[]>([newStop(1)])
  const [driverId, setDriverId] = useState(state.drivers[0]?.id ?? "")
  const [vanId, setVanId] = useState(state.vans[0]?.id ?? "")
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">("normal")
  const [loadType, setLoadType] = useState<LoadType>("ptl")
  const [notes, setNotes] = useState("")
  const [pickerStopIndex, setPickerStopIndex] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  const [activeStopTab, setActiveStopTab] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [locationPickerIdx, setLocationPickerIdx] = useState<number | null>(null)
  const [totalKm, setTotalKm] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // Added for optimization button loading state

  const updateStop = (idx: number, patch: Partial<StopDraft>) =>
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  // Force navigation style for Google Maps-like prominent POIs and street names
  const mapStyle = "mapbox://styles/mapbox/navigation-day-v1" // Assuming mapType is not available here, using a default

  // Placeholder for haptics, replace with actual import if available
  const haptics = { medium: () => { }, success: () => { } }

  const optimizeRoute = async () => {
    if (stops.length < 2) return
    setIsSubmitting(true)
    haptics.medium()

    try {
      // Current location as start (or first stop if no location)
      // Assuming driverCoords is not available, using the first stop as the start point
      const startCoord = `${stops[0].lng},${stops[0].lat}`
      const coordinates = stops.map(s => `${s.lng},${s.lat}`).join(";")

      const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${startCoord};${coordinates}?source=first&destination=any&roundtrip=false&geometries=geojson&access_token=${MAPBOX_TOKEN}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.code === "Ok" && data.waypoints) {
        // Mapbox returns waypoints in optimized order
        const optimizedStops = data.waypoints
          .filter((wp: any) => wp.waypoint_index > 0) // Skip our 'source=first' dummy point
          .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
          .map((wp: any, idx: number) => {
            // Mapbox waypoint_index refers to the index in the *request* coordinates array
            // Since we added a startCoord at the beginning, the original stops are shifted by 1
            const originalStop = stops[wp.waypoint_index - 1]
            return { ...originalStop, sequence: idx + 1 }
          })

        setStops(optimizedStops) // Update the state with optimized stops
        haptics.success()
      }
    } catch (error) {
      console.error("Optimization failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addStop = () => { setStops((prev) => [...prev, newStop(prev.length + 1)]); setActiveStopTab(stops.length) }
  const removeStop = (idx: number) => { if (stops.length === 1) return; setStops((prev) => prev.filter((_, i) => i !== idx)); setActiveStopTab(Math.max(0, idx - 1)) }
  const getStopItemsCount = (stop: StopDraft) => stop.items.reduce((s, i) => s + i.qty, 0)

  // Calculate total distance for the route
  useEffect(() => {
    const validStops = stops.filter(s => s.lat !== undefined && s.lng !== undefined)
    if (validStops.length < 2) {
      setTotalKm(null)
      return
    }

    const points = validStops.map(s => `${s.lng},${s.lat}`).join(";")
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${points}?access_token=${MAPBOX_TOKEN}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          setTotalKm(data.routes[0].distance / 1000)
        }
      })
      .catch(() => setTotalKm(null))
  }, [stops, MAPBOX_TOKEN])

  const saveDraft = () => {
    const builtStops: Stop[] = stops.map((s, idx) => ({
      id: `S${String(idx + 1).padStart(3, "0")}`,
      sequence: idx + 1,
      type: s.type,
      customerName: s.customerName || `Stop ${idx + 1}`,
      address: s.address || "Address TBD",
      phone: s.phone || "",
      items: s.items.map((si) => {
        const cat = CATALOG_ITEMS.find((c) => c.id === si.catalogId)!
        return { id: cat.id, name: cat.name, qty: si.qty, unit: cat.unit, price: cat.price, delivered: 0 } as StopItem
      }),
      expectedCash: s.expectedCash ? Number(s.expectedCash) : undefined,
      collectedCash: 0, status: "pending",
      lat: s.lat, lng: s.lng,
    }))
    const note: DeliveryNote = {
      id: `DN-${Date.now()}`, driverId, vanId, warehouse: "Riyadh Central Hub — Gate 4",
      date: new Date().toISOString().slice(0, 10), priority, loadType, stops: builtStops, notes,
      status: "draft",
    }
    dispatch({ type: "SAVE_DRAFT_NOTE", note })
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 2000)
  }

  const buildAndSend = () => {
    const builtStops: Stop[] = stops.map((s, idx) => ({
      id: `S${String(idx + 1).padStart(3, "0")}`,
      sequence: idx + 1,
      type: s.type,
      customerName: s.customerName || `Stop ${idx + 1}`,
      address: s.address || "Address TBD",
      phone: s.phone || "",
      items: s.items.map((si) => {
        const cat = CATALOG_ITEMS.find((c) => c.id === si.catalogId)!
        return { id: cat.id, name: cat.name, qty: si.qty, unit: cat.unit, price: cat.price, delivered: 0 } as StopItem
      }),
      expectedCash: s.expectedCash ? Number(s.expectedCash) : undefined,
      collectedCash: 0, status: "pending",
      lat: s.lat, lng: s.lng,
    }))
    const note: DeliveryNote = {
      id: `DN-${Date.now()}`, driverId, vanId, warehouse: "Riyadh Central Hub — Gate 4",
      date: new Date().toISOString().slice(0, 10), priority, loadType, stops: builtStops, notes,
      status: "sent", sentAt: new Date().toISOString(),
    }
    dispatch({ type: "SEND_DELIVERY_NOTE", note })
    dispatch({ type: "SET_ACTIVE_NOTE", noteId: note.id })
    dispatch({ type: "SET_VAN_STATUS", vanId, status: "assigned", extra: { driverId } })
    setSent(true)
  }

  // ── Sent confirmation ─────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background text-u900 px-8 gap-6">
        <div className="w-24 h-24 rounded-full bg-ugreen/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-ugreen text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="text-center">
          <h2 className="text-[28px] font-black mb-2 tracking-tight text-u900">Note Sent</h2>
          <p className="text-u700 text-[14px] leading-relaxed">
            Driver notified. Delivery note is live in their inbox.
          </p>
        </div>

        {/* Static Map Preview (Enterprise Static Image API) */}
        <div className="w-full h-40 rounded-2xl border border-u500 overflow-hidden shadow-lg relative bg-u300 flex items-center justify-center">
          {stops.some(s => s.lat && s.lng) ? (
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${stops.filter(s => s.lat && s.lng).map(s => `pin-s+276ef1(${s.lng},${s.lat})`).join(",")
                }/auto/600x400?padding=40&access_token=${MAPBOX_TOKEN}`}
              alt="Route Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-u500 text-[11px] font-bold">No route coordinates available</div>
          )}
          <div className="absolute top-3 left-3 bg-u900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
            <span className="text-white text-[10px] font-black uppercase tracking-wider">Static Route Preview</span>
          </div>
        </div>
        <div className="bg-u300 border border-u500 rounded-2xl p-5 w-full space-y-3">
          <p className="text-[10px] font-black text-u600 uppercase tracking-widest">Summary</p>
          {[
            { label: "Stops", value: String(stops.length) },
            { label: "Driver", value: state.drivers.find((d) => d.id === driverId)?.name ?? "—" },
            { label: "Van", value: state.vans.find((v) => v.id === vanId)?.plate ?? "—" },
            { label: "Priority", value: priority.toUpperCase() },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[13px] text-u600">{row.label}</span>
              <span className="text-[13px] font-bold text-u900">{row.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => goTo("kanban")} className="w-full h-[58px] bg-u900 text-u100 font-black text-[17px] rounded-xl active:opacity-90 transition-colors">
          Back to Fleet Board
        </button>
        <button onClick={onBack} className="w-full h-[48px] border border-u500 text-u700 font-bold text-[14px] rounded-xl active:bg-u300 transition-colors">
          Create Another
        </button>
      </div>
    )
  }

  // ── Location picker overlay ─────────────────────────────────────────────
  if (locationPickerIdx !== null) {
    const targetStop = stops[locationPickerIdx]
    return (
      <LocationPicker
        initialLat={targetStop?.lat}
        initialLng={targetStop?.lng}
        mapboxToken={MAPBOX_TOKEN}
        onConfirm={(lat, lng, address) => {
          if (address) {
            updateStop(locationPickerIdx, { lat, lng, address })
          } else {
            updateStop(locationPickerIdx, { lat, lng })
          }
          setLocationPickerIdx(null)
        }}
        onClose={() => setLocationPickerIdx(null)}
      />
    )
  }

  // ── Item picker overlay ───────────────────────────────────────────────────
  if (pickerStopIndex !== null) {
    return (
      <ItemPicker
        selectedItems={stops[pickerStopIndex]?.items ?? []}
        onChange={(items) => updateStop(pickerStopIndex, { items })}
        onClose={() => setPickerStopIndex(null)}
      />
    )
  }

  const stop = stops[activeStopTab]

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-u900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-u500 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-u300 border border-u500 flex items-center justify-center">
            <span className="material-symbols-outlined text-u900 text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[20px] font-black tracking-tight text-u900">Create Route</h1>
            <p className="text-[11px] text-u600 mt-0.5">{stops.length} stop{stops.length !== 1 ? "s" : ""} configured</p>
          </div>
        </div>
        {/* Priority badges */}
        <div className="flex items-center gap-1">
          {(["normal", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${priority === p
                ? p === "urgent" ? "bg-red-500 text-white" : p === "high" ? "bg-yellow-400 text-black" : "bg-u900 text-u100"
                : "text-u600 border border-u500"
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

        {/* FTL / PTL toggle */}
        <div className="px-5 pt-5 pb-3">
          <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Load Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLoadType("ftl")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all ${loadType === "ftl"
                ? "bg-u900 text-u100"
                : "bg-u300 border border-u500 text-u600"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              FTL — Full Load
            </button>
            <button
              onClick={() => setLoadType("ptl")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black transition-all ${loadType === "ptl"
                ? "bg-ugreen text-black"
                : "bg-u300 border border-u500 text-u600"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">multiple_stop</span>
              PTL — Part Load
            </button>
          </div>
          {loadType === "ftl" && (
            <p className="text-[11px] text-u700 mt-2 leading-relaxed">Dedicated delivery. Driver sees only this note — no shared pickups.</p>
          )}
          {loadType === "ptl" && (
            <p className="text-[11px] text-u700 mt-2 leading-relaxed">Driver may see additional nearby pickups when in the same region.</p>
          )}
        </div>

        {/* Assign Driver & Van */}
        <div className="px-5 pt-5 pb-3 border-b border-u500 grid grid-cols-2 gap-3">
          {[
            { label: "Driver", icon: "person", value: driverId, onChange: setDriverId, options: state.drivers.map((d) => ({ id: d.id, label: d.name })) },
            { label: "Van", icon: "local_shipping", value: vanId, onChange: setVanId, options: state.vans.map((v) => ({ id: v.id, label: v.plate })) },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">{field.label}</label>
              <div className="bg-u300 border border-u500 rounded-xl px-3 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-u600 text-[18px]">{field.icon}</span>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="bg-transparent text-u900 text-[13px] flex-1 outline-none appearance-none cursor-pointer"
                >
                  {field.options.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* ── Auto-Dispatch Intelligence ── */}
        <div className="px-5 py-3 border-b border-u500">
          <button
            onClick={() => {
              const bestDriver = state.drivers[0]
              const bestVan = state.vans.find(v => v.driverId === bestDriver?.id) ?? state.vans[0]
              if (bestDriver) setDriverId(bestDriver.id)
              if (bestVan) setVanId(bestVan.id)
            }}
            className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-black text-u900 flex items-center gap-1.5">
                <span>Auto-Assign</span>
                <span className="text-[9px] font-bold bg-blue-500/20 text-blue-600 px-1.5 py-0.5 rounded">AI</span>
              </p>
              <p className="text-[11px] text-u600 mt-0.5">
                {state.drivers[0]?.name ?? "—"} — closest, {state.drivers[0]?.rating ?? 0}★, {state.drivers[0]?.acceptance ?? 0}% on-time
              </p>
            </div>
            <span className="material-symbols-outlined text-blue-500/50 text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* Stops List */}
        <div className="px-5 py-4 space-y-4">
          {stops.map((stop, stopIdx) => (
            <div key={stop.id} className="bg-u300 border border-u500 rounded-2xl p-4 space-y-4 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-black text-u900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-u900 text-u100 flex items-center justify-center text-[11px]">
                    {stopIdx + 1}
                  </div>
                  {stop.customerName || "New Stop"}
                </h3>
                {stops.length > 1 && (
                  <button
                    onClick={() => removeStop(stopIdx)}
                    className="w-8 h-8 rounded-full border border-red-500/30 text-red-500 flex items-center justify-center bg-red-500/10 active:opacity-70 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Stop type */}
              <div>
                <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-1">Stop Type</label>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {STOP_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => updateStop(stopIdx, { type: t.value })}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all shrink-0 ${stop.type === t.value ? `${t.activeBg} ${t.activeText}` : "bg-background text-u700 border border-u500"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer info */}
              <div className="space-y-2">
                <AddressAutocomplete
                  value={stop.address}
                  onChange={(address, lat, lng) => {
                    if (lat !== undefined && lng !== undefined) {
                      updateStop(stopIdx, { address, lat, lng })
                    } else {
                      updateStop(stopIdx, { address })
                    }
                  }}
                  mapboxToken={MAPBOX_TOKEN}
                />
                <input
                  type="text"
                  value={stop.customerName}
                  onChange={(e) => updateStop(stopIdx, { customerName: e.target.value })}
                  placeholder="Customer or business name (optional)"
                  className="w-full bg-background border border-u500 rounded-xl px-4 py-3 text-u900 text-[13px] placeholder-u500 focus:outline-none focus:border-u600 transition-colors"
                />
                <input
                  type="tel"
                  value={stop.phone}
                  onChange={(e) => updateStop(stopIdx, { phone: e.target.value })}
                  placeholder="Phone number e.g. +966..."
                  className="w-full bg-background border border-u500 rounded-xl px-4 py-3 text-u900 text-[13px] placeholder-u500 focus:outline-none focus:border-u600 transition-colors"
                />
                {/* Pick on Map button */}
                <button
                  onClick={() => setLocationPickerIdx(stopIdx)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black transition-all ${stop.lat && stop.lng
                    ? "bg-ugreen/10 border border-ugreen/30 text-ugreen"
                    : "bg-background border border-dashed border-u500 text-u600"
                    }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  {stop.lat && stop.lng
                    ? `📍 ${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`
                    : "Pick Location on Map"
                  }
                </button>
              </div>

              {/* Items selector */}
              {(stop.type === "deliver" || stop.type === "pickup" || stop.type === "return" || stop.type === "mixed") && (
                <div className="pt-2 border-t border-u500/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-u600 uppercase tracking-widest">Items</label>
                    <button
                      onClick={() => setPickerStopIndex(stopIdx)}
                      className="text-[11px] font-black text-ugreen flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_circle</span>
                      {stop.items.length === 0 ? "Add Items" : "Edit Items"}
                    </button>
                  </div>
                  {stop.items.length > 0 && (
                    <div className="space-y-2">
                      {stop.items.map((si) => {
                        const cat = CATALOG_ITEMS.find((c) => c.id === si.catalogId)
                        if (!cat) return null
                        return (
                          <div key={si.catalogId} className="bg-background border border-u500 rounded-xl px-3 py-2 flex items-center justify-between">
                            <div>
                              <p className="text-u900 text-[12px] font-bold">{cat.name}</p>
                              <p className="text-u600 text-[10px]">{si.qty} {cat.unit} · SAR {(cat.price * si.qty).toLocaleString()}</p>
                            </div>
                            <div className="bg-u400 border border-u500 text-u900 font-black text-[12px] px-2 py-1 rounded-lg">
                              ×{si.qty}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Cash amount */}
              {(stop.type === "cash" || stop.type === "mixed") && (
                <div className="pt-2 border-t border-u500/50">
                  <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Expected Cash (SAR)</label>
                  <div className="flex items-center bg-background border border-u500 rounded-xl px-4 py-3 gap-3 focus-within:border-yellow-400/50 transition-colors">
                    <span className="text-yellow-500 font-black text-[14px]">SAR</span>
                    <input
                      type="number"
                      value={stop.expectedCash}
                      onChange={(e) => updateStop(stopIdx, { expectedCash: e.target.value })}
                      placeholder="0.00"
                      className="bg-transparent text-u900 text-[16px] font-black flex-1 outline-none placeholder-u500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Stop Button */}
          <button
            onClick={addStop}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-u500 text-ugreen font-black text-[13px] flex items-center justify-center gap-2 active:bg-u300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Another Stop
          </button>
        </div>

        {/* Driver notes */}
        <div className="px-5 pb-4 border-t border-u500 pt-4">
          <label className="text-[10px] font-black text-u600 uppercase tracking-widest block mb-2">Driver Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions, access codes, delivery windows..."
            rows={3}
            className="w-full bg-u300 border border-u500 rounded-xl px-4 py-3 text-u900 text-[13px] placeholder-u500 focus:outline-none focus:border-u600 resize-none transition-colors"
          />
        </div>

        {/* Route overview */}
        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-u600 uppercase tracking-widest">Route Overview</p>
              {totalKm !== null && (
                <p className="text-[12px] font-black text-u900">Total: {totalKm.toFixed(1)} KM</p>
              )}
            </div>
            {stops.length > 1 && (
              <button
                onClick={optimizeRoute}
                className="flex items-center gap-1 text-[11px] font-black text-ugreen active:opacity-70 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">route</span>
                Optimize Route
              </button>
            )}
          </div>
          <div className="bg-u300 border border-u500 rounded-2xl p-4 space-y-2">
            {stops.map((s, idx) => {
              const typeInfo = STOP_TYPES.find((t) => t.value === s.type)
              const itemCount = getStopItemsCount(s)
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStopTab(idx)}
                  className="w-full flex items-center gap-3 py-2 text-left"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${typeInfo?.activeBg ?? "bg-u900"} ${typeInfo?.activeText ?? "text-u100"}`}>
                    <span className="material-symbols-outlined text-[13px]">{typeInfo?.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-u900 text-[13px] font-bold truncate">{s.customerName || `Stop ${idx + 1}`}</p>
                    <p className="text-u600 text-[11px] truncate">{s.address || "Address not set"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {itemCount > 0 && <p className="text-u600 text-[11px]">{itemCount} items</p>}
                    {s.expectedCash && <p className="text-yellow-500 text-[11px] font-bold">SAR {s.expectedCash}</p>}
                  </div>
                </button>
              )
            })}
          </div>
          {stops.length > 0 && (
            <div className="mt-4 h-52 rounded-2xl overflow-hidden border border-u500 relative">
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{ longitude: 46.6753, latitude: 24.7136, zoom: 11, pitch: 40, bearing: -10 }}
                mapStyle={mapStyle}
                interactive={false}
                antialias
                attributionControl={false}
              >
                {stops.map((s, idx) => {
                  const typeInfo = STOP_TYPES.find((t) => t.value === s.type)
                  const stopLat = s.lat ?? (24.7136 + (Math.sin(idx) * 0.05))
                  const stopLng = s.lng ?? (46.6753 + (Math.cos(idx) * 0.05))
                  return (
                    <Marker key={s.id} longitude={stopLng} latitude={stopLat} anchor="bottom">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${s.lat && s.lng
                          ? `${typeInfo?.activeBg ?? "bg-u900"} ${typeInfo?.activeText ?? "text-u100"} border-2 border-white`
                          : "bg-white/60 text-gray-500 border border-white/30"
                          }`}>
                          <span className="text-[12px] font-black">{idx + 1}</span>
                        </div>
                        {s.lat && s.lng && <div className="w-0.5 h-1.5 bg-white/50 rounded-b" />}
                      </div>
                    </Marker>
                  )
                })}
              </Map>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="shrink-0 px-5 py-4 pb-8 bg-background border-t border-u500 flex gap-3">
        <button
          onClick={saveDraft}
          className="flex-1 h-[52px] rounded-xl border border-u500 text-u700 text-[13px] font-bold active:bg-u300 transition-colors flex items-center justify-center gap-1.5"
        >
          {draftSaved ? (
            <>
              <span className="material-symbols-outlined text-ugreen text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Saved!
            </>
          ) : (
            "Save Draft"
          )}
        </button>
        <button
          onClick={buildAndSend}
          className="flex-[2] h-[52px] rounded-xl bg-ugreen text-black font-black text-[15px] active:brightness-90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(6,193,103,0.3)]"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          Send to Driver
        </button>
      </div>
    </div>
  )
}
