# Raspberry Pi Deployment Guide

## Precursor-Based Early Warning of Neonatal Apnea and Desaturation via Edge-Deployed Cardiorespiratory Risk Prediction

This document is the implementation handoff for deploying the current project software on a Raspberry Pi.

> **Important status note**
>
> The project currently has a verified **INT8 TFLite inference pipeline**, but the complete raw-signal-to-risk pipeline has **not yet been implemented or measured on the Raspberry Pi**.
>
> The current Raspberry Pi software can accept an already prepared **11 × 20 feature sequence** and run the quantized model. Raw ECG/respiration acquisition, real-time preprocessing, feature extraction, and end-to-end on-device latency measurement are the next implementation steps.

---

## 1. Project Objective

The intended final system is:

```text
ECG + Respiration (+ PPG/SpO2 later)
                |
                v
        Signal Acquisition
                |
                v
        Signal Preprocessing
                |
                v
      Physiological Features
                |
                v
       15-second time window
                |
                v
        11 × 20 feature matrix
                |
                v
       INT8 TFLite classifier
                |
                v
       Risk probability
                |
                v
       Normal / Rising Risk
```

The current deployment model is a temporal Logistic Regression model converted to TensorFlow/Keras and then to a fully integer-quantized TensorFlow Lite model.

---

# 2. Target Hardware

## Raspberry Pi

Target platform:

- Raspberry Pi 4
- Linux/Raspberry Pi OS
- Python 3 environment
- I2C enabled for ADS1115
- ECG acquisition hardware/interface
- Respiration acquisition hardware/interface
- Thermistor + ADS1115 for auxiliary respiratory waveform monitoring

The exact ECG and respiration ADC/interface hardware is not yet frozen in the current project state.

---

# 3. Current Project Status

## Completed

The following software components have been completed and verified:

- PICS neonatal signal-processing development
- ECG preprocessing
- Respiration preprocessing
- Event-detection development
- Precursor-window construction
- 20-feature extraction
- 15-second temporal sequence construction
- Leave-One-Subject-Out (LOSO) validation
- Temporal Logistic Regression development model
- GRU development model
- CNN development model
- Deployment reference model
- Float32 TFLite conversion
- Full INT8 TFLite conversion
- Standalone INT8 inference engine
- Batch and single-window deployment verification
- INT8 numerical verification against the reference model

## Not yet completed

These parts still need to be implemented on the Raspberry Pi:

- Raw ECG acquisition
- Raw respiration acquisition
- Real-time ECG filtering
- Real-time respiration filtering
- R-peak detection on live ECG
- RR/HR/HRV calculation on live data
- Respiration peak detection on live data
- Real-time 20-feature extraction
- Construction of the complete 11 × 20 sequence from live signals
- End-to-end raw-signal inference
- Raspberry Pi inference latency measurement
- Long-duration stability testing

---

# 4. Deployment Folder

The current deployment package is:

```text
deployment/
├── model_int8.tflite
├── edge_inference.py
├── edge_specification.json
├── deployment_manifest.json
└── sklearn_reference_bundle.joblib
```

## File purposes

### `model_int8.tflite`

The fully integer-quantized TFLite deployment model.

Current verified properties:

- Input: INT8
- Output: INT8
- Input shape: `[1, 220]`
- Output shape: `[1, 1]`
- Model size: approximately 1.7 KB

### `edge_inference.py`

Standalone inference engine.

It:

1. Loads the TFLite model.
2. Reads quantization parameters.
3. Accepts an `11 × 20` feature sequence.
4. Flattens it to 220 values.
5. Quantizes the input to INT8.
6. Runs TFLite inference.
7. Dequantizes the output.
8. Applies the configured risk threshold.

### `edge_specification.json`

Defines the deployment interface, including:

- 15-second window
- 11 temporal timesteps
- 20 features per timestep
- 220 total model inputs
- ECG preprocessing settings
- respiration preprocessing settings
- feature ordering
- deployment preprocessing information
- model filename
- threshold

