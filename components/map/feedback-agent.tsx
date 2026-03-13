"use client"

import React, { useState } from "react"
import { Mic, MessageSquare, X, Send } from "lucide-react"

export function FeedbackAgent() {
    const [isOpen, setIsOpen] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [text, setText] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim() && !isRecording) return
        // Mock save logic
        console.log("Feedback submitted:", text)
        setText("")
        setIsOpen(false)
        setIsRecording(false)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-24 right-4 z-40 bg-white/90 backdrop-blur rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.15)] flex items-center gap-2 px-4 py-2 hover:scale-105 transition-transform border border-border text-black active:bg-gray-100 outline-none"
            >
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold leading-none">Report Issue</span>
            </button>
        )
    }

    return (
        <div className="absolute top-24 right-4 w-[85vw] max-w-[320px] bg-background border border-border rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Feedback Agent
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
                Notice a missing road, hazard, or wrong ETA? Report it securely.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe the map issue..."
                    rows={3}
                    className="w-full bg-muted border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none placeholder-muted-foreground text-foreground"
                />

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsRecording(!isRecording)}
                        className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${isRecording ? "bg-red-500/10 text-red-500 border border-red-500/50" : "bg-muted text-foreground border border-border hover:bg-muted/80"
                            }`}
                    >
                        <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
                        {isRecording ? "Recording..." : "Voice Report"}
                    </button>

                    <button
                        type="submit"
                        disabled={!text.trim() && !isRecording}
                        className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
