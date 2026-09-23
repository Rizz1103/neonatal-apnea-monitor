/* =========================================================
   NEONATAL APNEA EDGE MONITOR
   LIVE MONITORING SIMULATION
   ========================================================= */

/*
 * Development-only simulation.
 *
 * ECG waveform     -> heart rate
 * Respiration      -> respiration rate
 * PPG waveform     -> heart rate + SpO2
 * Risk meter       -> simulated risk probability
 *
 * IMPORTANT:
 * Physiological rate and visual scrolling speed are
 * intentionally controlled separately.
 */


/* =========================================================
   SHARED STATE
   ========================================================= */

window.liveMonitorState = {
  heartRate: 138,
  respirationRate: 42,
  spo2: 96,
  temperature: 36.7,
  riskProbability: 0.08,
  riskState: "NORMAL",

  /*
   * Animation time in seconds.
   *
   * This is NOT the heart rate.
   * It controls how quickly the displayed waveform
   * moves across the screen.
   */
  waveformTime: 0
};


/* =========================================================
   DISPLAY / ANIMATION SETTINGS
   ========================================================= */

/*
 * The waveform represents a 15-second display window.
 */
var LM_DISPLAY_SECONDS = 15;


/*
 * ECG visual scroll speed.
 *
 * IMPORTANT:
 * This does NOT change the physiological heart rate.
 *
 * 1.0 = waveform advances at real-time speed.
 * 0.18 = deliberately slow visual movement.
 *
 * The ECG still contains the mathematically correct
 * number of beats for the displayed heart rate.
 */
var LM_ECG_SCROLL_SPEED = 0.18;


/*
 * Respiration scroll speed.
 *
 * Kept calm and readable.
 */
var LM_RESP_SCROLL_SPEED = 0.35;


/*
 * PPG visual scroll speed.
 */
var LM_PPG_SCROLL_SPEED = 0.18;


/*
 * Animation interval.
 *
 * 50 ms = 20 visual updates per second.
 */
var LM_ANIMATION_INTERVAL = 50;


/*
 * Amount of simulated time added on each
 * animation frame.
 */
var LM_TIME_STEP =
  LM_ANIMATION_INTERVAL / 1000;


/* =========================================================
   START MONITOR
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    LM_updateWaveforms();

    LM_updateTelemetry();


    /*
     * Physiological telemetry update.
     */
    setInterval(
      function () {
        LM_updateTelemetry();
      },
      1000
    );


    /*
     * Smooth waveform animation.
     */
    setInterval(
      function () {
        LM_updateWaveforms();
      },
      LM_ANIMATION_INTERVAL
    );

  }
);


/* =========================================================
   WAVEFORM UPDATE
   ========================================================= */

function LM_updateWaveforms() {

  /*
   * Advance animation time.
   *
   * This controls only the visual movement.
   * It does NOT modify the physiological rates.
   */
  window.liveMonitorState.waveformTime +=
    LM_TIME_STEP;


  LM_drawECG(
    window.liveMonitorState.heartRate
  );


  LM_drawRespiration(
    window.liveMonitorState.respirationRate
  );


  LM_drawPPG(
    window.liveMonitorState.heartRate,
    window.liveMonitorState.spo2
  );
}


/* =========================================================
   ECG WAVEFORM
   ========================================================= */

