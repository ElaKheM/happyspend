export default function FullBleed() {
  return (
    <div className="relative mx-auto flex h-[100dvh] min-h-screen w-full max-w-[390px] flex-col overflow-hidden bg-black font-sans shadow-2xl sm:h-[844px] sm:min-h-[844px] sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-900 sm:my-8">
      {/* Background Image */}
      <img
        src="/__mockup/images/onboarding-hero.png"
        alt="Atmospheric stacked stones"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

      {/* Progress Indicator */}
      <div className="absolute inset-x-0 top-0 z-10 flex gap-2 px-6 pt-12">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
          <div className="h-full w-full rounded-full bg-white"></div>
        </div>
        <div className="h-1 flex-1 rounded-full bg-white/30"></div>
        <div className="h-1 flex-1 rounded-full bg-white/30"></div>
      </div>

      {/* Content Bottom Third */}
      <div className="relative z-10 mt-auto flex flex-col px-6 pb-12 pt-32">
        <h1 className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md">
          Become someone who's good with money.
        </h1>
        <p className="mb-10 text-lg font-medium text-white/70 drop-shadow">
          No guilt. No spreadsheets. Just who you want to be.
        </p>

        <button
          type="button"
          className="flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition-transform hover:scale-[1.02] active:scale-95"
          onClick={() => {}}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
