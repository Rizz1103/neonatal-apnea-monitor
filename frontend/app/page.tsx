"use client";

import { useEffect, useState } from "react";
import MonitorSidebar from "@/components/monitor-sidebar";
import SignalWaveform from "@/components/signal-waveform";

type MonitorData = {
  timestamp: string;

  system: {
    status: string;
    device: string;
    model: string;
    windowSeconds: number;
  };

  heartRate: {
    bpm: number;
    unit: string;
  };

  respiration: {
    bpm: number;
    unit: string;
  };

  risk: {
    probability: number;
    status: string;
  };

  signals: {
    ecgConnected: boolean;
    respirationConnected: boolean;
  };

  waveforms: {
    ecg: number[];
    respiration: number[];
  };
};

export default function Home() {
  const [monitorData, setMonitorData] =
    useState<MonitorData | null>(null);

  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMonitorData = async () => {
      try {
        const response = await fetch("/api/monitor", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Monitor API request failed");
        }

        const data: MonitorData = await response.json();

        if (isMounted) {
          setMonitorData(data);
          setApiError(false);
        }
      } catch (error) {
        console.error("Monitor API error:", error);

        if (isMounted) {
          setApiError(true);
        }
      }
    };

    fetchMonitorData();

    const interval = setInterval(
      fetchMonitorData,
      1000
    );

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const systemOnline =
    monitorData?.system.status === "online" &&
    !apiError;

  const riskProbability = monitorData
    ? monitorData.risk.probability * 100
    : null;

  const riskStatus =
    monitorData?.risk.status === "critical"
      ? "Critical"
      : "Normal";

  const riskValueClass =
    monitorData?.risk.status === "critical"
      ? "text-red-400"
      : "text-emerald-400";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <MonitorSidebar />

      {/* Main Dashboard */}
      <main className="min-w-0 flex-1">

        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <div>
              <h1 className="text-xl font-semibold">
                Neonatal Apnea Monitor
              </h1>

              <p className="text-sm text-slate-400">
                Edge-deployed cardiorespiratory risk monitoring
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                  systemOnline
                    ? "border-emerald-800 bg-emerald-950 text-emerald-400"
                    : "border-red-800 bg-red-950 text-red-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    systemOnline
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />

                {systemOnline
                  ? "System Online"
                  : "System Offline"}
              </span>
            </div>

          </div>
        </header>

        {/* Dashboard Content */}
        <section className="mx-auto max-w-7xl px-6 py-6">

          {/* Monitoring Session */}
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:flex-row md:items-center">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Monitoring Session
              </p>

              <h2 className="mt-1 text-lg font-medium">
                Neonatal Monitoring Unit
              </h2>
            </div>

            <div className="flex gap-6 text-sm">

              <div>
                <p className="text-slate-500">
                  Device
                </p>

                <p className="font-medium">
                  {monitorData?.system.device ??
                    "Raspberry Pi"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Model
                </p>

                <p className="font-medium">
                  {monitorData?.system.model ??
                    "INT8 TFLite"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Window
                </p>

                <p className="font-medium">
                  {monitorData?.system.windowSeconds ??
                    15}{" "}
                  seconds
                </p>
              </div>

            </div>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* Risk Status */}
            <StatusCard
              title="Risk Status"
              value={
                monitorData
                  ? riskStatus
                  : "--"
              }
              description={
                monitorData
                  ? riskStatus === "Critical"
                    ? "Elevated risk detected"
                    : "No elevated risk detected"
                  : "Waiting for model output"
              }
              valueClass={
                monitorData
                  ? riskValueClass
                  : "text-slate-200"
              }
            />

            {/* Heart Rate */}
            <StatusCard
              title="Heart Rate"
              value={
                monitorData
                  ? `${monitorData.heartRate.bpm} ${monitorData.heartRate.unit}`
                  : "-- BPM"
              }
              description={
                monitorData
                  ? "Live simulated ECG value"
                  : "Awaiting ECG signal"
              }
              valueClass="text-slate-200"
            />

            {/* Respiration */}
            <StatusCard
              title="Respiration"
              value={
                monitorData
                  ? `${monitorData.respiration.bpm} ${monitorData.respiration.unit}`
                  : "-- BPM"
              }
              description={
                monitorData
                  ? "Live simulated respiration value"
                  : "Awaiting respiration signal"
              }
              valueClass="text-slate-200"
            />

            {/* Risk Probability */}
            <StatusCard
              title="Risk Probability"
              value={
                riskProbability !== null
                  ? `${riskProbability.toFixed(1)} %`
                  : "-- %"
              }
              description={
                monitorData
                  ? "Model output"
                  : "Waiting for model output"
              }
              valueClass={
                monitorData
                  ? riskValueClass
                  : "text-slate-200"
              }
            />

          </div>

          {/* Main Monitoring Area */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">

            {/* ECG */}
            <SignalCard
              title="ECG"
              description="Electrocardiogram waveform"
              connected={
                monitorData?.signals.ecgConnected ??
                false
              }
              waveform={
                monitorData?.waveforms.ecg ?? []
              }
              type="ecg"
            />

            {/* Respiration */}
            <SignalCard
              title="Respiration"
              description="Respiratory waveform"
              connected={
                monitorData?.signals
                  .respirationConnected ??
                false
              }
              waveform={
                monitorData?.waveforms
                  .respiration ?? []
              }
              type="respiration"
            />

            {/* Risk Prediction */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-4">
                <h3 className="font-medium">
                  Risk Prediction
                </h3>

                <p className="text-sm text-slate-500">
                  Edge model output
                </p>
              </div>

              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950">

                <div className="w-full px-8 text-center">

                  {riskProbability !== null ? (
                    <>
                      <p className="text-sm text-slate-400">
                        Current risk probability
                      </p>

                      <p
                        className={`mt-3 text-4xl font-semibold ${riskValueClass}`}
                      >
                        {riskProbability.toFixed(1)}%
                      </p>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            riskStatus === "Critical"
                              ? "bg-red-400"
                              : "bg-emerald-400"
                          }`}
                          style={{
                            width: `${Math.min(
                              riskProbability,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                      <p className="mt-3 text-xs text-slate-600">
                        Live model output
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500">
                        Prediction graph
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Waiting for model output
                      </p>
                    </>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* System Information */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

            <h3 className="font-medium">
              System Information
            </h3>

            <div className="mt-4 grid gap-4 text-sm md:grid-cols-4">

              <InfoItem
                label="ECG"
                value={
                  monitorData?.signals.ecgConnected
                    ? "Connected"
                    : "Simulated"
                }
              />

              <InfoItem
                label="Respiration"
                value={
                  monitorData?.signals
                    .respirationConnected
                    ? "Connected"
                    : "Simulated"
                }
              />

              <InfoItem
                label="Thermistor"
                value="Waiting"
              />

              <InfoItem
                label="Inference Engine"
                value={
                  monitorData?.system.model ??
                  "INT8 TFLite"
                }
              />

            </div>
          </div>

          {/* Data Source Notice */}
          <div className="mt-6 rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3">

            <p className="text-xs text-amber-400">
              Development mode: sensor values,
              waveforms and risk probability are
              currently simulated through the
              monitoring API. Raspberry Pi sensor
              integration will replace this data
              source.
            </p>

          </div>

        </section>
      </main>
    </div>
  );
}


/* ============================================================
   STATUS CARD
   ============================================================ */

function StatusCard({
  title,
  value,
  description,
  valueClass,
}: {
  title: string;
  value: string;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   SIGNAL CARD
   ============================================================ */

function SignalCard({
  title,
  description,
  connected,
  waveform,
  type,
}: {
  title: string;
  description: string;
  connected: boolean;
  waveform: number[];
  type: "ecg" | "respiration";
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="mb-4">
        <h3 className="font-medium">
          {title}
        </h3>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>

      {/* Reusable waveform component */}
      <SignalWaveform
        waveform={waveform}
        type={type}
        connected={connected}
      />

    </div>
  );
}


/* ============================================================
   INFORMATION ITEM
   ============================================================ */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value}
      </p>

    </div>
  );
}