"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { motion, useAnimation, useMotionValue, type PanInfo } from "framer-motion"

interface BottomSheetProps {
    children: ReactNode
    snapPoints?: number[] // e.g., [0, -300] for expanded/collapsed states
    initialSnap?: number
    className?: string
}

export function BottomSheet({ children, snapPoints = [0], initialSnap = 0, className = "bg-background dark:bg-u100" }: BottomSheetProps) {
    const controls = useAnimation()
    const y = useMotionValue(initialSnap)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        controls.start({
            y: initialSnap,
            transition: { type: "spring", stiffness: 300, damping: 30, mass: 1 },
        })
    }, [controls, initialSnap])

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const currentY = y.get()
        const velocity = info.velocity.y

        // Predict where it will land based on velocity
        const targetY = currentY + velocity * 0.1

        // Find the closest snap point
        const closestSnap = snapPoints.reduce((prev, curr) => {
            return Math.abs(curr - targetY) < Math.abs(prev - targetY) ? curr : prev
        })

        controls.start({
            y: closestSnap,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
            },
        })
    }

    return (
        <motion.div
            ref={containerRef}
            drag="y"
            dragConstraints={{ top: Math.min(...snapPoints) - 20, bottom: Math.max(...snapPoints) + 20 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ y }}
            initial={{ y: 500 }}
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.15)] z-30 overflow-hidden flex flex-col will-change-transform pb-safe ${className}`}
        >
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="flex-1 w-full flex flex-col pointer-events-auto">
                {children}
            </div>
        </motion.div>
    )
}