### `deployment_manifest.json`

Records the deployment package and its contents.

### `sklearn_reference_bundle.joblib`

Reference model bundle used for verification against the deployment implementation.

---

# 5. Model Input Specification

The deployment model expects:

```text
11 timesteps × 20 features
```

Therefore:

```text
11 × 20 = 220 values
```

The model receives the flattened representation:

```text
(11, 20)
      |
      v
(220,)
      |
      v
INT8 TFLite model
```

The 20 features are:

## ECG features

1. `ecg_mean`
2. `ecg_std`
3. `ecg_rms`
4. `r_peak_count`
5. `mean_rr`
6. `std_rr`
7. `mean_hr`
8. `min_hr`
9. `max_hr`
10. `std_hr`
11. `sdnn`
12. `rmssd`

## Respiration features

13. `resp_mean`
14. `resp_std`
15. `resp_rms`
16. `resp_peak_count`
17. `mean_resp_interval`
18. `std_resp_interval`
19. `mean_resp_rate`
20. `std_resp_rate`

The order must not be changed.

---

# 6. Temporal Window

The deployment sequence represents a 15-second precursor/risk window.

The current temporal representation is:

```text
15-second window
        |
        v
11 temporal timesteps
        |
        v
20 features per timestep
        |
        v
11 × 20 matrix
```

The project should not describe this as proof of a 15-second prediction horizon.

It is more accurately described as:

> A 15-second physiological window immediately preceding a project-defined event.

The current development dataset contains:

- 55 total windows
- 50 control windows
- 5 precursor windows
- 10 infants
- Positive-bearing infants: 1, 3 and 9

This is a feasibility/development dataset and is not sufficient for clinical performance claims.

---

# 7. Signal Preprocessing Specification

## ECG

Current project configuration:

```text
Bandpass: 0.5–40 Hz
Butterworth order: 4
Zero-phase filtering during offline development
Notch: 50 Hz
Notch Q: 30
Minimum RR interval: 0.30 s
```

The real-time Raspberry Pi implementation must reproduce the intended signal-processing behavior as closely as practical.

### Important

Offline development used zero-phase filtering in places where appropriate.

A real-time system cannot use future samples, so the final live implementation must use a causal/streaming implementation.

This difference must be documented and evaluated rather than silently treating the two implementations as identical.

---

# 8. Respiration Preprocessing Specification

Current configuration:

```text
Bandpass: 0.03–2.0 Hz
Butterworth order: 4
Minimum respiratory peak distance: 0.8 s
Respiration peak prominence:
    0.1 × signal standard deviation
```

The real-time implementation must operate continuously on incoming samples.

The system should maintain a rolling buffer rather than repeatedly processing the entire recording.

---

# 9. Feature Extraction

For each temporal timestep, calculate the 20 features in the exact order specified above.

## ECG-derived features

The ECG branch must provide:

```text
ecg_mean
ecg_std
ecg_rms
r_peak_count
mean_rr
std_rr
mean_hr
min_hr
max_hr
std_hr
sdnn
rmssd
```

The ECG processing sequence is:

```text
Raw ECG
   |
   v
Filtering
   |
   v
R-peak detection
   |
   v
RR intervals
   |
   v
Heart rate
   |
   v
HRV
   |
   v
12 ECG features
```

## Respiration-derived features

The respiration branch must provide:

```text
resp_mean
resp_std
resp_rms
resp_peak_count
mean_resp_interval
std_resp_interval
mean_resp_rate
std_resp_rate
```

Processing:

```text
Raw respiration
       |
       v
Filtering
       |
       v
Respiration peak detection
       |
       v
Respiratory intervals/rate
       |
       v
8 respiration features
```

---

# 10. Handling Missing Respiration Features

The final temporal dataset intentionally allows missing respiration interval/rate features when a timestep contains too few valid respiration peaks.

This resulted in a small amount of missing data:

