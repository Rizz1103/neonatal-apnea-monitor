"use client";

type SignalWaveformProps = {
  waveform: number[];
  type: "ecg" | "respiration";
  connected: boolean;
};

export default function SignalWaveform({
  waveform,
  type,
  connected,
}: SignalWaveformProps) {
  return (
    <div className="relative h-64 overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
      {waveform.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute left-0 right-0 top-1/4 border-t border-slate-800" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-slate-800" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-slate-800" />

            <div className="absolute bottom-0 left-1/4 top-0 border-l border-slate-800" />
            <div className="absolute bottom-0 left-1/2 top-0 border-l border-slate-800" />
            <div className="absolute bottom-0 left-3/4 top-0 border-l border-slate-800" />
          </div>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <polyline
              fill="none"
              stroke={type === "ecg" ? "#34d399" : "#60a5fa"}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              points={createWaveformPoints(waveform)}
            />
          </svg>

          <div className="absolute bottom-3 left-3 rounded-md bg-slate-950/80 px-2 py-1">
            <p className="text-xs text-slate-500">
              {connected ? "Live signal" : "Simulated signal"}
            </p>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Live waveform
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Waiting for signal
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function createWaveformPoints(waveform: number[]): string {
  if (waveform.length === 0) {
    return "";
  }

  const min = Math.min(...waveform);
  const max = Math.max(...waveform);

  const range = max - min === 0 ? 1 : max - min;

  return waveform
    .map((value, index) => {
      const x = (index / (waveform.length - 1)) * 100;
      const normalized = (value - min) / range;
      const y = 85 - normalized * 70;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
