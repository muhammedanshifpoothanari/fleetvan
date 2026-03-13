"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/app-context"
import { Illicon } from "@/components/illicon"
import { useHaptics } from "@/hooks/use-haptics"
import { useAudio } from "@/hooks/use-audio"

export function DynamicIsland() {
    const { state, activeNote, goTo } = useApp()
    const haptics = useHaptics()
    const { playPop } = useAudio()
    const [isExpanded, setIsExpanded] = useState(false)
    const ludic = state.ludicrousMode

    // Only show if driver is in route and we are NOT on the navigation or map screens
    const isVisible = state.driverStatus === "in_route" && !["navigation", "map", "launcher", "driver-portal", "company-portal"].includes(state.screen)

    if (!isVisible) return null

    const currentStop = activeNote?.stops[state.currentStopIndex]
    const nextStopName = currentStop?.customerName || "Completed"

    return (
        <div className="fixed top-2 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            <motion.button
                layout
                onClick={() => {
                    haptics.medium()
                    playPop(!isExpanded)
                    if (!isExpanded) {
                        setIsExpanded(true)
                        // Auto-collapse after 5s if they just peeked
                        setTimeout(() => setIsExpanded(false), 5000)
                    } else {
                        goTo("navigation")
                        setIsExpanded(false)
                    }
                }}
                className="pointer-events-auto bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center cursor-pointer"
                style={{ borderRadius: 32 }}
                initial={{ y: -50, scale: 0.8, opacity: 0 }}
                animate={{
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    width: isExpanded ? "94%" : 140,
                    height: isExpanded ? 100 : 40,
                }}
                exit={{ y: -50, scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
                <AnimatePresence mode="popLayout">
                    {!isExpanded ? (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-4 h-full"
                        >
                            <div className="w-2 h-2 rounded-full bg-ugreen animate-pulse" />
                            <span className="text-white text-[12px] font-bold tracking-wide">In Route</span>
                            <Illicon name="destination" size={14} color="text-ugreen" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col w-full h-full px-5 py-3 justify-between"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-ugreen/20 flex items-center justify-center">
                                        <Illicon name="destination" size={20} color="text-ugreen" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Next Stop</p>
                                        <p className="text-[15px] font-black text-white truncate max-w-[180px]">{nextStopName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[16px] font-black text-ugreen">8 min</p>
                                    <p className="text-[11px] font-bold text-white/50">2.4 km</p>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    className={`h-full ${ludic ? "bg-cyan-400" : "bg-ugreen"}`}
                                    animate={{ width: ["0%", "100%"] }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${ludic ? "bg-cyan-400 animate-pulse" : "bg-ugreen"}`} />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                                        {ludic ? "X-Link: 12ms Ultra" : "Starlink: Connected"}
                                    </span>
                                </div>
                                <Illicon name="check-circle" size={14} color={ludic ? "text-cyan-400" : "text-ugreen"} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