```text
Missing values: 60 / 12100
≈ 0.50%
```

The development pipeline handles these using training-only median imputation.

On Raspberry Pi, the implementation must not invent physiological values.

If insufficient valid peaks exist:

```text
feature = missing
```

and the deployment preprocessing layer must apply the same trained preprocessing convention.

Do not replace missing physiological measurements with arbitrary constants.

---

# 11. Deployment Preprocessing

The deployment reference model uses:

```text
Median imputation
        |
        v
StandardScaler
        |
        v
Flatten 11 × 20 → 220
        |
        v
INT8 quantization
        |
        v
TFLite inference
```

For validation, imputation and scaling were fitted using training data only.

For the final deployment bundle, the model was trained on the complete development dataset after the LOSO evaluation had been completed.

These two purposes must remain clearly separated:

```text
LOSO model
    = validation/evaluation

Full-development model
    = deployment reference
```

Do not report the full-development deployment model's predictions as an independent validation result.

---

# 12. INT8 Quantization

The current TFLite model is fully integer quantized.

Verified parameters:

```text
Input type: INT8
Output type: INT8
Input scale: 0.08555548638105392
Input zero point: 12

Output scale: 0.00390625
Output zero point: -128
```

The edge implementation performs:

```text
float feature
     |
     v
INT8 quantization
     |
     v
TFLite inference
     |
     v
INT8 output
     |
     v
dequantization
     |
     v
risk probability
```

The current model was verified against the Float32/reference implementation:

```text
Maximum probability difference ≈ 0.00565
Mean probability difference ≈ 0.00125
Prediction mismatches = 0
```

This demonstrates numerical consistency of the deployment conversion.

It does **not** demonstrate clinical predictive validity.

---

# 13. Current Edge Inference Engine

The current standalone engine is:

```text
deployment/edge_inference.py
```

The class is:

```text
NeonatalRiskInference
```

Current interface:

```python
risk_engine = NeonatalRiskInference(...)

probability, prediction = risk_engine.predict(sequence)
```

where:

```text
sequence.shape == (11, 20)
```

The engine currently expects:

> already-prepared/preprocessed feature sequences.

It does **not** yet accept raw ECG and respiration samples.

This distinction is important.

Current:

```text
Feature sequence → TFLite → risk
```

Target:

```text
Raw ECG + Raw respiration
        ↓
Real-time processing
        ↓
20 features × 11 timesteps
        ↓
TFLite
        ↓
risk
```

---

# 14. Raspberry Pi Software Architecture

The recommended implementation is modular.

```text
raspberry_pi/
│
├── acquisition/
│   ├── ecg_reader.py
│   ├── respiration_reader.py
│   └── ads1115_reader.py
│
├── processing/
│   ├── ecg_processing.py
│   ├── respiration_processing.py
│   └── feature_extraction.py
│
├── inference/
│   └── edge_inference.py
│
├── config/
│   └── edge_specification.json
│
├── tests/
│   ├── test_ecg.py
│   ├── test_respiration.py
│   ├── test_features.py
│   └── test_inference.py
│
└── main.py
```

This structure should keep acquisition, signal processing, feature extraction and ML inference separate.

---

# 15. Real-Time Processing Loop

The eventual system should operate approximately as follows:

```text
START
  |
  v
Initialize ECG interface
  |
  v
Initialize respiration interface
  |
  v
Initialize ADS1115 / thermistor
  |
  v
Load deployment model
  |
  v
Create rolling buffers
  |
  v
Acquire samples
  |
  +-------------------+
  |                   |
  v                   v
 ECG processing    Resp processing
  |                   |
  v                   v
 ECG features      Resp features
  |                   |
  +---------+---------+
            |
            v
     20-feature vector
            |
            v
      Temporal buffer
            |
            v
       11 × 20 matrix
            |
            v
       INT8 inference
            |
            v
     Risk probability
            |
            v
     Risk state/output
            |
            v
         REPEAT
```

