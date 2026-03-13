"use client"

import { useCallback, useEffect, useRef } from "react"

export function useAudio() {
    const audioCtx = useRef<AudioContext | null>(null)

    useEffect(() => {
        // Only initialize on user interaction to satisfy browser policies
        // but we can prepare the reference
        return () => {
            if (audioCtx.current) {
                audioCtx.current.close()
            }
        }
    }, [])

    const init = useCallback(() => {
        if (!audioCtx.current && typeof window !== "undefined") {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
    }, [])

    const playClick = useCallback(() => {
        init()
        if (!audioCtx.current) return

        const ctx = audioCtx.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(1200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.05)
    }, [init])

    const playPop = useCallback((isClosing = false) => {
        init()
        if (!audioCtx.current) return

        const ctx = audioCtx.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        const startFreq = isClosing ? 400 : 200
        const endFreq = isClosing ? 200 : 400

        osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }, [init])

    const playSuccess = useCallback(() => {
        init()
        if (!audioCtx.current) return

        const ctx = audioCtx.current
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

        frequencies.forEach((f, i) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = "sine"
            osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05)

            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
            gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.05 + 0.05)
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

            osc.connect(gain)
            gain.connect(ctx.destination)

            osc.start(ctx.currentTime + i * 0.05)
            osc.stop(ctx.currentTime + 0.5)
        })
    }, [init])

    const playSwoosh = useCallback(() => {
        init()
        if (!audioCtx.current) return

        const ctx = audioCtx.current
        const bufferSize = ctx.sampleRate * 0.2
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        const noise = ctx.createBufferSource()
        noise.buffer = buffer

        const filter = ctx.createBiquadFilter()
        filter.type = "lowpass"
        filter.frequency.setValueAtTime(1000, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2)
        filter.Q.value = 1

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        noise.start()
        noise.stop(ctx.currentTime + 0.2)
    }, [init])

    return { playClick, playPop, playSuccess, playSwoosh }
}
