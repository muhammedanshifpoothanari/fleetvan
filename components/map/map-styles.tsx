"use client"

import React, { useEffect, useState } from "react"
import { MapIcon, MoonIcon, SatelliteIcon, SunIcon, TreesIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useMap } from "react-map-gl/mapbox"

// Define modern Mapbox styles
const STYLE_OPTIONS = [
    { id: "standard", label: "Standard", icon: <MapIcon className="w-5 h-5" /> }, // New Mapbox Standard (3D lighting)
    { id: "satellite-streets-v12", label: "Satellite", icon: <SatelliteIcon className="w-5 h-5" /> },
    { id: "navigation-day-v1", label: "Nav Day", icon: <SunIcon className="w-5 h-5" /> },
    { id: "navigation-night-v1", label: "Nav Night", icon: <MoonIcon className="w-5 h-5" /> },
]

export function MapStyles() {
    const { current: map } = useMap()
    const [activeStyle, setActiveStyle] = useState("standard")
    const [isOpen, setIsOpen] = useState(false)

    const handleChange = (value: string) => {
        if (!map) return
        map.getMap().setStyle(`mapbox://styles/mapbox/${value}`)
        setActiveStyle(value)
        setIsOpen(false)
    }

    return (
        <div className="absolute bottom-32 left-4 z-10 flex flex-col gap-2">
            {isOpen && (
                <div className="bg-background/90 backdrop-blur rounded-xl shadow-lg border border-border overflow-hidden animate-in slide-in-from-bottom-2 flex flex-col">
                    {STYLE_OPTIONS.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleChange(style.id)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeStyle === style.id ? "bg-primary/20 text-primary" : "text-foreground hover:bg-muted"
                                }`}
                        >
                            {style.icon}
                            {style.label}
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-background/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg border border-border border-2 border-primary active:scale-95 transition-all text-foreground"
            >
                <MapIcon className="w-6 h-6" />
            </button>
        </div>
    )
}