---

# 16. Thermistor + ADS1115

The thermistor branch is currently intended as an auxiliary respiratory waveform/hardware-validation branch.

## Components

### Thermistor

```text
MF52A103J3950
10 kΩ @ 25°C
B = 3950 K
±5%
```

### ADC

```text
ADS1115
16-bit
4-channel
I2C
```

### Divider

```text
3.3 V
 |
10 kΩ fixed resistor
 |
 +-------- ADS1115 A0
 |
10 kΩ NTC thermistor
 |
GND
```

The Raspberry Pi communicates with the ADS1115 using I2C.

---

# 17. Thermistor Status

The following has been completed:

- Component selection
- Divider design
- Electrical calculations
- Beta-model voltage calculations
- Hardware assembly checklist
- Dedicated `05_thermistor_validation.ipynb`

Hardware assembly has **not** yet started.

The first hardware validation target is:

```text
Thermistor
    ↓
Voltage divider
    ↓
ADS1115
    ↓
I2C
    ↓
Raspberry Pi
    ↓
Raw ADC waveform
```

Only after raw acquisition works should respiratory waveform processing be implemented.

---

# 18. Raspberry Pi I2C Setup

Once the ADS1115 hardware is assembled:

1. Connect ADS1115 to the Raspberry Pi I2C pins.
2. Enable I2C in Raspberry Pi OS.
3. Verify that the I2C bus is visible.
4. Scan for the ADS1115 address.
5. Confirm the device is detected.
6. Read raw ADC samples.
7. Convert ADC measurements to voltage.
8. Plot/inspect the waveform.
9. Test respiratory waveform visibility.
10. Only then proceed to respiratory peak detection.

Do not treat an I2C detection result as proof that the complete thermistor sensing chain works.

The ADC must first produce stable, physiologically meaningful waveform measurements.

---

# 19. Hardware Validation Sequence

Use this order:

## Step 1 — ADS1115 detection

Verify the Raspberry Pi can see the ADC.

## Step 2 — Raw ADC acquisition

Read A0 continuously.

## Step 3 — Voltage conversion

Convert ADC counts into voltage.

## Step 4 — Thermistor waveform

Observe the signal while changing the thermal/airflow conditions in a controlled manner.

## Step 5 — Filtering

Apply:

```text
0.03–2.0 Hz
Butterworth order 4
```

## Step 6 — Respiratory peak detection

Use the project peak-detection configuration.

## Step 7 — Respiratory rate

Estimate rate from detected peaks.

## Step 8 — Respiratory pause detection

Validate whether suppressed/low-amplitude respiratory intervals can be detected reliably.

## Step 9 — Integration

Connect the resulting respiration stream to the feature extraction pipeline.

---

# 20. ECG Hardware Integration

The ECG acquisition interface is not yet finalized in this project state.

Once an ECG acquisition device is selected, the Raspberry Pi implementation should expose a common interface:

```python
samples = ecg_reader.read()
```

The acquisition layer should provide:

```text
timestamp
ECG sample
sampling rate
```

The downstream processing layer should not depend on the physical ADC/device implementation.

This allows the ECG hardware to be changed without rewriting the ML pipeline.

---

# 21. Respiration Hardware Integration

The same principle should be used for respiration.

Recommended abstraction:

```python
samples = respiration_reader.read()
```

The processing layer should receive:

```text
timestamp
respiration sample
sampling rate
```

This keeps the sensing hardware separate from the signal-processing algorithms.

---

# 22. Feature Buffering

The final model does not make a decision from one feature vector.

It expects:

```text
11 consecutive feature timesteps
```

Therefore the Raspberry Pi needs a rolling feature buffer:

```text
feature_t1
feature_t2
feature_t3
...
feature_t11
```

After the buffer is full:

```text
shape = (11, 20)
```

Then:

```text
risk_probability = model(sequence)
```

After inference, the oldest timestep can be removed as new data arrives.

