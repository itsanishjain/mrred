// Loading animation component
export const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-red-500">
    <div className="w-24 h-24 border-4 border-red-800 border-t-red-500 rounded-full animate-spin mb-8"></div>

    <div className="text-center space-y-4">
      <h2 className="text-xl tracking-wider">INITIALIZING MR.RED</h2>

      <div className="flex items-center justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 bg-red-600 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          ></div>
        ))}
      </div>

      <div className="max-w-md mx-auto px-4 py-2 border border-red-800/50 bg-black/80 text-xs">
        <p className="typing-animation overflow-hidden whitespace-nowrap border-r-2 border-red-500 animate-typing">
          ESTABLISHING SECURE CONNECTION...
        </p>
      </div>
    </div>

    <div className="mt-8 grid grid-cols-2 gap-1 text-xs text-red-700">
      <div>SYSTEM CHECK</div>
      <div className="text-green-500">PASSED</div>
      <div>SECURITY PROTOCOLS</div>
      <div className="text-green-500">ACTIVE</div>
      <div>NEURAL INTERFACE</div>
      <div className="text-yellow-500 animate-pulse">CONNECTING</div>
    </div>
  </div>
);
