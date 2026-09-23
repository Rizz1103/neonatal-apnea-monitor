/* =========================================================
   NEONATAL APNEA EDGE MONITOR
   Development Simulation Layer
   ========================================================= */

const MonitorSimulation = {
  state: {
    mode: "DEVELOPMENT / SIMULATED",
    edgeNode: "RPI-EDGE-01",
    model: "INT8 / TFLITE",
    windowSeconds: 15,

    heartRate: 138,
    respirationRate: 42,
    spo2: 96,
    temperature: 36.7,

    riskProbability: 0.08,
    riskState: "NORMAL",

    timestamp: Date.now()
  },

  getState() {
    return {
      ...this.state,
      timestamp: Date.now()
    };
  },

  update() {
    const state = this.state;

    // Small physiological variation for development visualization.
    state.heartRate = clamp(
      state.heartRate + randomBetween(-2, 2),
      110,
      175
    );

    state.respirationRate = clamp(
      state.respirationRate + randomBetween(-1, 1),
      25,
      65
    );

    state.spo2 = clamp(
      state.spo2 + randomBetween(-0.2, 0.2),
      90,
      100
    );

    state.temperature = clamp(
      state.temperature + randomBetween(-0.05, 0.05),
      36.0,
      37.5
    );

    state.riskProbability = clamp(
      state.riskProbability + randomBetween(-0.015, 0.015),
      0.01,
      0.35
    );

    state.riskState = getRiskState(state.riskProbability);

    state.timestamp = Date.now();

    return this.getState();
  }
};


/* =========================================================
   HELPERS
   ========================================================= */

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}


function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}


function getRiskState(probability) {
  if (probability >= 0.75) {
    return "CRITICAL";
  }

  if (probability >= 0.40) {
    return "RISING RISK";
  }

  return "NORMAL";
}