---

# 23. Risk Output

The current deployment threshold is:

```text
threshold = 0.50
```

Conceptually:

```python
if risk_probability >= 0.50:
    state = "RISING_RISK"
else:
    state = "NORMAL"
```

The 0.50 threshold is an engineering/deployment placeholder inherited from the development workflow.

It should **not** be presented as a clinically calibrated threshold.

---

# 24. Recommended Main Program

The eventual `main.py` should conceptually perform:

```python
initialize_hardware()
initialize_signal_processors()
initialize_feature_buffer()
load_model()

while True:

    ecg_sample = read_ecg()
    resp_sample = read_respiration()

    update_ecg_buffer(ecg_sample)
    update_resp_buffer(resp_sample)

    if_feature_timestep_ready():

        ecg_features = extract_ecg_features()
        resp_features = extract_resp_features()

        feature_vector = combine_features(
            ecg_features,
            resp_features
        )

        feature_buffer.append(feature_vector)

        if len(feature_buffer) == 11:

            probability = run_inference(feature_buffer)

            print(probability)

            update_output(probability)
```

This is the target architecture, not a claim that this complete raw-signal implementation already exists.

---

# 25. Testing Strategy

Testing should happen in layers.

## Test 1 — Acquisition

Verify:

- Samples are arriving
- Sampling rate is correct
- No unexpected long gaps
- Values are finite

## Test 2 — ECG processing

Verify:

- Filter output
- R-peak detection
- RR intervals
- HR
- HRV

## Test 3 — Respiration processing

Verify:

- Filter output
- Respiratory peaks
- Respiratory intervals
- Respiratory rate
- Low/paused respiration behavior

## Test 4 — Feature extraction

Verify:

```text
20 features
```

and exact feature ordering.

## Test 5 — Temporal construction

Verify:

```text
11 × 20
```

shape.

## Test 6 — TFLite inference

Verify:

- Input type
- Output type
- Quantization
- Probability
- Classification

## Test 7 — Reference equivalence

Compare Raspberry Pi output against the existing Python reference implementation using the same feature sequence.

Expected goal:

```text
No unexpected prediction mismatch
```

and probability differences within the established quantization tolerance.

## Test 8 — End-to-end

Finally test:

```text
Raw ECG
+
Raw respiration
        ↓
Preprocessing
        ↓
Features
        ↓
11 × 20
        ↓
INT8 TFLite
        ↓
Risk output
```

This is the important final integration test.

---

# 26. Performance Measurements

Once the complete pipeline is running on the Raspberry Pi, measure:

### Acquisition

- ECG sampling rate
- Respiration sampling rate
- ADC sampling rate
- dropped samples

### Processing

- ECG filtering time
- R-peak detection time
- respiration processing time
- feature extraction time

### Inference

- TFLite inference latency
- total feature-to-output latency
- CPU utilization
- RAM usage

### Stability

- 1 minute
- 10 minutes
- 30 minutes
- longer-duration test if appropriate

Do not report Raspberry Pi latency until it has actually been measured.

---

# 27. Reproducibility

The Raspberry Pi implementation should record:

```text
Python version
TensorFlow/TFLite version
NumPy version
SciPy version
WFDB version if used
OS version
CPU model
model filename
model checksum
configuration version
```

The exact deployment model should be copied from the project's deployment package rather than recreated manually on the Pi.

---

# 28. Recommended Raspberry Pi Installation

Create a dedicated virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then install only the packages required by the deployment implementation.

The final package list should be frozen after the Raspberry Pi implementation is complete.

For the first stage, keep the environment minimal because the INT8 model itself is small and the final edge implementation should not require the complete development environment.

---

# 29. Recommended Git Repository Layout

A final repository can use:

