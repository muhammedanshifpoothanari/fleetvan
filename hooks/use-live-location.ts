"use client"

import { useState, useEffect, useRef } from "react"

export interface LiveLocation {
    lat: number
    lng: number
    heading: number
    accuracy: number
    speed: number | null
    timestamp: number
}

/**
 * Live GPS location hook using browser Geolocation API.
 * Returns the latest position with heading + speed.
 * Falls back to a simulated position if geolocation is denied.
 */
export function useLiveLocation(fallbackLat?: number, fallbackLng?: number) {
    // Determine the actual fallback to use (e.g. maybe they passed one, or we default to a safe value)
    const initialLat = fallbackLat ?? 24.7136
    const initialLng = fallbackLng ?? 46.6753

    const [location, setLocation] = useState<LiveLocation>({
        lat: initialLat,
        lng: initialLng,
        heading: 0,
        accuracy: 0,
        speed: null,
        timestamp: Date.now(),
    })
    const [error, setError] = useState<string | null>(null)
    const prevPosition = useRef<{ lat: number; lng: number; heading: number } | null>(null)
    const simInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported")
            startSimulation()
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                // Clear simulation if we get real GPS
                if (simInterval.current) {
                    clearInterval(simInterval.current)
                    simInterval.current = null
                }

                const { latitude, longitude, heading, accuracy, speed } = pos.coords

                // Calculate heading from movement if device doesn't provide it
                let computedHeading = heading ?? 0
                if (prevPosition.current && (heading === null || heading === undefined || isNaN(heading))) {
                    const dLat = latitude - prevPosition.current.lat
                    const dLng = longitude - prevPosition.current.lng
                    // Only compute new heading if we moved significantly
                    if (Math.abs(dLat) > 0.00005 || Math.abs(dLng) > 0.00005) {
                        let newHeading = (Math.atan2(dLng, dLat) * 180) / Math.PI
                        if (newHeading < 0) newHeading += 360

                        // Smoothly transition heading
                        const oldHeading = prevPosition.current.heading
                        // Handle 360 degree wrap-around smoothing
                        let diff = newHeading - oldHeading
                        if (diff > 180) diff -= 360
                        if (diff < -180) diff += 360
                        computedHeading = oldHeading + diff * 0.3 // 30% lerp for smoothness
                    } else {
                        computedHeading = prevPosition.current.heading
                    }
                }
                prevPosition.current = { lat: latitude, lng: longitude, heading: computedHeading }

                setLocation({
                    lat: latitude,
                    lng: longitude,
                    heading: computedHeading,
                    accuracy: accuracy ?? 0,
                    speed: speed,
                    timestamp: pos.timestamp,
                })
                setError(null)
            },
            (err) => {
                setError(err.message)
                // Start simulation if permission denied
                startSimulation()
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0, // Force fresh GPS coordinates every time
                timeout: 5000,
            }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
            if (simInterval.current) clearInterval(simInterval.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /** Simulate realistic vehicle movement on roads around Riyadh */
    function startSimulation() {
        if (simInterval.current) return

        // Simulate a route path — small incremental movements
        let simLat = initialLat
        let simLng = initialLng
        let simHeading = 45
        let step = 0

        simInterval.current = setInterval(() => {
            step++
            // Simulate gentle turns and movement along a road
            simHeading += (Math.random() - 0.5) * 15 // slight heading variation
            const rad = (simHeading * Math.PI) / 180
            const speed = 0.0001 + Math.random() * 0.00015 // varies speed
            simLat += Math.cos(rad) * speed
            simLng += Math.sin(rad) * speed

            setLocation({
                lat: simLat,
                lng: simLng,
                heading: simHeading,
                accuracy: 15,
                speed: 30 + Math.random() * 20,
                timestamp: Date.now(),
            })
        }, 2000)
    }

    return { location, error }
}