function LM_drawECG(heartRate) {

  var path =
    document.getElementById("ecg-path");

  if (!path) {
    return;
  }


  var points = [];

  var width = 1000;
  var height = 220;

  /*
   * High sampling density keeps the waveform smooth.
   */
  var samples = 1200;


  /*
   * ---------------------------------------------------------
   * PHYSIOLOGICAL HEART RATE
   * ---------------------------------------------------------
   *
   * This remains the actual simulated heart rate.
   *
   * Example:
   *
   * 149 BPM / 60 = 2.483 beats/sec
   *
   * Over 15 seconds:
   *
   * 2.483 × 15 ≈ 37.25 beats
   */
  var beatsPerSecond =
    heartRate / 60;


  /*
   * Display window.
   */
  var displaySeconds =
    LM_DISPLAY_SECONDS;


  /*
   * ---------------------------------------------------------
   * VISUAL SCROLL
   * ---------------------------------------------------------
   *
   * This is deliberately independent from heart rate.
   *
   * The trace therefore moves gently without changing
   * the number of cardiac complexes shown in the window.
   */
  var scrollTime =
    window.liveMonitorState.waveformTime *
    LM_ECG_SCROLL_SPEED;


  for (
    var i = 0;
    i < samples;
    i++
  ) {

    var normalizedX =
      i / (samples - 1);


    var x =
      normalizedX * width;


    /*
     * Convert horizontal position into
     * physiological time.
     */
    var time =
      normalizedX * displaySeconds;


    /*
     * Add only the controlled visual movement.
     */
    var cardiacTime =
      time +
      scrollTime;


    /*
     * Cardiac phase.
     *
     * 0 → 1 represents one heartbeat.
     */
    var phase =
      (
        cardiacTime *
        beatsPerSecond
      ) % 1;


    var amplitude = 0;


    /* =====================================================
       P WAVE
       ===================================================== */

    if (
      phase >= 0.055 &&
      phase < 0.135
    ) {

      var p =
        (phase - 0.055) / 0.08;


      /*
       * Small, rounded P wave.
       */
      amplitude +=
        Math.sin(
          p * Math.PI
        ) * 5.5;
    }


    /* =====================================================
       Q WAVE
       ===================================================== */

    if (
      phase >= 0.245 &&
      phase < 0.265
    ) {

      var q =
        (phase - 0.245) / 0.020;


      amplitude -=
        Math.sin(
          q * Math.PI
        ) * 7;
    }


    /* =====================================================
       R WAVE
       ===================================================== */

    if (
      phase >= 0.265 &&
      phase < 0.295
    ) {

      var r =
        (phase - 0.265) / 0.030;


      /*
       * Reduced from the previous exaggerated
       * 82-pixel spike.
       *
       * This makes the trace look more like a
       * monitor waveform rather than a collection
       * of giant spikes.
       */
      amplitude +=
        Math.sin(
          r * Math.PI
        ) * 62;
    }


    /* =====================================================
       S WAVE
       ===================================================== */

    if (
      phase >= 0.295 &&
      phase < 0.320
    ) {

      var s =
        (phase - 0.295) / 0.025;


      amplitude -=
        Math.sin(
          s * Math.PI
        ) * 18;
    }


    /* =====================================================
       T WAVE
       ===================================================== */

    if (
      phase >= 0.40 &&
      phase < 0.54
    ) {

      var t =
        (phase - 0.40) / 0.14;


      /*
       * Broad, lower T wave.
       */
      amplitude +=
        Math.sin(
          t * Math.PI
        ) * 12;
    }


    /* =====================================================
       BASELINE WANDER
       ===================================================== */

    var baseline =
      Math.sin(
        cardiacTime * 1.2
      ) * 0.8;


    /* =====================================================
       VERY LOW SIGNAL NOISE
       ===================================================== */

    /*
     * Lower frequency and amplitude than the
     * previous implementation.
     *
     * This prevents the baseline from looking like
     * a rapidly vibrating signal.
     */
    var noise =
      Math.sin(
        cardiacTime * 5
      ) * 0.25;


    /*
     * Convert signal amplitude to SVG coordinates.
     */
    var y =
      height / 2 -
      amplitude -
      baseline -
      noise;


    points.push(
      x.toFixed(2) +
      "," +
      y.toFixed(2)
    );
  }


  path.setAttribute(
    "points",
    points.join(" ")
  );
}


/* =========================================================
   RESPIRATION WAVEFORM
   ========================================================= */

