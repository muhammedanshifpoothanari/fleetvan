import React from "react"
import { PlusIcon, MinusIcon } from "lucide-react"

import { useMap } from "react-map-gl/mapbox"

export function MapControls() {
    const { current: map } = useMap()

    const zoomIn = () => {
        map?.zoomIn()
    }

    const zoomOut = () => {
        map?.zoomOut()
    }

    return (
        <div className="absolute top-[30%] right-4 z-10 bg-background/90 backdrop-blur p-2 rounded-lg shadow-lg flex flex-col gap-2 border border-border">
            <button
                onClick={zoomIn}
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all outline-none"
            >
                <PlusIcon className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-full h-[1px] bg-border my-1" />
            <button
                onClick={zoomOut}
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all outline-none"
            >
                <MinusIcon className="w-5 h-5 text-foreground" />
            </button>
        </div>
    )
}
