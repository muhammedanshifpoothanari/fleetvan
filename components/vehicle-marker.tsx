"use client"

/**
 * Toyota HiAce-style top-down vehicle marker with heading rotation.
 * The iconic GCC delivery van — boxy, wide windshield, sliding door line.
 */
export function VehicleMarker({
    heading = 0,
    color = "#06c167",
    size = 44,
    label,
    isActive = true,
    isIssue = false,
}: {
    heading?: number
    color?: string
    size?: number
    label?: string
    isActive?: boolean
    isIssue?: boolean
}) {
    const c = isIssue ? "#ef4444" : color

    return (
        <div className="flex flex-col items-center" style={{ width: size + 20, height: size + (label ? 28 : 12) }}>
            {/* Pulsing halo for active */}
            {isActive && !isIssue && (
                <div
                    className="absolute rounded-full"
                    style={{
                        width: size + 18,
                        height: size + 18,
                        top: -5,
                        left: 1,
                        border: `2px solid ${c}35`,
                        animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                />
            )}

            {/* HiAce SVG — top-down, rotated by heading */}
            <div
                className="relative z-10"
                style={{
                    transform: `rotate(${heading}deg)`,
                    transition: "transform 1.2s cubic-bezier(0.25,0.1,0.25,1)",
                    width: size,
                    height: size * 1.35,
                }}
            >
                <svg
                    viewBox="0 0 48 65"
                    width={size}
                    height={size * 1.35}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Drop shadow */}
                    <ellipse cx="24" cy="62" rx="16" ry="3" fill="black" opacity="0.25" />

                    {/* Main body — boxy HiAce shape */}
                    <rect x="8" y="5" width="32" height="54" rx="7" ry="7" fill={c} />
                    <rect x="8" y="5" width="32" height="54" rx="7" ry="7" fill="white" fillOpacity="0.05" />

                    {/* Roof ridge lines */}
                    <line x1="15" y1="22" x2="15" y2="48" stroke="white" strokeOpacity="0.08" strokeWidth="0.7" />
                    <line x1="33" y1="22" x2="33" y2="48" stroke="white" strokeOpacity="0.08" strokeWidth="0.7" />

                    {/* Windshield — large, wide (HiAce signature) */}
                    <rect x="11" y="7" width="26" height="12" rx="4" fill="white" opacity="0.9" />
                    {/* Windshield reflection */}
                    <rect x="13" y="9" width="10" height="3" rx="1.5" fill="white" opacity="0.3" />

                    {/* Windshield pillars (A-pillars) */}
                    <rect x="11" y="7" width="2" height="12" rx="1" fill={c} opacity="0.6" />
                    <rect x="35" y="7" width="2" height="12" rx="1" fill={c} opacity="0.6" />

                    {/* Cargo area (roof) */}
                    <rect x="11" y="20" width="26" height="28" rx="2" fill={c} />
                    <rect x="11" y="20" width="26" height="28" rx="2" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />

                    {/* Sliding door line — HiAce signature detail */}
                    <line x1="36" y1="24" x2="36" y2="42" stroke="white" strokeOpacity="0.15" strokeWidth="0.8" />

                    {/* Rear window */}
                    <rect x="14" y="50" width="20" height="6" rx="3" fill="white" opacity="0.45" />

                    {/* Tail lights */}
                    <rect x="10" y="55" width="6" height="3" rx="1.5" fill="#ff3b3b" opacity="0.8" />
                    <rect x="32" y="55" width="6" height="3" rx="1.5" fill="#ff3b3b" opacity="0.8" />

                    {/* Side mirrors — angular HiAce style */}
                    <rect x="4" y="11" width="5" height="4" rx="2" fill={c} />
                    <rect x="4" y="11" width="5" height="4" rx="2" stroke="white" strokeOpacity="0.2" strokeWidth="0.4" />
                    <rect x="39" y="11" width="5" height="4" rx="2" fill={c} />
                    <rect x="39" y="11" width="5" height="4" rx="2" stroke="white" strokeOpacity="0.2" strokeWidth="0.4" />

                    {/* Front headlights */}
                    <rect x="10" y="5" width="5" height="3" rx="1.5" fill="#fffbe6" opacity="0.9" />
                    <rect x="33" y="5" width="5" height="3" rx="1.5" fill="#fffbe6" opacity="0.9" />

                    {/* Heading arrow at front */}
                    <polygon points="24,0 20,5 28,5" fill="white" opacity="0.85" />
                </svg>
            </div>

            {/* Ground shadow */}
            <div
                className="rounded-[50%] blur-[5px] -mt-1"
                style={{
                    width: size * 0.65,
                    height: size * 0.15,
                    backgroundColor: `${c}40`,
                }}
            />

            {/* Plate label */}
            {label && (
                <div className="mt-0.5 bg-black/85 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                    {label}
                </div>
            )}
        </div>
    )
}

/**
 * Uber blue driver dot
 */
export function DriverDot({ size = 48 }: { size?: number }) {
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: "rgba(39,110,241,0.15)", animationDuration: "2.5s" }}
            />
            <div
                className="absolute rounded-full animate-pulse"
                style={{ inset: size * 0.15, backgroundColor: "rgba(39,110,241,0.1)" }}
            />
            <div
                className="relative rounded-full shadow-lg z-10"
                style={{
                    width: size * 0.35,
                    height: size * 0.35,
                    backgroundColor: "#276ef1",
                    border: `${size * 0.06}px solid white`,
                    boxShadow: "0 2px 12px rgba(39,110,241,0.5)",
                }}
            />
        </div>
    )
}