function LM_drawRespiration(
  respirationRate
) {

  var path =
    document.getElementById(
      "resp-path"
    );


  if (!path) {
    return;
  }


  var points = [];

  var width = 1000;
  var height = 220;

  var samples = 900;


  /*
   * Respiration rate is breaths per minute.
   */
  var breathsPerSecond =
    respirationRate / 60;


  var displaySeconds =
    LM_DISPLAY_SECONDS;


  /*
   * Slow scrolling.
   */
  var scrollTime =
    window.liveMonitorState.waveformTime *
    LM_RESP_SCROLL_SPEED;


  for (
    var i = 0;
    i < samples;
    i++
  ) {

    var normalizedX =
      i / (samples - 1);


    var x =
      normalizedX * width;


    var time =
      normalizedX * displaySeconds;


    var respiratoryTime =
      time +
      scrollTime;


    /*
     * Main respiratory cycle.
     */
    var phase =
      respiratoryTime *
      breathsPerSecond *
      Math.PI *
      2;


    var mainWave =
      Math.sin(phase);


    /*
     * Small harmonic.
     */
    var harmonic =
      Math.sin(
        phase * 2 +
        0.5
      ) * 0.08;


    /*
     * Baseline movement.
     */
    var baseline =
      Math.sin(
        respiratoryTime * 0.7
      ) * 3;


    var y =
      height / 2 -
      (
        mainWave +
        harmonic
      ) * 42 -
      baseline;


    points.push(
      x.toFixed(2) +
      "," +
      y.toFixed(2)
    );
  }


  path.setAttribute(
    "points",
    points.join(" ")
  );
}


/* =========================================================
   PPG WAVEFORM
   ========================================================= */

function LM_drawPPG(
  heartRate,
  spo2
) {

  var path =
    document.getElementById(
      "ppg-path"
    );


  if (!path) {
    return;
  }


  var points = [];

  var width = 1000;
  var height = 160;

  var samples = 900;


  /*
   * PPG follows the simulated heart rate.
   */
  var beatsPerSecond =
    heartRate / 60;


  /*
   * Visual-only SpO2 relationship.
   */
  var spo2Normalized =
    LM_normalize(
      spo2,
      90,
      100
    );


  var pulseAmplitude =
    32 +
    spo2Normalized * 18;


  var displaySeconds =
    LM_DISPLAY_SECONDS;


  /*
   * Controlled visual movement.
   */
  var scrollTime =
    window.liveMonitorState.waveformTime *
    LM_PPG_SCROLL_SPEED;


  for (
    var i = 0;
    i < samples;
    i++
  ) {

    var normalizedX =
      i / (samples - 1);


    var x =
      normalizedX * width;


    var time =
      normalizedX * displaySeconds;


    var cardiacTime =
      time +
      scrollTime;


    var phase =
      (
        cardiacTime *
        beatsPerSecond
      ) % 1;


    var pulse = 0;


    /* -----------------------------------------------------
       PPG RISE
       ----------------------------------------------------- */

    if (
      phase >= 0.03 &&
      phase < 0.18
    ) {

      var rise =
        (phase - 0.03) / 0.15;


      pulse =
        Math.sin(
          rise * Math.PI / 2
        ) *
        pulseAmplitude;
    }


    /* -----------------------------------------------------
       PPG DECAY
       ----------------------------------------------------- */

    else if (
      phase >= 0.18
    ) {

      var decay =
        Math.exp(
          -(phase - 0.18) * 5
        );


      pulse =
        decay *
        pulseAmplitude *
        0.25;
    }


    var baseline =
      Math.sin(
        cardiacTime * 0.8
      ) * 2;


    var noise =
      Math.sin(
        cardiacTime * 7
      ) * 0.35;


    var y =
      height -
      30 -
      pulse -
      baseline -
      noise;


    points.push(
      x.toFixed(2) +
      "," +
      y.toFixed(2)
    );
  }


  path.setAttribute(
    "points",
    points.join(" ")
  );
}


/* =========================================================
   TELEMETRY UPDATE
   ========================================================= */

