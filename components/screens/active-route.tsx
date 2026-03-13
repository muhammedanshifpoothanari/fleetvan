"use client"

export default function ActiveRoute({ onBack, onNext }: { onBack: () => void; onNext?: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f7f7f7]">
      {/* Map Background */}
      <div className="absolute inset-0 z-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKEX0QyobuZ4m_z2BpENwUpO-5eF8mI8SM9fhttFRH9McJbn50r6IqjDDoTc9PSurLAnpy5TwOMDiDagIKZETCRdJ3pcChxgjgN-TVzJpPnubH8ROsSyj3zOlMWuZUqZF8CiE2DijNuAsYYdazjRz6Jk-gMgp4wsbMJC1cIwxIqMDOruonlLQSIJGK3bcO-MymqGpiCvKjF_oFUGwuzQpY35BYa0D_3JW8aRsQtpSwXNuXlEilfm2AJC1KgZ0UUoH9CLIHfQoWy03j')` }}>
        <div className="absolute inset-0 bg-white/10" />
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <path d="M180 150 L180 350 L280 450" fill="none" stroke="#276EF1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }} />
        </svg>
        <div className="absolute top-[140px] left-[165px] flex flex-col items-center z-10">
          <div className="bg-[#141414] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">1</div>
          <div className="w-1 h-3 bg-[#141414]" />
        </div>
        <div className="absolute top-[100px] left-[280px] flex flex-col items-center z-0 opacity-70">
          <div className="bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">2</div>
        </div>
        <div className="absolute top-[440px] left-[270px] z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="w-full h-full bg-[#276EF1]/20 rounded-full animate-pulse absolute" />
            <div className="w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center relative z-10">
              <div className="w-3 h-3 bg-[#276EF1] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* UI Overlay */}
      <div className="relative z-30 flex flex-col justify-between h-full pointer-events-none">
        {/* Top Nav HUD */}
        <div className="pointer-events-auto p-4 pt-12">
          <div className="bg-[#141414] text-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center p-4 pb-2">
              <button onClick={onBack} className="mr-3">
                <span className="material-symbols-outlined text-white text-2xl">arrow_back</span>
              </button>
              <span className="material-symbols-outlined text-4xl mr-3 font-bold">turn_right</span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold leading-tight">Turn right in 200m</span>
                <span className="text-base text-gray-300 font-medium mt-1">King Fahd Road</span>
              </div>
            </div>
            <div className="h-2 bg-gray-700 w-full flex">
              <div className="w-1/3 bg-gray-700 border-r border-gray-600" />
              <div className="w-1/3 bg-white border-r border-gray-600" />
              <div className="w-1/3 bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Bottom Action Sheet */}
        <div className="pointer-events-auto w-full">
          <div className="flex justify-between items-end px-4 mb-4">
            <button onClick={() => alert("Feature coming soon")} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#141414]">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col gap-3">
              <button onClick={() => alert("Feature coming soon")} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#141414]">
                <span className="material-symbols-outlined">my_location</span>
              </button>
              <button onClick={() => alert("Feature coming soon")} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">shield</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-8">
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-black text-white text-xs font-bold px-2 py-1 rounded">3 min</div>
                <span className="text-gray-500 text-sm font-medium">{"1.2 km \u2022 10:42 AM drop-off"}</span>
              </div>
              <button onClick={() => alert("Feature coming soon")} className="text-gray-400"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>
            <div className="px-5 pt-4 pb-6">
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-[#141414]">Ahmed Al-Farsi</h2>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                    <span>Customer</span><span>{"\u2022"}</span>
                    <div className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded text-[#141414]">
                      <span>4.9</span>
                      <span className="material-symbols-outlined text-[14px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => alert("Feature coming soon")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#141414]">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <button onClick={() => alert("Feature coming soon")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#141414]">
                    <span className="material-symbols-outlined">chat_bubble</span>
                  </button>
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-green-800 uppercase tracking-wide">Collect Cash</span>
                    <span className="text-lg font-bold text-[#141414]">450 SAR</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <button onClick={() => onNext?.()} className="w-full bg-[#141414] text-white font-bold text-lg h-14 rounded-lg shadow-lg flex items-center justify-center tracking-wide active:scale-[0.98] transition-all">
                ARRIVED
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
