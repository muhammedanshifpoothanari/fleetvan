"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type TransitionType =
  | "drill-forward"
  | "drill-back"
  | "slide-up"
  | "fade"
  | "none"

interface ScreenTransitionProps {
  children: ReactNode
  screenKey: string
  transition: TransitionType
  speed?: number
}

// iPhone 17-style spring physics
const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
}

// Fade physics
const fadeConfig = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.2,
}

function getVariants(type: TransitionType) {
  switch (type) {
    case "drill-forward":
      return {
        initial: { x: "100%", opacity: 1, boxShadow: "-20px 0 20px rgba(0,0,0,0.1)" },
        animate: { x: "0%", opacity: 1, boxShadow: "-20px 0 20px rgba(0,0,0,0.1)" },
        exit: { x: "-30%", opacity: 0.8 },
      }
    case "drill-back":
      return {
        initial: { x: "-30%", opacity: 0.8 },
        animate: { x: "0%", opacity: 1 },
        exit: { x: "100%", opacity: 1, boxShadow: "-20px 0 20px rgba(0,0,0,0.1)" },
      }
    case "slide-up":
      return {
        initial: { y: "100%", opacity: 1, boxShadow: "0 -20px 20px rgba(0,0,0,0.1)" },
        animate: { y: "0%", opacity: 1, boxShadow: "0 -20px 20px rgba(0,0,0,0.1)" },
        exit: { y: "100%", opacity: 1, boxShadow: "0 -20px 20px rgba(0,0,0,0.1)" },
      }
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
  }
}

export default function ScreenTransition({ children, screenKey, transition, speed = 1 }: ScreenTransitionProps) {
  const variants = getVariants(transition)

  const animTransition = transition === "fade"
    ? { ...fadeConfig, duration: fadeConfig.duration * speed }
    : {
      ...springConfig,
      stiffness: springConfig.stiffness / speed,
      damping: springConfig.damping
    }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <AnimatePresence mode={transition === "fade" ? "wait" : "popLayout"} initial={false}>
        <motion.div
          key={screenKey}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={animTransition}
          className="absolute inset-0 h-dvh w-full overflow-hidden flex flex-col will-change-transform bg-background"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