function LM_updateTelemetry() {

  if (
    typeof MonitorSimulation ===
    "undefined"
  ) {

    console.error(
      "MonitorSimulation is not loaded."
    );

    return;
  }


  /*
   * Get simulated physiological state.
   */
  var state =
    MonitorSimulation.update();


  /*
   * Store the same values used
   * by the telemetry display.
   */

  window.liveMonitorState.heartRate =
    state.heartRate;


  window.liveMonitorState.respirationRate =
    state.respirationRate;


  window.liveMonitorState.spo2 =
    state.spo2;


  window.liveMonitorState.temperature =
    state.temperature;


  window.liveMonitorState.riskProbability =
    state.riskProbability;


  window.liveMonitorState.riskState =
    state.riskState;


  /* =====================================================
     HEART RATE
     ===================================================== */

  LM_setText(
    "heart-rate",
    Math.round(
      state.heartRate
    )
  );


  LM_setBar(
    "heart-rate-bar",
    LM_normalize(
      state.heartRate,
      110,
      175
    )
  );


  /* =====================================================
     RESPIRATION
     ===================================================== */

  LM_setText(
    "resp-rate",
    Math.round(
      state.respirationRate
    )
  );


  LM_setBar(
    "resp-rate-bar",
    LM_normalize(
      state.respirationRate,
      25,
      65
    )
  );


  /* =====================================================
     SpO2
     ===================================================== */

  LM_setText(
    "spo2",
    Math.round(
      state.spo2
    )
  );


  LM_setBar(
    "spo2-bar",
    LM_normalize(
      state.spo2,
      90,
      100
    )
  );


  /* =====================================================
     TEMPERATURE
     ===================================================== */

  LM_setText(
    "temperature",
    state.temperature.toFixed(1)
  );


  /* =====================================================
     RISK
     ===================================================== */

  LM_setText(
    "risk-state",
    state.riskState
  );


  LM_setText(
    "risk-probability",
    state.riskProbability.toFixed(2)
  );


  LM_setBar(
    "risk-meter-fill",
    state.riskProbability
  );


  LM_updateRiskAppearance(
    state.riskState
  );
}


/* =========================================================
   RISK APPEARANCE
   ========================================================= */

function LM_updateRiskAppearance(
  state
) {

  var riskState =
    document.getElementById(
      "risk-state"
    );


  var riskPanel =
    document.querySelector(
      ".risk-panel"
    );


  if (
    !riskState ||
    !riskPanel
  ) {
    return;
  }


  riskState.classList.remove(
    "risk-normal",
    "risk-rising",
    "risk-critical"
  );


  riskPanel.classList.remove(
    "risk-panel-normal",
    "risk-panel-rising",
    "risk-panel-critical"
  );


  if (
    state === "CRITICAL"
  ) {

    riskState.classList.add(
      "risk-critical"
    );


    riskPanel.classList.add(
      "risk-panel-critical"
    );

  }

  else if (
    state === "RISING RISK"
  ) {

    riskState.classList.add(
      "risk-rising"
    );


    riskPanel.classList.add(
      "risk-panel-rising"
    );

  }

  else {

    riskState.classList.add(
      "risk-normal"
    );


    riskPanel.classList.add(
      "risk-panel-normal"
    );
  }
}


/* =========================================================
   TEXT HELPER
   ========================================================= */

function LM_setText(
  id,
  value
) {

  var element =
    document.getElementById(
      id
    );


  if (element) {
    element.textContent =
      value;
  }
}


/* =========================================================
   BAR HELPER
   ========================================================= */

function LM_setBar(
  id,
  normalizedValue
) {

  var element =
    document.getElementById(
      id
    );


  if (!element) {
    return;
  }


  var percentage =
    Math.max(
      0,
      Math.min(
        100,
        normalizedValue * 100
      )
    );


  element.style.width =
    percentage + "%";
}


/* =========================================================
   NORMALIZATION
   ========================================================= */

function LM_normalize(
  value,
  min,
  max
) {

  return (
    (value - min) /
    (max - min)
  );
}