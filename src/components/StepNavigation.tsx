'use client';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  stepLabels: string[];
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  stepLabels,
}: StepNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-sm border-t border-[#30363d]">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
            canGoPrev
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Desktop step indicators */}
        <div className="hidden md:flex items-center gap-4">
          {stepLabels.map((label, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-cyan-500 text-white glow-cyan'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  index === currentStep ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
              {index < totalSteps - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile step indicators */}
        <div className="flex md:hidden items-center gap-1.5">
          {stepLabels.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-cyan-500 w-4'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
            canGoNext
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 glow-cyan'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
