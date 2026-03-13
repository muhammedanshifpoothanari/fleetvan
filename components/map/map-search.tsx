"use client"

import React, { useState, useEffect } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import { useMap } from "react-map-gl/mapbox"

export function MapSearch({ onSelect }: { onSelect?: (location: any) => void }) {
    const { current: map } = useMap()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const delayId = setTimeout(async () => {
            if (!query.trim() || query.length < 3) {
                setResults([])
                return
            }
            setIsSearching(true)
            try {
                const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
                // Using Mapbox Geocoding v5 or Searchbox v1
                const res = await fetch(
                    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
                        query
                    )}&access_token=${token}&session_token=random-session-123&country=SA&limit=5`
                )
                const data = await res.json()
                setResults(data.suggestions ?? [])
                setIsOpen(true)
            } catch (err) {
                console.error(err)
            } finally {
                setIsSearching(false)
            }
        }, 400)
        return () => clearTimeout(delayId)
    }, [query])

    const handleSelect = async (suggestion: any) => {
        try {
            setIsSearching(true)
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
            const res = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${token}&session_token=random-session-123`
            )
            const data = await res.json()
            const feature = data.features?.[0]
            if (feature && map) {
                const coords = feature.geometry.coordinates
                map.flyTo({
                    center: coords,
                    zoom: 16,
                    speed: 2,
                    duration: 1500,
                    pitch: 60,
                })
                setQuery(suggestion.name)
                setIsOpen(false)
                if (onSelect) onSelect(feature)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90vw] max-w-md z-40">
            <div className="bg-background border border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300">
                <div className="flex items-center px-4 py-3 gap-3">
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 2 && setIsOpen(true)}
                        placeholder="Search locations or addresses..."
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm font-medium"
                    />
                    {isSearching && <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />}
                    {query && !isSearching && (
                        <button
                            onClick={() => {
                                setQuery("")
                                setResults([])
                                setIsOpen(false)
                            }}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {isOpen && results.length > 0 && (
                    <div className="max-h-[60vh] overflow-y-auto border-t border-border bg-background">
                        {results.map((result) => (
                            <button
                                key={result.mapbox_id}
                                onClick={() => handleSelect(result)}
                                className="w-full flex items-start px-4 py-3 hover:bg-muted text-left transition-colors border-b border-border/50 last:border-0 gap-3"
                            >
                                <div className="bg-muted p-2 rounded-full shrink-0 text-primary mt-0.5">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{result.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{result.place_formatted}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