```text
project/
│
├── data/
├── notebooks/
│
├── deployment/
│   ├── model_int8.tflite
│   ├── edge_inference.py
│   ├── edge_specification.json
│   ├── deployment_manifest.json
│   └── sklearn_reference_bundle.joblib
│
├── raspberry_pi/
│   ├── acquisition/
│   ├── processing/
│   ├── inference/
│   ├── config/
│   ├── tests/
│   └── main.py
│
├── reports/
│
├── README.md
└── docs/
    └── RASPBERRY_PI.md
```

---

# 30. Current Limitations

The following statements must remain explicit in the project documentation:

1. The development dataset contains only 5 positive precursor windows.
2. Positive examples come from only 3 of the 10 infants.
3. The ML results are development/validation results, not clinical validation.
4. PICS-derived event candidates must not automatically be called confirmed apnea.
5. The current 15-second precursor window does not by itself prove a 15-second prediction horizon.
6. The 0.50 decision threshold is not clinically calibrated.
7. The current INT8 verification demonstrates deployment consistency, not clinical predictive validity.
8. The standalone edge engine currently expects prepared feature sequences.
9. Raw ECG-to-inference processing on Raspberry Pi is not yet complete.
10. Raw respiration-to-inference processing on Raspberry Pi is not yet complete.
11. Raspberry Pi runtime and latency have not yet been measured.
12. Thermistor hardware assembly and validation are not yet complete.
13. PPG/SpO2 integration is not yet complete.
14. The system is a research/engineering prototype and not a clinical diagnostic or monitoring device.

---

# 31. Immediate Implementation Roadmap

Follow this order.

### Phase A — Thermistor hardware

```text
Assemble divider
      ↓
Connect ADS1115
      ↓
Enable I2C
      ↓
Detect ADS1115
      ↓
Read ADC
      ↓
Convert to voltage
      ↓
Validate waveform
```

### Phase B — Respiration

```text
Raw respiration
      ↓
Streaming filter
      ↓
Peak detection
      ↓
Respiration rate
      ↓
Pause/suppression detection
```

### Phase C — ECG

```text
Raw ECG
      ↓
Streaming filter
      ↓
R-peak detection
      ↓
RR intervals
      ↓
HR
      ↓
HRV
```

### Phase D — Feature extraction

```text
ECG + respiration
       ↓
20 features
       ↓
feature timestep
       ↓
11 timesteps
       ↓
11 × 20
```

### Phase E — Edge model

```text
11 × 20
   ↓
preprocessing
   ↓
INT8 quantization
   ↓
TFLite
   ↓
risk probability
```

### Phase F — Full integration

```text
ECG hardware
      +
Respiration hardware
      +
Thermistor/ADS1115
      ↓
Raspberry Pi
      ↓
Real-time processing
      ↓
Feature buffer
      ↓
INT8 model
      ↓
Risk output
```

---

# 32. What the Friend Should Implement First

Do **not** start by rewriting the ML model.

The first Raspberry Pi task should be hardware acquisition.

Recommended first task:

```text
Raspberry Pi
    ↓
ADS1115
    ↓
Thermistor divider
    ↓
I2C detection
    ↓
Raw ADC acquisition
    ↓
CSV logging
    ↓
Waveform plot
```

After this is working, proceed to respiratory signal processing.

The existing INT8 model and inference engine should be reused rather than reimplemented.

---

# 33. Definition of Done for Raspberry Pi Integration

The Raspberry Pi portion should be considered complete only when all of the following have been demonstrated:

- [ ] ADS1115 detected
- [ ] Thermistor ADC acquisition works
- [ ] Respiration waveform is observable
- [ ] ECG acquisition works
- [ ] ECG processing works in streaming mode
- [ ] Respiration processing works in streaming mode
- [ ] 20 features generated in correct order
- [ ] 11 × 20 sequence generated
- [ ] INT8 TFLite model loads
- [ ] INT8 inference works
- [ ] Output agrees with reference implementation
- [ ] End-to-end raw-signal inference works
- [ ] Raspberry Pi latency measured
- [ ] CPU/RAM usage measured
- [ ] Long-duration stability tested
- [ ] Software versions recorded
- [ ] Final Raspberry Pi instructions documented

