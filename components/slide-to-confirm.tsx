"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { Illicon, type IlliconName } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { useAudio } from "@/hooks/use-audio"

interface SlideToConfirmProps {
    onConfirm: () => void
    disabled?: boolean
    label?: string
    successLabel?: string
    icon?: IlliconName
}

export function SlideToConfirm({
    onConfirm,
    disabled = false,
    label = "SLIDE TO DEPART",
    successLabel = "DEPARTED",
    icon = "van-depart",
}: SlideToConfirmProps) {
    const haptics = useHaptics()
    const { playSuccess } = useAudio()
    const [completed, setCompleted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const knobRef = useRef<HTMLDivElement>(null)

    const width = containerRef.current?.offsetWidth || 300
    const knobWidth = knobRef.current?.offsetWidth || 56
    const dragConstraints = width - knobWidth - 8 // 4px padding on each side

    const x = useMotionValue(0)
    const controls = useAnimation()

    // Track drag to provide haptic feedback at certain points
    useEffect(() => {
        let playedMedium = false
        const unsubscribe = x.onChange((latest) => {
            if (latest > dragConstraints * 0.5 && !playedMedium) {
                haptics.light()
                playedMedium = true
            }
            if (latest < dragConstraints * 0.4) {
                playedMedium = false
            }
        })
        return unsubscribe
    }, [x, dragConstraints, haptics])

    // Color interpolation based on drag progress
    const bgWarning = "rgba(6,193,103, 0.2)"
    const bgSuccess = "rgba(6,193,103, 1)"
    const containerBg = useTransform(
        x,
        [0, dragConstraints],
        [disabled ? "rgba(255,255,255,0.05)" : bgWarning, disabled ? "rgba(255,255,255,0.05)" : bgSuccess]
    )

    const handleDragEnd = async () => {
        if (disabled || completed) return
        const currentX = x.get()

        // If dragged past 80%, assume confirmation
        if (currentX > dragConstraints * 0.8) {
            haptics.heavy()
            playSuccess()
            setCompleted(true)
            await controls.start({ x: dragConstraints, transition: { type: "spring", stiffness: 400, damping: 30 } })
            onConfirm()
        } else {
            haptics.light()
            controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } })
        }
    }

    return (
        <motion.div
            ref={containerRef}
            className={`relative w-full h-[58px] rounded-xl flex items-center overflow-hidden border ${disabled ? "border-white/5" : "border-ugreen/20"
                }`}
            style={{ backgroundColor: disabled ? "rgba(255,255,255,0.05)" : containerBg }}
        >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span
                    className={`text-[15px] font-black tracking-widest uppercase transition-opacity duration-300 ${completed ? "opacity-0" : disabled ? "text-white/30" : "text-ugreen shadow-black drop-shadow-md"
                        }`}
                >
                    {label}
                </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <span
                    className={`text-[15px] font-black tracking-widest uppercase text-black transition-opacity duration-300 ${completed ? "opacity-100" : "opacity-0"
                        }`}
                >
                    {successLabel}
                </span>
            </div>

            <motion.div
                ref={knobRef}
                drag={disabled || completed ? false : "x"}
                dragConstraints={{ left: 0, right: dragConstraints }}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                whileTap={{ scale: disabled || completed ? 1 : 0.95 }}
                whileHover={{ scale: disabled || completed ? 1 : 1.05 }}
                className={`absolute left-1 z-10 w-[50px] h-[50px] rounded-lg flex items-center justify-center shadow-lg ${disabled ? "bg-white/10" : completed ? "bg-black" : "bg-ugreen cursor-grab active:cursor-grabbing"
                    }`}
            >
                <Illicon
                    name={completed ? "check-circle" : "arrow-right"}
                    size={24}
                    filled={completed}
                    color={disabled ? "text-white/30" : completed ? "text-ugreen" : "text-black"}
                />
            </motion.div>
        </motion.div>
    )
}
