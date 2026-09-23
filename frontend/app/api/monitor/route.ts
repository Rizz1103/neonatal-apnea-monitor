import { NextResponse } from "next/server";

export async function GET() {
  // ============================================================
  // SIMULATED VITAL SIGNS
  // ============================================================

  const heartRate =
    125 + Math.round((Math.random() - 0.5) * 10);

  const respirationRate =
    38 + Math.round((Math.random() - 0.5) * 6);

  const riskProbability = Number(
    (0.08 + Math.random() * 0.08).toFixed(3)
  );

  // ============================================================
  // SIMULATED ECG WAVEFORM
  // 100 samples representing a short ECG segment
  // ============================================================

  const ecg = Array.from({ length: 100 }, (_, i) => {
    const t = i / 100;

    // Basic cardiac waveform components
    const baseline =
      0.02 * Math.sin(2 * Math.PI * 2 * t);

    const pWave =
      0.12 *
      Math.exp(
        -Math.pow((t - 0.20) / 0.035, 2)
      );

    const qWave =
      -0.18 *
      Math.exp(
        -Math.pow((t - 0.39) / 0.012, 2)
      );

    const rWave =
      1.0 *
      Math.exp(
        -Math.pow((t - 0.40) / 0.018, 2)
      );

    const sWave =
      -0.25 *
      Math.exp(
        -Math.pow((t - 0.43) / 0.014, 2)
      );

    const tWave =
      0.30 *
      Math.exp(
        -Math.pow((t - 0.65) / 0.07, 2)
      );

    const noise =
      (Math.random() - 0.5) * 0.04;

    return Number(
      (
        baseline +
        pWave +
        qWave +
        rWave +
        sWave +
        tWave +
        noise
      ).toFixed(4)
    );
  });

  // ============================================================
  // SIMULATED RESPIRATION WAVEFORM
  // ============================================================

  const respiration = Array.from(
    { length: 100 },
    (_, i) => {
      const t = i / 100;

      const waveform =
        Math.sin(2 * Math.PI * 0.65 * t);

      const harmonic =
        0.15 *
        Math.sin(2 * Math.PI * 1.3 * t);

      const noise =
        (Math.random() - 0.5) * 0.05;

      return Number(
        (waveform + harmonic + noise).toFixed(4)
      );
    }
  );

  // ============================================================
  // API RESPONSE
  // ============================================================

  return NextResponse.json({
    timestamp: new Date().toISOString(),

    system: {
      status: "online",
      device: "Raspberry Pi",
      model: "INT8 TFLite",
      windowSeconds: 15,
    },

    heartRate: {
      bpm: heartRate,
      unit: "BPM",
    },

    respiration: {
      bpm: respirationRate,
      unit: "BPM",
    },

    risk: {
      probability: riskProbability,
      status:
        riskProbability >= 0.5
          ? "critical"
          : "normal",
    },

    signals: {
      ecgConnected: false,
      respirationConnected: false,
    },

    waveforms: {
      ecg,
      respiration,
    },
  });
}