---

# 34. Final Architecture

The intended final system is:

```text
                 ┌───────────────────────┐
                 │   ECG Sensor/AFE      │
                 └───────────┬───────────┘
                             │
                             v
                    ┌─────────────────┐
                    │ ECG Acquisition │
                    └────────┬────────┘
                             │
                             v
                    ┌─────────────────┐
                    │ ECG Processing  │
                    └────────┬────────┘
                             │
                             │
                 ┌───────────v───────────┐
                 │ 20 Feature Extraction│
                 └───────────┬──────────┘
                             │
                             │
                 ┌───────────v───────────┐
                 │ 11 × 20 Feature      │
                 │ Temporal Buffer       │
                 └───────────┬───────────┘
                             │
                             v
                    ┌─────────────────┐
                    │ INT8 TFLite     │
                    │ Risk Model      │
                    └────────┬────────┘
                             │
                             v
                    ┌─────────────────┐
                    │ Risk Probability│
                    │ / State         │
                    └─────────────────┘


                 ┌───────────────────────┐
                 │ Respiration Sensor    │
                 └───────────┬───────────┘
                             │
                             v
                    ┌─────────────────┐
                    │ Resp Processing  │
                    └────────┬────────┘
                             │
                             └──────→ Feature Extraction


                 ┌───────────────────────┐
                 │ Thermistor + ADS1115 │
                 └───────────┬───────────┘
                             │
                             v
                       Raspberry Pi
                             │
                             └────→ Auxiliary respiratory
                                    waveform validation
```

## 15. Dashboard UI and Local Server

A comprehensive front-end telemetry dashboard has been developed to visualize real-time cardiorespiratory data and output the calculated apnea risk scores.

### Starting the UI Dashboard
The web interface is a static HTML/JS frontend that can be served via any HTTP server. To start it locally:
```bash
# Navigate to the project root directory
cd neonatal-apnea-monitor

# Serve the static website files (Python 3)
python -m http.server 8000 --directory website
```
Once running, open a web browser and navigate to `http://localhost:8000`.

### Dashboard Features
- **Overview & Edge AI Documentation:** Displays technical methodology, architectural specifications, and model properties.
- **Live Monitoring Tab:** The active operational interface. 
- **Mode Toggle:** At the top of the Live Monitoring page, you can switch between `Simulated` (synthetic test waves) and `Raspberry Pi` (live edge data stream).
- **Oscillating Risk Engine:** The risk score gauge dynamically responds to the precursor model output, visualizing states from NOMINAL to PRECURSOR WARNING.

### Connecting the Hardware to the Dashboard (Integration Roadmap)
Currently, the "Connect Sensors" functionality in the UI is simulated for frontend validation. To complete the hardware integration:

1. **Host a Backend on the Pi:** Run a lightweight server (e.g., Flask, FastAPI, or WebSockets) alongside the `edge_inference.py` script on the Raspberry Pi.
2. **Expose an Endpoint:** Create an endpoint (e.g., `http://raspberrypi.local:5000/api/stream`) that emits the live analog sensor data and the calculated INT8 TFLite risk score.
3. **Update the Frontend Fetch Logic:** In `website/pages/live-monitoring.html`, replace the synthetic `simulateRpiConnect()` function with actual WebSocket or HTTP polling requests to fetch the live data from the Pi.
4. **Draw Real Waveforms:** Pipe the incoming ECG/RESP array points into the existing `renderLoop` canvas drawing functions, and map the incoming risk scalar to the `computeRiskScore` handler.

---

## Project Status

**Current status:**

> Software deployment pipeline complete and verified through full INT8 TFLite inference. Raspberry Pi raw-signal acquisition and end-to-end real-time integration are the next implementation phase.

**Scope:** Research/engineering prototype.

**Not a clinical diagnostic or medical monitoring device.**
