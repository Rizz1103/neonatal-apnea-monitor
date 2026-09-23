\# Raspberry Pi Deployment Guide

\## Precursor-Based Early Warning of Neonatal Apnea and Desaturation via Edge-Deployed Cardiorespiratory Risk Prediction

This document is the implementation handoff for deploying the current

project software on a Raspberry Pi.

*>* **\*\*Important status note\*\***

*>*

*> The project currently has a verified \*\*INT8 TFLite inference*

*> pipeline\*\*, but the complete raw-signal-to-risk pipeline has \*\*not yet*

*> been implemented or measured on the Raspberry Pi\*\*.*

*>*

*> The current Raspberry Pi software can accept an already prepared \*\*11*

*> × 20 feature sequence\*\* and run the quantized model. Raw*

*> ECG/respiration acquisition, real-time preprocessing, feature*

*> extraction, and end-to-end on-device latency measurement are the next*

*> implementation steps.*

\------------------------------------------------------------------------

\## 1. Project Objective

The intended final system is:

\`\`\` text

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

\`\`\`

The current deployment model is a temporal Logistic Regression model

converted to TensorFlow/Keras and then to a fully integer-quantized

TensorFlow Lite model.

\------------------------------------------------------------------------

\# 2. Target Hardware

\## Raspberry Pi

Target platform:

\-   Raspberry Pi 4

\-   Linux/Raspberry Pi OS

\-   Python 3 environment

\-   I2C enabled for ADS1115

\-   ECG acquisition hardware/interface

\-   Respiration acquisition hardware/interface

\-   Thermistor + ADS1115 for auxiliary respiratory waveform monitoring

The exact ECG and respiration ADC/interface hardware is not yet frozen

in the current project state.

\------------------------------------------------------------------------

\# 3. Current Project Status

\## Completed

The following software components have been completed and verified:

\-   PICS neonatal signal-processing development

\-   ECG preprocessing

\-   Respiration preprocessing

\-   Event-detection development

\-   Precursor-window construction

\-   20-feature extraction

\-   15-second temporal sequence construction

\-   Leave-One-Subject-Out (LOSO) validation

\-   Temporal Logistic Regression development model

\-   GRU development model

\-   CNN development model

\-   Deployment reference model

\-   Float32 TFLite conversion

\-   Full INT8 TFLite conversion

\-   Standalone INT8 inference engine

\-   Batch and single-window deployment verification

\-   INT8 numerical verification against the reference model

\## Not yet completed

These parts still need to be implemented on the Raspberry Pi:

\-   Raw ECG acquisition

\-   Raw respiration acquisition

\-   Real-time ECG filtering

\-   Real-time respiration filtering

\-   R-peak detection on live ECG

\-   RR/HR/HRV calculation on live data

\-   Respiration peak detection on live data

\-   Real-time 20-feature extraction

\-   Construction of the complete 11 × 20 sequence from live signals

\-   End-to-end raw-signal inference

\-   Raspberry Pi inference latency measurement

\-   Long-duration stability testing

\------------------------------------------------------------------------

\# 4. Deployment Folder

The current deployment package is:

\`\`\` text

deployment/

├── model_int8.tflite

├── edge_inference.py

├── edge_specification.json

├── deployment_manifest.json

└── sklearn_reference_bundle.joblib

\`\`\`

\## File purposes

\### \`model_int8.tflite\`

The fully integer-quantized TFLite deployment model.

Current verified properties:

\-   Input: INT8

\-   Output: INT8

\-   Input shape: \`[1, 220]\`

\-   Output shape: \`[1, 1]\`

\-   Model size: approximately 1.7 KB

\### \`edge_inference.py\`

Standalone inference engine.

It:

1\.  Loads the TFLite model.

2\.  Reads quantization parameters.

3\.  Accepts an \`11 × 20\` feature sequence.

4\.  Flattens it to 220 values.

5\.  Quantizes the input to INT8.

6\.  Runs TFLite inference.

7\.  Dequantizes the output.

8\.  Applies the configured risk threshold.

\### \`edge_specification.json\`

Defines the deployment interface, including:

\-   15-second window

\-   11 temporal timesteps

\-   20 features per timestep

\-   220 total model inputs

\-   ECG preprocessing settings

\-   respiration preprocessing settings

\-   feature ordering

\-   deployment preprocessing information

\-   model filename

\-   threshold

\### \`deployment_manifest.json\`

Records the deployment package and its contents.

\### \`sklearn_reference_bundle.joblib\`

Reference model bundle used for verification against the deployment

implementation.

\------------------------------------------------------------------------

\# 5. Model Input Specification

The deployment model expects:

\`\`\` text

11 timesteps × 20 features

\`\`\`

Therefore:

\`\`\` text

11 × 20 = 220 values

\`\`\`

The model receives the flattened representation:

\`\`\` text

(11, 20)

      |

      v

(220,)

      |

      v

INT8 TFLite model

\`\`\`

The 20 features are:

\## ECG features

1\.  \`ecg_mean\`

2\.  \`ecg_std\`

3\.  \`ecg_rms\`

4\.  \`r_peak_count\`

5\.  \`mean_rr\`

6\.  \`std_rr\`

7\.  \`mean_hr\`

8\.  \`min_hr\`

9\.  \`max_hr\`

10\. \`std_hr\`

11\. \`sdnn\`

12\. \`rmssd\`

\## Respiration features

13\. \`resp_mean\`

14\. \`resp_std\`

15\. \`resp_rms\`

16\. \`resp_peak_count\`

17\. \`mean_resp_interval\`

18\. \`std_resp_interval\`

19\. \`mean_resp_rate\`

20\. \`std_resp_rate\`

The order must not be changed.

\------------------------------------------------------------------------

\# 6. Temporal Window

The deployment sequence represents a 15-second precursor/risk window.

The current temporal representation is:

\`\`\` text

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

\`\`\`

The project should not describe this as proof of a 15-second prediction

horizon.

It is more accurately described as:

*> A 15-second physiological window immediately preceding a*

*> project-defined event.*

The current development dataset contains:

\-   55 total windows

\-   50 control windows

\-   5 precursor windows

\-   10 infants

\-   Positive-bearing infants: 1, 3 and 9

This is a feasibility/development dataset and is not sufficient for

clinical performance claims.

\------------------------------------------------------------------------

\# 7. Signal Preprocessing Specification

\## ECG

Current project configuration:

\`\`\` text

Bandpass: 0.5–40 Hz

Butterworth order: 4

Zero-phase filtering during offline development

Notch: 50 Hz

Notch Q: 30

Minimum RR interval: 0.30 s

\`\`\`

The real-time Raspberry Pi implementation must reproduce the intended

signal-processing behavior as closely as practical.

\### Important

Offline development used zero-phase filtering in places where

appropriate.

A real-time system cannot use future samples, so the final live

implementation must use a causal/streaming implementation.

This difference must be documented and evaluated rather than silently

treating the two implementations as identical.

\------------------------------------------------------------------------

\# 8. Respiration Preprocessing Specification

Current configuration:

\`\`\` text

Bandpass: 0.03–2.0 Hz

Butterworth order: 4

Minimum respiratory peak distance: 0.8 s

Respiration peak prominence:

    0.1 × signal standard deviation

\`\`\`

The real-time implementation must operate continuously on incoming

samples.

The system should maintain a rolling buffer rather than repeatedly

processing the entire recording.

\------------------------------------------------------------------------

\# 9. Feature Extraction

For each temporal timestep, calculate the 20 features in the exact order

specified above.

\## ECG-derived features

The ECG branch must provide:

\`\`\` text

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

\`\`\`

The ECG processing sequence is:

\`\`\` text

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

\`\`\`

\## Respiration-derived features

The respiration branch must provide:

\`\`\` text

resp_mean

resp_std

resp_rms

resp_peak_count

mean_resp_interval

std_resp_interval

mean_resp_rate

std_resp_rate

\`\`\`

Processing:

\`\`\` text

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

\`\`\`

\------------------------------------------------------------------------

\# 10. Handling Missing Respiration Features

The final temporal dataset intentionally allows missing respiration

interval/rate features when a timestep contains too few valid

respiration peaks.

This resulted in a small amount of missing data:

\`\`\` text

Missing values: 60 / 12100

≈ 0.50%

\`\`\`

The development pipeline handles these using training-only median

imputation.

On Raspberry Pi, the implementation must not invent physiological

values.

If insufficient valid peaks exist:

\`\`\` text

feature = missing

\`\`\`

and the deployment preprocessing layer must apply the same trained

preprocessing convention.

Do not replace missing physiological measurements with arbitrary

constants.

\------------------------------------------------------------------------

\# 11. Deployment Preprocessing

The deployment reference model uses:

\`\`\` text

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

\`\`\`

For validation, imputation and scaling were fitted using training data

only.

For the final deployment bundle, the model was trained on the complete

development dataset after the LOSO evaluation had been completed.

These two purposes must remain clearly separated:

\`\`\` text

LOSO model

    = validation/evaluation

Full-development model

    = deployment reference

\`\`\`

Do not report the full-development deployment model's predictions as an

independent validation result.

\------------------------------------------------------------------------

\# 12. INT8 Quantization

The current TFLite model is fully integer quantized.

Verified parameters:

\`\`\` text

Input type: INT8

Output type: INT8

Input scale: 0.08555548638105392

Input zero point: 12

Output scale: 0.00390625

Output zero point: -128

\`\`\`

The edge implementation performs:

\`\`\` text

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

\`\`\`

The current model was verified against the Float32/reference

implementation:

\`\`\` text

Maximum probability difference ≈ 0.00565

Mean probability difference ≈ 0.00125

Prediction mismatches = 0

\`\`\`

This demonstrates numerical consistency of the deployment conversion.

It does **\*\*not\*\*** demonstrate clinical predictive validity.

\------------------------------------------------------------------------

\# 13. Current Edge Inference Engine

The current standalone engine is:

\`\`\` text

deployment/edge_inference.py

\`\`\`

The class is:

\`\`\` text

NeonatalRiskInference

\`\`\`

Current interface:

\`\`\` python

risk_engine = NeonatalRiskInference(...)

probability, prediction = risk_engine.predict(sequence)

\`\`\`

where:

\`\`\` text

sequence.shape == (11, 20)

\`\`\`

The engine currently expects:

*> already-prepared/preprocessed feature sequences.*

It does **\*\*not\*\*** yet accept raw ECG and respiration samples.

This distinction is important.

Current:

\`\`\` text

Feature sequence → TFLite → risk

\`\`\`

Target:

\`\`\` text

Raw ECG + Raw respiration

        ↓

Real-time processing

        ↓

20 features × 11 timesteps

        ↓

TFLite

        ↓

risk

\`\`\`

\------------------------------------------------------------------------

\# 14. Raspberry Pi Software Architecture

The recommended implementation is modular.

\`\`\` text

raspberry_pi/

│

├── acquisition/

│   ├── ecg_reader.py

│   ├── respiration_reader.py

│   └── ads1115_reader.py

│

├── processing/

│   ├── ecg_processing.py

│   ├── respiration_processing.py

│   └── feature_extraction.py

│

├── inference/

│   └── edge_inference.py

│

├── config/

│   └── edge_specification.json

│

├── tests/

│   ├── test_ecg.py

│   ├── test_respiration.py

│   ├── test_features.py

│   └── test_inference.py

│

└── main.py

\`\`\`

This structure should keep acquisition, signal processing, feature

extraction and ML inference separate.

\------------------------------------------------------------------------

\# 15. Real-Time Processing Loop

The eventual system should operate approximately as follows:

\`\`\` text

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

  |                   |

  v                   v

 ECG processing    Resp processing

  |                   |

  v                   v

 ECG features      Resp features

  |                   |

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

\`\`\`

\------------------------------------------------------------------------

\# 16. Thermistor + ADS1115

The thermistor branch is currently intended as an auxiliary respiratory

waveform/hardware-validation branch.

\## Components

\### Thermistor

\`\`\` text

MF52A103J3950

10 kΩ @ 25°C

B = 3950 K

±5%

\`\`\`

\### ADC

\`\`\` text

ADS1115

16-bit

4-channel

I2C

\`\`\`

\### Divider

\`\`\` text

3.3 V

 |

10 kΩ fixed resistor

 |

 +-------- ADS1115 A0

 |

10 kΩ NTC thermistor

 |

GND

\`\`\`

The Raspberry Pi communicates with the ADS1115 using I2C.

\------------------------------------------------------------------------

\# 17. Thermistor Status

The following has been completed:

\-   Component selection

\-   Divider design

\-   Electrical calculations

\-   Beta-model voltage calculations

\-   Hardware assembly checklist

\-   Dedicated \`05_thermistor_validation.ipynb\`

Hardware assembly has **\*\*not\*\*** yet started.

The first hardware validation target is:

\`\`\` text

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

\`\`\`

Only after raw acquisition works should respiratory waveform processing

be implemented.

\------------------------------------------------------------------------

\# 18. Raspberry Pi I2C Setup

Once the ADS1115 hardware is assembled:

1\.  Connect ADS1115 to the Raspberry Pi I2C pins.

2\.  Enable I2C in Raspberry Pi OS.

3\.  Verify that the I2C bus is visible.

4\.  Scan for the ADS1115 address.

5\.  Confirm the device is detected.

6\.  Read raw ADC samples.

7\.  Convert ADC measurements to voltage.

8\.  Plot/inspect the waveform.

9\.  Test respiratory waveform visibility.

10\. Only then proceed to respiratory peak detection.

Do not treat an I2C detection result as proof that the complete

thermistor sensing chain works.

The ADC must first produce stable, physiologically meaningful waveform

measurements.

\------------------------------------------------------------------------

\# 19. Hardware Validation Sequence

Use this order:

\## Step 1 --- ADS1115 detection

Verify the Raspberry Pi can see the ADC.

\## Step 2 --- Raw ADC acquisition

Read A0 continuously.

\## Step 3 --- Voltage conversion

Convert ADC counts into voltage.

\## Step 4 --- Thermistor waveform

Observe the signal while changing the thermal/airflow conditions in a

controlled manner.

\## Step 5 --- Filtering

Apply:

\`\`\` text

0.03–2.0 Hz

Butterworth order 4

\`\`\`

\## Step 6 --- Respiratory peak detection

Use the project peak-detection configuration.

\## Step 7 --- Respiratory rate

Estimate rate from detected peaks.

\## Step 8 --- Respiratory pause detection

Validate whether suppressed/low-amplitude respiratory intervals can be

detected reliably.

\## Step 9 --- Integration

Connect the resulting respiration stream to the feature extraction

pipeline.

\------------------------------------------------------------------------

\# 20. ECG Hardware Integration

The ECG acquisition interface is not yet finalized in this project

state.

Once an ECG acquisition device is selected, the Raspberry Pi

implementation should expose a common interface:

\`\`\` python

samples = ecg_reader.read()

\`\`\`

The acquisition layer should provide:

\`\`\` text

timestamp

ECG sample

sampling rate

\`\`\`

The downstream processing layer should not depend on the physical

ADC/device implementation.

This allows the ECG hardware to be changed without rewriting the ML

pipeline.

\------------------------------------------------------------------------

\# 21. Respiration Hardware Integration

The same principle should be used for respiration.

Recommended abstraction:

\`\`\` python

samples = respiration_reader.read()

\`\`\`

The processing layer should receive:

\`\`\` text

timestamp

respiration sample

sampling rate

\`\`\`

This keeps the sensing hardware separate from the signal-processing

algorithms.

\------------------------------------------------------------------------

\# 22. Feature Buffering

The final model does not make a decision from one feature vector.

It expects:

\`\`\` text

11 consecutive feature timesteps

\`\`\`

Therefore the Raspberry Pi needs a rolling feature buffer:

\`\`\` text

feature_t1

feature_t2

feature_t3

...

feature_t11

\`\`\`

After the buffer is full:

\`\`\` text

shape = (11, 20)

\`\`\`

Then:

\`\`\` text

risk_probability = model(sequence)

\`\`\`

After inference, the oldest timestep can be removed as new data arrives.

\------------------------------------------------------------------------

\# 23. Risk Output

The current deployment threshold is:

\`\`\` text

threshold = 0.50

\`\`\`

Conceptually:

\`\`\` python

if risk_probability >= 0.50:

    state = "RISING_RISK"

else:

    state = "NORMAL"

\`\`\`

The 0.50 threshold is an engineering/deployment placeholder inherited

from the development workflow.

It should **\*\*not\*\*** be presented as a clinically calibrated threshold.

\------------------------------------------------------------------------

\# 24. Recommended Main Program

The eventual \`main.py\` should conceptually perform:

\`\`\` python

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

\`\`\`

This is the target architecture, not a claim that this complete

raw-signal implementation already exists.

\------------------------------------------------------------------------

\# 25. Testing Strategy

Testing should happen in layers.

\## Test 1 --- Acquisition

Verify:

\-   Samples are arriving

\-   Sampling rate is correct

\-   No unexpected long gaps

\-   Values are finite

\## Test 2 --- ECG processing

Verify:

\-   Filter output

\-   R-peak detection

\-   RR intervals

\-   HR

\-   HRV

\## Test 3 --- Respiration processing

Verify:

\-   Filter output

\-   Respiratory peaks

\-   Respiratory intervals

\-   Respiratory rate

\-   Low/paused respiration behavior

\## Test 4 --- Feature extraction

Verify:

\`\`\` text

20 features

\`\`\`

and exact feature ordering.

\## Test 5 --- Temporal construction

Verify:

\`\`\` text

11 × 20

\`\`\`

shape.

\## Test 6 --- TFLite inference

Verify:

\-   Input type

\-   Output type

\-   Quantization

\-   Probability

\-   Classification

\## Test 7 --- Reference equivalence

Compare Raspberry Pi output against the existing Python reference

implementation using the same feature sequence.

Expected goal:

\`\`\` text

No unexpected prediction mismatch

\`\`\`

and probability differences within the established quantization

tolerance.

\## Test 8 --- End-to-end

Finally test:

\`\`\` text

Raw ECG

\+

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

\`\`\`

This is the important final integration test.

\------------------------------------------------------------------------

\# 26. Performance Measurements

Once the complete pipeline is running on the Raspberry Pi, measure:

\### Acquisition

\-   ECG sampling rate

\-   Respiration sampling rate

\-   ADC sampling rate

\-   dropped samples

\### Processing

\-   ECG filtering time

\-   R-peak detection time

\-   respiration processing time

\-   feature extraction time

\### Inference

\-   TFLite inference latency

\-   total feature-to-output latency

\-   CPU utilization

\-   RAM usage

\### Stability

\-   1 minute

\-   10 minutes

\-   30 minutes

\-   longer-duration test if appropriate

Do not report Raspberry Pi latency until it has actually been measured.

\------------------------------------------------------------------------

\# 27. Reproducibility

The Raspberry Pi implementation should record:

\`\`\` text

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

\`\`\`

The exact deployment model should be copied from the project's

deployment package rather than recreated manually on the Pi.

\------------------------------------------------------------------------

\# 28. Recommended Raspberry Pi Installation

Create a dedicated virtual environment:

\`\`\` bash

python3 -m venv venv

source venv/bin/activate

\`\`\`

Then install only the packages required by the deployment

implementation.

The final package list should be frozen after the Raspberry Pi

implementation is complete.

For the first stage, keep the environment minimal because the INT8 model

itself is small and the final edge implementation should not require the

complete development environment.

\------------------------------------------------------------------------

\# 29. Recommended Git Repository Layout

A final repository can use:

\`\`\` text

project/

│

├── data/

├── notebooks/

│

├── deployment/

│   ├── model_int8.tflite

│   ├── edge_inference.py

│   ├── edge_specification.json

│   ├── deployment_manifest.json

│   └── sklearn_reference_bundle.joblib

│

├── raspberry_pi/

│   ├── acquisition/

│   ├── processing/

│   ├── inference/

│   ├── config/

│   ├── tests/

│   └── main.py

│

├── reports/

│

├── README.md

└── docs/

    └── RASPBERRY_PI.md

\`\`\`

\------------------------------------------------------------------------

\# 30. Current Limitations

The following statements must remain explicit in the project

documentation:

1\.  The development dataset contains only 5 positive precursor windows.

2\.  Positive examples come from only 3 of the 10 infants.

3\.  The ML results are development/validation results, not clinical

    validation.

4\.  PICS-derived event candidates must not automatically be called

    confirmed apnea.

5\.  The current 15-second precursor window does not by itself prove a

    15-second prediction horizon.

6\.  The 0.50 decision threshold is not clinically calibrated.

7\.  The current INT8 verification demonstrates deployment consistency,

    not clinical predictive validity.

8\.  The standalone edge engine currently expects prepared feature

    sequences.

9\.  Raw ECG-to-inference processing on Raspberry Pi is not yet complete.

10\. Raw respiration-to-inference processing on Raspberry Pi is not yet

    complete.

11\. Raspberry Pi runtime and latency have not yet been measured.

12\. Thermistor hardware assembly and validation are not yet complete.

13\. PPG/SpO2 integration is not yet complete.

14\. The system is a research/engineering prototype and not a clinical

    diagnostic or monitoring device.

\------------------------------------------------------------------------

\# 31. Immediate Implementation Roadmap

Follow this order.

\### Phase A --- Thermistor hardware

\`\`\` text

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

\`\`\`

\### Phase B --- Respiration

\`\`\` text

Raw respiration

      ↓

Streaming filter

      ↓

Peak detection

      ↓

Respiration rate

      ↓

Pause/suppression detection

\`\`\`

\### Phase C --- ECG

\`\`\` text

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

\`\`\`

\### Phase D --- Feature extraction

\`\`\` text

ECG + respiration

       ↓

20 features

       ↓

feature timestep

       ↓

11 timesteps

       ↓

11 × 20

\`\`\`

\### Phase E --- Edge model

\`\`\` text

11 × 20

   ↓

preprocessing

   ↓

INT8 quantization

   ↓

TFLite

   ↓

risk probability

\`\`\`

\### Phase F --- Full integration

\`\`\` text

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

\`\`\`

\------------------------------------------------------------------------

\# 32. What the Friend Should Implement First

Do **\*\*not\*\*** start by rewriting the ML model.

The first Raspberry Pi task should be hardware acquisition.

Recommended first task:

\`\`\` text

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

\`\`\`

After this is working, proceed to respiratory signal processing.

The existing INT8 model and inference engine should be reused rather

than reimplemented.

\------------------------------------------------------------------------

\# 33. Definition of Done for Raspberry Pi Integration

The Raspberry Pi portion should be considered complete only when all of

the following have been demonstrated:

\-   [ ] ADS1115 detected

\-   [ ] Thermistor ADC acquisition works

\-   [ ] Respiration waveform is observable

\-   [ ] ECG acquisition works

\-   [ ] ECG processing works in streaming mode

\-   [ ] Respiration processing works in streaming mode

\-   [ ] 20 features generated in correct order

\-   [ ] 11 × 20 sequence generated

\-   [ ] INT8 TFLite model loads

\-   [ ] INT8 inference works

\-   [ ] Output agrees with reference implementation

\-   [ ] End-to-end raw-signal inference works

\-   [ ] Raspberry Pi latency measured

\-   [ ] CPU/RAM usage measured

\-   [ ] Long-duration stability tested

\-   [ ] Software versions recorded

\-   [ ] Final Raspberry Pi instructions documented

\------------------------------------------------------------------------

\# 34. Final Architecture

The intended final system is:

\`\`\` text

                 ┌───────────────────────┐

                 │   ECG Sensor/AFE      │

                 └───────────┬───────────┘

                             │

                             v

                    ┌─────────────────┐

                    │ ECG Acquisition │

                    └────────┬────────┘

                             │

                             v

                    ┌─────────────────┐

                    │ ECG Processing  │

                    └────────┬────────┘

                             │

                             │

                 ┌───────────v───────────┐

                 │ 20 Feature Extraction│

                 └───────────┬──────────┘

                             │

                             │

                 ┌───────────v───────────┐

                 │ 11 × 20 Feature      │

                 │ Temporal Buffer       │

                 └───────────┬───────────┘

                             │

                             v

                    ┌─────────────────┐

                    │ INT8 TFLite     │

                    │ Risk Model      │

                    └────────┬────────┘

                             │

                             v

                    ┌─────────────────┐

                    │ Risk Probability│

                    │ / State         │

                    └─────────────────┘



                 ┌───────────────────────┐

                 │ Respiration Sensor    │

                 └───────────┬───────────┘

                             │

                             v

                    ┌─────────────────┐

                    │ Resp Processing  │

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

\`\`\`

\------------------------------------------------------------------------

\## Project Status

**\*\*Current status:\*\***

*> Software deployment pipeline complete and verified through full INT8*

*> TFLite inference. Raspberry Pi raw-signal acquisition and end-to-end*

*> real-time integration are the next implementation phase.*

**\*\*Scope:\*\*** Research/engineering prototype.

**\*\*Not a clinical diagnostic or medical monitoring device.\*\***

\# Raspberry Pi Command Runbook --- Practical Execution Addendum

This addendum is to be kept with the existing \`RASPBERRY_PI.md\`. It

converts the deployment specification into a practical Raspberry Pi

command checklist. Commands labelled **\*\*VERIFIED\*\*** have already been

executed successfully on the current Raspberry Pi 4 (1 GB). Commands

labelled **\*\*NEXT / PLANNED\*\*** are implementation steps and must be

verified when executed.

\## Stage 0 --- Identify the Raspberry Pi

\`\`\` bash

cat /proc/device-tree/model

vcgencmd get_mem arm

grep MemTotal /proc/meminfo

free -m

cat /etc/os-release

python3 --version

\`\`\`

Current verified hardware:

\`\`\` text

Raspberry Pi 4 Model B Rev 1.1

arm=948M

\`\`\`

The Pi is a 1 GB model. This is sufficient for the current sensor

acquisition work.

\## Stage 1 --- Update Raspberry Pi OS

**\*\*VERIFIED\*\***

\`\`\` bash

sudo apt update

sudo apt full-upgrade -y

sudo reboot

\`\`\`

After reconnecting:

\`\`\` bash

sudo apt update

\`\`\`

\## Stage 2 --- Enable and verify I2C

\`\`\` bash

sudo raspi-config

\`\`\`

Select:

\`\`\` text

Interface Options

 -> I2C

 -> Enable

\`\`\`

Then:

\`\`\` bash

sudo reboot

\`\`\`

Verify:

\`\`\` bash

ls /dev/i2c\*

sudo apt install -y i2c-tools

i2cdetect -l

sudo i2cdetect -y 1

\`\`\`

Current verified external devices:

\`\`\` text

0x48 = ADS1115

0x57 = MAX30102

\`\`\`

Use bus 1:

\`\`\` text

/dev/i2c-1

\`\`\`

\## Stage 3 --- Create the Python environment

**\*\*VERIFIED\*\***

\`\`\` bash

mkdir -p \~/ads1115_test

cd \~/ads1115_test

sudo apt install -y swig python3-lgpio

python3 -m venv --system-site-packages .venv

source .venv/bin/activate

\`\`\`

Verify:

\`\`\` bash

python --version

python -c "import lgpio; print('lgpio OK')"

\`\`\`

Install the current sensor libraries:

\`\`\` bash

pip install adafruit-circuitpython-ads1x15

pip install smbus2

pip install matplotlib

\`\`\`

Verify:

\`\`\` bash

python -c "from smbus2 import SMBus; print('smbus2 OK')"

python -c "import matplotlib; print('Matplotlib OK:', matplotlib.\_\_version\_\_)"

\`\`\`

\## Stage 4 --- ADS1115 wiring and detection

Wiring:

\`\`\` text

ADS1115 VDD  -> Pi physical pin 1 (3.3 V)

ADS1115 GND  -> Pi physical pin 6 (GND)

ADS1115 SDA  -> Pi physical pin 3 (GPIO2/SDA)

ADS1115 SCL  -> Pi physical pin 5 (GPIO3/SCL)

ADS1115 ADDR -> unconnected (0x48)

ADS1115 ALRT -> unconnected

\`\`\`

Verify:

\`\`\` bash

sudo i2cdetect -y 1

\`\`\`

Expected device:

\`\`\` text

48

\`\`\`

**\*\*VERIFIED:\*\*** ADS1115 was detected at \`0x48\`.

\## Stage 5 --- ADS1115 A0 electrical tests

Temporary A0-to-GND test:

\`\`\` bash

nano ads1115_test.py

python ads1115_test.py

\`\`\`

The test program reads:

\`\`\` text

A0 raw ADC

A0 voltage

\`\`\`

Expected A0-to-GND result:

\`\`\` text

approximately 0 V

\`\`\`

Then temporarily connect A0 to 3.3 V and run:

\`\`\` bash

python ads1115_test.py

\`\`\`

Expected:

\`\`\` text

approximately 3.3 V

\`\`\`

**\*\*VERIFIED:\*\*** both tests passed.

\## Stage 6 --- NTC thermistor divider

Wire:

\`\`\` text

3.3 V

 |

10 kΩ fixed resistor

 |

 +---- ADS1115 A0

 |

10 kΩ NTC, B=3950

 |

GND

\`\`\`

Create/run:

\`\`\` bash

nano ntc_test.py

python ntc_test.py

\`\`\`

Current verified engineering result:

\`\`\` text

Voltage       ≈ 1.4536–1.4543 V

Resistance    ≈ 7896–7902 ohm

Calculated T  ≈ 30.39–30.41 °C

\`\`\`

This temperature is a Beta-model calculation, not a calibrated clinical

temperature measurement.

\## Stage 7 --- MAX30102 detection

Current breakout wiring:

\`\`\` text

MAX30102 VIN  -> Pi physical pin 1 (3.3 V)

MAX30102 GND  -> Pi physical pin 6 (GND)

MAX30102 SDA  -> Pi physical pin 3

MAX30102 SCL  -> Pi physical pin 5

MAX30102 INT  -> unused for current polling implementation

\`\`\`

Verify:

\`\`\` bash

sudo i2cdetect -y 1

\`\`\`

Expected:

\`\`\` text

57

\`\`\`

**\*\*VERIFIED:\*\*** MAX30102 detected at \`0x57\`.

\## Stage 8 --- MAX30102 identity check

Create:

\`\`\` bash

nano max30102_id_test.py

\`\`\`

Use the identity test already verified in this project, then run:

\`\`\` bash

python max30102_id_test.py

\`\`\`

Expected/current verified result:

\`\`\` text

PART_ID (0xFF): 0x15

REV_ID  (0xFE): 0x03

MAX30102 identity check: PASS

\`\`\`

\## Stage 9 --- MAX30102 direct FIFO test

Use the verified direct FIFO implementation:

\`\`\` bash

nano max30102_fifo_test.py

python max30102_fifo_test.py

\`\`\`

The implementation must read FIFO data as:

\`\`\` text

3 bytes RED + 3 bytes IR

\`\`\`

using the MAX30102 FIFO data register.

Current verified result:

\`\`\` text

Total samples read: 500

\`\`\`

The test ran for 5 seconds at a configured 100 Hz rate:

\`\`\` text

100 samples/s × 5 s = 500 samples

\`\`\`

This is the currently verified MAX30102 acquisition method. Do not

replace it with an unverified third-party Python package.

\## Stage 10 --- MAX30102 continuous PPG capture

Run the verified capture program:

\`\`\` bash

python max30102_ppg_capture.py

\`\`\`

Expected/current verified result:

\`\`\` text

Captured 1000 samples.

Saved to: max30102_ppg_capture.csv

\`\`\`

Check the file:

\`\`\` bash

ls -lh max30102_ppg_capture.csv

head max30102_ppg_capture.csv

\`\`\`

Current verified capture:

\`\`\` text

Duration       ≈ 9.99 s

Sample rate    ≈ 99.95 Hz

Samples        = 1000

\`\`\`

\## Stage 11 --- PPG plotting

Verify Matplotlib:

\`\`\` bash

python -c "import matplotlib; print('Matplotlib OK:', matplotlib.\_\_version\_\_)"

\`\`\`

Run:

\`\`\` bash

python max30102_plot.py

\`\`\`

Check generated files:

\`\`\` bash

ls -lh max30102_red_ppg.png max30102_ir_ppg.png

\`\`\`

Current files:

\`\`\` text

max30102_ppg_capture.csv

max30102_red_ppg.png

max30102_ir_ppg.png

\`\`\`

**\*\*CURRENT CHECKPOINT:\*\*** numerical PPG capture is verified. Actual

waveform quality must be inspected before claiming a usable

physiological PPG waveform.

\## Stage 12 --- PPG processing

**\*\*NEXT / PLANNED\*\***

Do not recapture or modify the verified FIFO implementation unless the

existing dataset is proven inadequate.

First inspect:

\`\`\` bash

cd \~/ads1115_test

ls -lh max30102_red_ppg.png max30102_ir_ppg.png

head max30102_ppg_capture.csv

\`\`\`

Then proceed:

\`\`\` text

raw RED/IR

 -> DC/AC analysis

 -> filtering

 -> pulse detection

 -> heart-rate estimation

 -> signal-quality assessment

 -> SpO2 processing

\`\`\`

Neonatal SpO2 claims require appropriate neonatal ground truth. PPG

acquisition alone is not clinical validation.

\## Stage 13 --- Clone/synchronize the project

**\*\*NEXT / PLANNED\*\***

If the project is hosted in a private Git repository:

\`\`\` bash

cd \~

git clone \<YOUR_PRIVATE_REPOSITORY_URL> neonatal-apnea-monitor

cd \~/neonatal-apnea-monitor

\`\`\`

For an existing clone:

\`\`\` bash

cd \~/neonatal-apnea-monitor

git pull

\`\`\`

Do not replace the repository URL with a guessed URL.

\## Stage 14 --- Deployment package

Verify:

\`\`\` bash

cd \~/neonatal-apnea-monitor

ls -lh deployment/model_int8.tflite

ls -lh deployment/edge_inference.py

ls -lh deployment/edge_specification.json

ls -lh deployment/deployment_manifest.json

\`\`\`

Model checksum:

\`\`\` bash

sha256sum deployment/model_int8.tflite

\`\`\`

Current model specification:

\`\`\` text

Input shape  = [1, 220]

Output shape = [1, 1]

Input type   = INT8

Output type  = INT8

\`\`\`

\## Stage 15 --- Raspberry Pi model smoke test

**\*\*NEXT / PLANNED\*\***

Activate the project environment:

\`\`\` bash

cd \~/neonatal-apnea-monitor

source .venv/bin/activate

\`\`\`

Run the existing deployment test/interface:

\`\`\` bash

python deployment/edge_inference.py

\`\`\`

If the script expects a prepared feature sequence, use the existing

project test harness rather than inventing a new input format.

The required model sequence is:

\`\`\` text

11 timesteps × 20 features = 220 values

\`\`\`

\## Stage 16 --- Thermistor/respiration acquisition

**\*\*NEXT / PLANNED\*\***

Target:

\`\`\` text

NTC divider

 -> ADS1115

 -> I2C

 -> Raspberry Pi

 -> raw ADC logging

 -> CSV

 -> waveform inspection

\`\`\`

First create the acquisition module:

\`\`\` text

raspberry_pi/acquisition/ads1115_reader.py

\`\`\`

Test it with:

\`\`\` bash

python raspberry_pi/acquisition/ads1115_reader.py

\`\`\`

Do not proceed to respiration peak detection until raw waveform

acquisition is verified.

\## Stage 17 --- ECG acquisition

**\*\*NEXT / PLANNED\*\***

The exact ECG hardware interface is not frozen in the current project

state.

The final module should provide:

\`\`\` text

timestamp

ECG sample

sampling rate

\`\`\`

Target file:

\`\`\` text

raspberry_pi/acquisition/ecg_reader.py

\`\`\`

\## Stage 18 --- Real-time signal processing

**\*\*NEXT / PLANNED\*\***

ECG:

\`\`\` text

Raw ECG

 -> causal/streaming filter

 -> R peaks

 -> RR

 -> HR

 -> HRV

\`\`\`

Current project parameters:

\`\`\` text

Bandpass: 0.5–40 Hz

Butterworth: order 4

Notch: 50 Hz, Q=30

Minimum RR: 0.30 s

\`\`\`

Respiration:

\`\`\` text

Raw respiration

 -> causal/streaming filter

 -> respiratory peaks

 -> intervals/rate

\`\`\`

Current parameters:

\`\`\` text

Bandpass: 0.03–2.0 Hz

Butterworth: order 4

Minimum peak distance: 0.8 s

Prominence: 0.1 × signal standard deviation

\`\`\`

Offline development used zero-phase filtering in places. Real-time

implementation must be causal/streaming and the difference must be

documented.

\## Stage 19 --- Feature extraction

**\*\*NEXT / PLANNED\*\***

Generate exactly these 20 features in this order:

\`\`\` text

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

resp_mean

resp_std

resp_rms

resp_peak_count

mean_resp_interval

std_resp_interval

mean_resp_rate

std_resp_rate

\`\`\`

\## Stage 20 --- Temporal buffer

**\*\*NEXT / PLANNED\*\***

Maintain 11 consecutive feature timesteps:

\`\`\` text

t1 ... t11

\`\`\`

When full:

\`\`\` text

shape = (11, 20)

\`\`\`

Then feed the deployment preprocessing and INT8 model.

The 15-second window is a physiological window immediately preceding a

project-defined event; it is not by itself proof of a 15-second

prediction horizon.

\## Stage 21 --- End-to-end inference

**\*\*NEXT / PLANNED\*\***

Target:

\`\`\` text

Raw ECG + respiration

 -> streaming preprocessing

 -> 20 features

 -> 11 × 20 buffer

 -> deployment preprocessing

 -> INT8 TFLite

 -> risk probability

\`\`\`

Current standalone edge inference accepts a prepared \`(11,20)\` feature

sequence. Raw-signal-to-risk on the Pi is not yet complete.

\## Stage 22 --- Custom dashboard

**\*\*NEXT / PLANNED\*\***

The Stitch-based standalone dashboard is now the target user interface.
It must use the same acquisition, processing and inference pipeline and
must expose two operating modes:

### Mode A --- SIMULATION

Use the existing website simulation layer.

```text
SIMULATION MODE
      |
      +--> simulated HR
      +--> simulated respiration
      +--> simulated SpO2
      +--> simulated temperature
      +--> simulated risk
      |
      +--> development waveforms
```

The dashboard may animate ECG/respiration/PPG in this mode because the
telemetry is explicitly simulated.

### Mode B --- RASPBERRY PI / LIVE

When the operator selects Raspberry Pi mode:

```text
Raspberry Pi
     |
     +--> ECG sensor
     +--> Respiration sensor
     +--> MAX30102 / PPG when available
     +--> Thermistor / ADS1115
     |
     v
Acquisition
     |
     v
Streaming processing
     |
     +--> raw/processed ECG samples
     +--> raw/processed respiration samples
     +--> HR / RR / HRV
     +--> PPG / SpO2 when valid
     |
     v
20-feature extraction
     |
     v
11 × 20 rolling feature buffer
     |
     v
INT8 TFLite inference
     |
     v
Dashboard API
     |
     v
Stitch-based dashboard
```

### Hardware connection rule

The dashboard must never fabricate a Raspberry Pi waveform.

In Raspberry Pi mode:

```text
Pi disconnected
     -> SHOW "RASPBERRY PI DISCONNECTED"
     -> NO LIVE WAVEFORM
     -> NO LIVE RISK OUTPUT

Pi connected but ECG sensor invalid
     -> ECG panel = "WAITING FOR ECG DATA"

Pi connected but respiration sensor invalid
     -> Respiration panel = "WAITING FOR RESPIRATION DATA"

ECG + respiration valid
     -> show live ECG + respiration waveforms
     -> show derived HR / RR

PPG valid
     -> show live PPG
     -> show SpO2 only when the PPG processing layer marks it valid

Feature buffer < 11 timesteps
     -> show "WAITING FOR FEATURE WINDOW"
     -> do not run/display a new risk result

11 × 20 buffer ready
     -> run INT8 inference
     -> display risk probability/state
```

The Raspberry Pi dashboard mode must use **actual sampled waveform data** from
the sensor/acquisition path. It must not reconstruct an ECG waveform merely
from the HR number.

HR and RR are derived telemetry values; they are not substitutes for the
underlying waveform samples.

### Recommended dashboard bridge

Use a small Python service on the Raspberry Pi rather than placing sensor
access inside the browser.

Recommended interface:

```text
raspberry_pi/
└── dashboard/
    ├── api.py
    └── protocol.py
```

The browser should consume a stable stream such as:

```text
WebSocket:
ws://<RASPBERRY_PI_IP>:8765/ws
```

and/or health/status endpoints:

```text
GET /api/health
GET /api/status
```

The message contract should contain at least:

```json
{
  "mode": "raspberry-pi",
  "connected": true,
  "timestamp": 0,
  "sensors": {
    "ecg": {"connected": true, "valid": true},
    "respiration": {"connected": true, "valid": true},
    "ppg": {"connected": true, "valid": true},
    "thermistor": {"connected": true, "valid": true}
  },
  "telemetry": {
    "heart_rate": null,
    "respiration_rate": null,
    "spo2": null,
    "temperature": null,
    "risk_probability": null,
    "risk_state": null
  },
  "feature_window_ready": false
}
```

For waveform data, send timestamped sample arrays or compact streaming
frames. Do not send only HR/RR and then synthesize the waveform in the
browser.

### Dashboard-side files

The standalone website should keep these responsibilities separate:

```text
website/js/simulation.js
    -> Simulation mode

website/js/pi-bridge.js
    -> Raspberry Pi connection / WebSocket / status

website/js/mode-manager.js
    -> SIMULATION <-> RASPBERRY PI toggle

website/js/waveforms.js
    -> renders the currently selected source

website/js/live-monitoring.js
    -> telemetry, risk state and dashboard updates
```

The UI toggle should always show the active source:

```text
[SIMULATION] [RASPBERRY PI]
```

When Raspberry Pi mode is selected but the Pi is unavailable, the page must
remain in a safe waiting state rather than falling back silently to simulation.

### Raspberry Pi dashboard/API setup

Use a non-privileged application port such as `8765`.

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip

cd ~/neonatal-apnea-monitor
python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
```

Install only the API packages actually used by the implementation. Do not
install a full web framework solely for the UI until the acquisition API
contract has been finalized.

Run the API during development with:

```bash
source ~/neonatal-apnea-monitor/.venv/bin/activate
python raspberry_pi/dashboard/api.py
```

Verify locally from the Raspberry Pi:

```bash
curl http://127.0.0.1:8765/api/health
curl http://127.0.0.1:8765/api/status
```

If the dashboard is served from another computer on the same LAN, replace
`127.0.0.1` with the Raspberry Pi's LAN address in the browser-side bridge.

### Network/service operation

After the API has been tested manually, create a systemd service so the
dashboard bridge starts automatically:

```bash
sudo nano /etc/systemd/system/neonatal-apnea-dashboard.service
```

Example service:

```ini
[Unit]
Description=Neonatal Apnea Raspberry Pi Dashboard Bridge
After=network-online.target
Wants=network-online.target

[Service]
User=pi
WorkingDirectory=/home/pi/neonatal-apnea-monitor
Environment="PATH=/home/pi/neonatal-apnea-monitor/.venv/bin"
ExecStart=/home/pi/neonatal-apnea-monitor/.venv/bin/python raspberry_pi/dashboard/api.py
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Replace `User=pi` and `/home/pi/...` with the actual Raspberry Pi username
and home directory.

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable neonatal-apnea-dashboard.service
sudo systemctl start neonatal-apnea-dashboard.service
sudo systemctl status neonatal-apnea-dashboard.service
```

Useful logs:

```bash
sudo journalctl -u neonatal-apnea-dashboard.service -f
```

The systemd service must not be considered complete until the API is actually
receiving valid sensor data.

### Dashboard target displays

The Stitch Live Monitoring page should consume:

```text
ECG waveform
Respiration waveform
RED/IR PPG when available
HR
Respiration rate
SpO2 when appropriately supported
Risk probability
Risk state
Signal quality
Inference latency
Timestamp/session information
Alerts
Raspberry Pi connection state
Per-sensor connection/validity state
```

### Live-mode truth rule

The dashboard must distinguish these three states:

```text
SIMULATION
    -> generated development telemetry

RPI CONNECTED / WAITING
    -> hardware connected, but one or more required sensor/data
       streams are not valid yet

RPI LIVE
    -> required sensor streams are valid and live telemetry is flowing
```

Never display simulated data while the UI says `RASPBERRY PI / LIVE`.

The 15-second window remains a physiological window immediately preceding a
project-defined event; it is not proof of a 15-second prediction horizon.

\## Stage 23 --- Performance measurements

**\*\*NEXT / PLANNED\*\***

Basic system checks:

\`\`\` bash

free -h

top

\`\`\`

Record:

\`\`\` text

ECG sampling rate

respiration sampling rate

ADC sampling rate

dropped samples

processing latency

TFLite latency

feature-to-output latency

CPU usage

RAM usage

\`\`\`

Do not report Raspberry Pi latency before measuring it.

\## Stage 24 --- Stability testing

**\*\*NEXT / PLANNED\*\***

Test progressively:

\`\`\` text

1 minute

10 minutes

30 minutes

longer if appropriate

\`\`\`

Record:

\`\`\` text

dropped samples

crashes

memory growth

CPU load

inference latency

sensor communication errors

dashboard stability

\`\`\`

\## Stage 25 --- Reproducibility

Record:

\`\`\` bash

python --version

uname -a

cat /etc/os-release

pip freeze

sha256sum deployment/model_int8.tflite

\`\`\`

Also record the sensor configuration and sampling rates.

\## Stage 26 --- Git workflow

\`\`\` bash

cd \~/neonatal-apnea-monitor

git status

git pull

git add .

git commit -m "Update Raspberry Pi acquisition"

git push

\`\`\`

Never commit passwords, API keys, private credentials, or

patient-identifying data.

\## Stage 27 --- Definition of done

\`\`\` text

[ ] ADS1115 detected

[ ] Thermistor ADC acquisition works

[ ] Respiration waveform observable

[ ] ECG acquisition works

[ ] ECG streaming processing works

[ ] Respiration streaming processing works

[ ] PPG acquisition works

[ ] PPG signal quality assessed

[ ] 20 features generated in correct order

[ ] 11 × 20 sequence generated

[ ] INT8 TFLite model loads

[ ] INT8 inference works

[ ] Reference equivalence checked

[ ] Raw-signal-to-risk pipeline works

[ ] Custom dashboard displays pipeline data

[ ] Raspberry Pi latency measured

[ ] CPU/RAM usage measured

[ ] Long-duration stability tested

[ ] Software versions recorded

[ ] Final Raspberry Pi instructions documented

\`\`\`

\## Stage 28 --- Golden execution rule

For every new hardware/software stage:

\`\`\` text

1\. Wire hardware

2\. Detect hardware

3\. Test raw data

4\. Save raw data

5\. Verify sampling rate

6\. Plot/inspect data

7\. Implement processing

8\. Validate processing

9\. Generate features

10\. Test model

11\. Measure performance

12\. Only then move forward

\`\`\`

Never jump directly from I2C detection to ML inference.

\## Stage 29 --- Current verified state

\`\`\` text

PASS  Raspberry Pi 4 1 GB identification

PASS  Raspberry Pi OS update

PASS  I2C enabled

PASS  ADS1115 @ 0x48

PASS  ADS1115 voltage tests

PASS  NTC divider test

PASS  MAX30102 @ 0x57

PASS  MAX30102 PART_ID = 0x15

PASS  MAX30102 FIFO generation

PASS  Direct FIFO reading

PASS  500 samples / 5 seconds

PASS  1000 samples / 10 seconds

PASS  \~99.95 Hz recorded PPG acquisition

PASS  CSV generation

PASS  Matplotlib installation

NEXT  PPG waveform quality inspection

NEXT  PPG processing

NEXT  respiration streaming acquisition

NEXT  ECG acquisition

NEXT  20-feature live extraction

NEXT  11 × 20 live buffer

NEXT  raw-signal-to-TFLite integration

NEXT  custom dashboard

NEXT  latency/stability measurements

\`\`\`


\# Practical Hardware Assembly + `sudo` Command Runbook

This section makes the existing implementation plan executable on the
Raspberry Pi without changing the verified scientific architecture.

Use `sudo` only for operating-system administration, hardware-interface
configuration, package installation, device discovery, and service management.
Run project Python programs as the normal user inside the virtual environment.
Do not routinely run the project Python programs with `sudo`, because that can
create root-owned files and hides permission/configuration problems.

Official Raspberry Pi documentation confirms I2C can be enabled with
`sudo raspi-config` and that enabling I2C loads the required interface at boot.
The commands below therefore preserve the existing I2C workflow. \cite{raspberrypi_i2c}

---

\## Hardware Stage 0 --- Pi identification

Before hardware assembly, confirm the board and OS:

```bash
cat /proc/device-tree/model
free -h
cat /etc/os-release
python3 --version
```

No `sudo` is required for these read-only checks.

---

\## Hardware Stage 1 --- OS preparation

```bash
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

After reconnecting:

```bash
sudo apt update
```

Do not start wiring until the system returns normally after reboot.

---

\## Hardware Stage 2 --- Enable I2C

Open the Raspberry Pi configuration tool:

```bash
sudo raspi-config
```

Select:

```text
3 Interface Options
    -> I5 I2C
       -> Enable
```

Then reboot:

```bash
sudo reboot
```

Verify the interface:

```bash
ls /dev/i2c*
sudo apt install -y i2c-tools
i2cdetect -l
sudo i2cdetect -y 1
```

Expected bus:

```text
/dev/i2c-1
```

---

\## Hardware Stage 3 --- Python/system dependencies

Install system packages:

```bash
sudo apt update
sudo apt install -y \
  python3-venv \
  python3-pip \
  python3-dev \
  python3-lgpio \
  swig \
  i2c-tools
```

Create/use the project environment:

```bash
cd ~/neonatal-apnea-monitor
python3 -m venv --system-site-packages .venv
source .venv/bin/activate
```

Install application packages inside the venv:

```bash
pip install --upgrade pip
pip install adafruit-circuitpython-ads1x15
pip install smbus2
pip install matplotlib
```

Verify:

```bash
python -c "import lgpio; print('lgpio OK')"
python -c "from smbus2 import SMBus; print('smbus2 OK')"
```

Raspberry Pi OS documentation and current Raspberry Pi guidance support the
use of virtual environments for Python applications. \cite{raspberrypi_python}

---

\## Hardware Stage 4 --- ADS1115 physical assembly

**Power rule:** before moving wires, disconnect the Pi from power. If the Pi
is running and must be shut down first:

```bash
sudo shutdown -h now
```

Wire:

```text
ADS1115 VDD  -> Pi pin 1  (3.3 V)
ADS1115 GND  -> Pi pin 6  (GND)
ADS1115 SDA  -> Pi pin 3  (GPIO2 / SDA)
ADS1115 SCL  -> Pi pin 5  (GPIO3 / SCL)
ADS1115 ADDR -> unconnected (0x48)
ADS1115 ALRT -> unconnected
```

After powering the Pi:

```bash
sudo i2cdetect -y 1
```

Expected:

```text
48
```

Do not proceed if the device is not detected.

---

\## Hardware Stage 5 --- ADS1115 A0 electrical validation

Use the verified test program:

```bash
cd ~/ads1115_test
source .venv/bin/activate
python ads1115_test.py
```

Check A0-to-GND:

```text
expected ≈ 0 V
```

Then temporarily check A0-to-3.3 V:

```bash
python ads1115_test.py
```

```text
expected ≈ 3.3 V
```

If the Python program reports I2C permission errors, do not solve this by
running the application permanently with `sudo`. Add the user to the I2C
group:

```bash
sudo usermod -aG i2c "$USER"
```

Log out and back in, then repeat the normal-user test.

---

\## Hardware Stage 6 --- NTC thermistor + ADS1115

Power down before changing the divider wiring:

```bash
sudo shutdown -h now
```

Wire:

```text
3.3 V
  |
10 kΩ fixed resistor
  |
  +---- ADS1115 A0
  |
10 kΩ NTC thermistor, B=3950
  |
 GND
```

After power-up, verify the ADC:

```bash
sudo i2cdetect -y 1
```

Then run the verified NTC test as the normal user:

```bash
cd ~/ads1115_test
source .venv/bin/activate
python ntc_test.py
```

The existing verified engineering result remains the reference for this stage;
it is not a clinical temperature measurement.

---

\## Hardware Stage 7 --- MAX30102 physical assembly

Power down before wiring:

```bash
sudo shutdown -h now
```

Wire:

```text
MAX30102 VIN -> Pi pin 1  (3.3 V)
MAX30102 GND -> Pi pin 6  (GND)
MAX30102 SDA -> Pi pin 3
MAX30102 SCL -> Pi pin 5
MAX30102 INT -> unused in current polling implementation
```

After power-up:

```bash
sudo i2cdetect -y 1
```

Expected:

```text
57
```

The existing project verification recorded `0x57` for the MAX30102.

---

\## Hardware Stage 8 --- MAX30102 identity

Run as the normal project user:

```bash
cd ~/ads1115_test
source .venv/bin/activate
python max30102_id_test.py
```

Expected:

```text
PART_ID (0xFF): 0x15
REV_ID  (0xFE): 0x03
MAX30102 identity check: PASS
```

If the device disappears from the bus, first run:

```bash
sudo i2cdetect -y 1
```

Do not proceed to FIFO acquisition until the address is visible again.

---

\## Hardware Stage 9 --- MAX30102 FIFO acquisition

Use the verified direct FIFO implementation:

```bash
source ~/ads1115_test/.venv/bin/activate
cd ~/ads1115_test
python max30102_fifo_test.py
```

No `sudo` is required for the normal acquisition process.

The implementation must continue to use the verified:

```text
3 bytes RED + 3 bytes IR
```

FIFO format.

---

\## Hardware Stage 10 --- Continuous PPG capture

Run:

```bash
source ~/ads1115_test/.venv/bin/activate
cd ~/ads1115_test
python max30102_ppg_capture.py
```

Then:

```bash
ls -lh max30102_ppg_capture.csv
head max30102_ppg_capture.csv
```

A successful numerical capture is not, by itself, a claim of usable physiological
PPG quality.

---

\## Hardware Stage 11 --- PPG plotting

Run as the normal user:

```bash
source ~/ads1115_test/.venv/bin/activate
python max30102_plot.py
```

Check:

```bash
ls -lh max30102_red_ppg.png max30102_ir_ppg.png
```

Inspect the plots before moving to PPG processing.

---

\## Hardware Stage 12 --- PPG processing

No additional `sudo` command is normally required.

Use:

```bash
source ~/ads1115_test/.venv/bin/activate
cd ~/ads1115_test
ls -lh max30102_red_ppg.png max30102_ir_ppg.png
head max30102_ppg_capture.csv
```

Then continue with:

```text
RED/IR
 -> DC/AC analysis
 -> filtering
 -> pulse detection
 -> HR estimation
 -> signal-quality assessment
 -> SpO2 processing
```

---

\## Hardware Stage 13 --- Synchronize the Git repository

Do not use `sudo git`.

For an existing clone:

```bash
cd ~/neonatal-apnea-monitor
git pull
```

For a new clone:

```bash
cd ~
git clone <PRIVATE_REPOSITORY_URL> neonatal-apnea-monitor
cd ~/neonatal-apnea-monitor
```

Do not put passwords or tokens into the repository URL or shell history.

---

\## Hardware Stage 14 --- Verify deployment package

As the normal user:

```bash
cd ~/neonatal-apnea-monitor

ls -lh deployment/model_int8.tflite
ls -lh deployment/edge_inference.py
ls -lh deployment/edge_specification.json
ls -lh deployment/deployment_manifest.json

sha256sum deployment/model_int8.tflite
```

No `sudo` is expected here.

---

\## Hardware Stage 15 --- TFLite smoke test

Activate the environment:

```bash
cd ~/neonatal-apnea-monitor
source .venv/bin/activate
python deployment/edge_inference.py
```

Use the existing project harness for prepared `(11, 20)` input.

Do not fabricate raw ECG/respiration support at this stage.

---

\## Hardware Stage 16 --- Live respiration acquisition

Before connecting/changing the respiration hardware:

```bash
sudo shutdown -h now
```

After booting, verify:

```bash
sudo i2cdetect -y 1
```

Then run the acquisition module as the normal user:

```bash
cd ~/neonatal-apnea-monitor
source .venv/bin/activate
python raspberry_pi/acquisition/ads1115_reader.py
```

The dashboard must remain in:

```text
RPI CONNECTED / WAITING
```

until the live respiration samples pass validity checks.

---

\## Hardware Stage 17 --- Live ECG acquisition

The exact ECG acquisition interface is not yet frozen in the source document,
so no device-specific `sudo` command should be invented.

After the ECG hardware is finalized, the acquisition flow should be:

```text
ECG sensor
  -> ECG acquisition interface
  -> timestamp
  -> sample
  -> sampling rate
```

The implementation should expose a stable Python interface:

```python
samples = ecg_reader.read()
```

Only the hardware driver should know the physical ECG interface.

---

\## Hardware Stage 18 --- Real-time ECG/respiration processing

Use the normal virtual environment:

```bash
cd ~/neonatal-apnea-monitor
source .venv/bin/activate
```

No `sudo` should be used for routine signal processing.

Required real-time chain:

```text
ECG
 -> causal 0.5–40 Hz Butterworth, order 4
 -> 50 Hz notch, Q=30
 -> R peaks
 -> RR
 -> HR
 -> HRV

Respiration
 -> causal 0.03–2.0 Hz Butterworth, order 4
 -> peak detection
 -> intervals/rate
```

Do not silently substitute offline zero-phase filtering for the real-time causal
implementation.

---

\## Hardware Stage 19 --- Feature extraction

Run as the normal user:

```bash
cd ~/neonatal-apnea-monitor
source .venv/bin/activate
```

Generate exactly 20 features in the documented order.

No feature value should be invented simply because a sensor stream is absent.

---

\## Hardware Stage 20 --- 11 × 20 temporal buffer

The rolling buffer is:

```text
t1 ... t11
```

When full:

```text
shape = (11, 20)
```

Only then should the deployment preprocessing and INT8 inference stage run.

---

\## Hardware Stage 21 --- Raw-signal-to-risk integration

Target:

```text
Raw ECG + raw respiration
        |
        v
Streaming preprocessing
        |
        v
20 features
        |
        v
11 × 20
        |
        v
Deployment preprocessing
        |
        v
INT8 TFLite
        |
        v
Risk probability
```

The current standalone engine still expects prepared `(11,20)` input. The
raw-signal-to-risk implementation remains a development task.

---

\## Hardware Stage 22 --- Connect the Stitch dashboard

Start the Raspberry Pi dashboard bridge:

```bash
cd ~/neonatal-apnea-monitor
source .venv/bin/activate
python raspberry_pi/dashboard/api.py
```

Verify locally:

```bash
curl http://127.0.0.1:8765/api/health
curl http://127.0.0.1:8765/api/status
```

The dashboard's `RASPBERRY PI` mode must use the live bridge.

If no Pi is connected:

```text
RASPBERRY PI MODE
STATUS: DISCONNECTED
ECG: WAITING
RESP: WAITING
PPG: WAITING
RISK: WAITING FOR LIVE FEATURE WINDOW
```

Do not automatically switch back to simulation while the UI says Raspberry Pi.

For development, serve the standalone website separately:

```bash
cd ~/neonatal-apnea-monitor/website
python3 -m http.server 8080
```

The browser then connects to the Raspberry Pi API/stream using the configured
Pi address.

---

\## Hardware Stage 23 --- Performance measurement

Run:

```bash
free -h
top
```

Record:

```text
ECG sampling rate
respiration sampling rate
ADC sampling rate
dropped samples
processing latency
TFLite latency
feature-to-output latency
CPU usage
RAM usage
dashboard/API latency
sensor communication errors
```

Do not report a Raspberry Pi latency value until it has been measured.

---

\## Hardware Stage 24 --- Stability testing

For an automatically running dashboard bridge:

```bash
sudo systemctl status neonatal-apnea-dashboard.service
sudo journalctl -u neonatal-apnea-dashboard.service -f
```

Perform:

```text
1 minute
10 minutes
30 minutes
```

and longer testing when appropriate.

Record:

```text
sensor disconnect/reconnect behavior
dropped samples
service restarts
memory growth
CPU load
inference latency
dashboard reconnect behavior
```

---

\## Hardware Stage 25 --- Reproducibility

Record:

```bash
python --version
uname -a
cat /etc/os-release
pip freeze
sha256sum deployment/model_int8.tflite
```

For the running service:

```bash
sudo systemctl status neonatal-apnea-dashboard.service
sudo journalctl -u neonatal-apnea-dashboard.service --no-pager -n 100
```

---

\## Hardware Stage 26 --- Git workflow

Use the normal user:

```bash
cd ~/neonatal-apnea-monitor
git status
git pull
git add raspberry_pi website deployment
git commit -m "Integrate Raspberry Pi dashboard pipeline"
git push
```

Never use:

```bash
sudo git ...
```

Never commit credentials, tokens, or patient-identifying data.

---

\## Hardware Stage 27 --- Definition of done

```text
[ ] ADS1115 detected
[ ] NTC/ADS1115 acquisition works
[ ] Respiration waveform observable from live samples
[ ] ECG acquisition works
[ ] ECG streaming processing works
[ ] Respiration streaming processing works
[ ] PPG acquisition works
[ ] PPG signal quality assessed
[ ] 20 features generated in exact order
[ ] 11 × 20 sequence generated
[ ] INT8 TFLite model loads
[ ] INT8 inference works
[ ] Reference equivalence checked
[ ] Raw-signal-to-risk pipeline works
[ ] Raspberry Pi API health/status works
[ ] Stitch dashboard simulation mode works
[ ] Stitch dashboard Raspberry Pi mode works
[ ] Raspberry Pi mode shows no synthetic waveform when sensors are absent
[ ] Live ECG/respiration waveforms use actual sensor samples
[ ] Live HR/RR reflect processed sensor data
[ ] Risk output appears only when a valid feature window is ready
[ ] Raspberry Pi latency measured
[ ] CPU/RAM usage measured
[ ] Dashboard reconnect/disconnect behavior tested
[ ] Long-duration stability tested
[ ] Software versions recorded
[ ] Final Raspberry Pi instructions documented
```

---

\## Hardware Stage 28 --- Golden execution rule

For every physical hardware integration:

```text
1. Power down safely
2. Wire hardware
3. Power up
4. Detect hardware
5. Confirm device address/interface
6. Test raw data
7. Save raw data
8. Verify sampling rate
9. Plot/inspect the waveform
10. Implement streaming processing
11. Validate processing
12. Generate features
13. Fill 11 × 20 buffer
14. Test INT8 model
15. Connect dashboard
16. Verify live-mode truth state
17. Measure performance
18. Only then move to the next stage
```

Never jump directly from I2C detection to ML inference.

---

\## Hardware Stage 29 --- Privilege summary

Use `sudo` for:

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install ...
sudo raspi-config
sudo reboot
sudo shutdown -h now
sudo i2cdetect -y 1
sudo usermod -aG i2c "$USER"
sudo systemctl ...
sudo journalctl ...
```

Run ordinary project programs without `sudo`:

```bash
python ...
pip ...
git ...
curl ...
```

This separation keeps hardware/system configuration privileged while keeping
application files owned by the project user.

---

\## Scientific limitations that must remain in the documentation

\-   The development dataset contains only 5 positive precursor windows.

\-   Positive examples come from only 3 of 10 infants.

\-   Development/validation results are not clinical validation.

\-   PICS-derived event candidates must not automatically be called

    confirmed apnea.

\-   The 15-second precursor window does not itself prove a 15-second

    prediction horizon.

\-   The 0.50 threshold is not clinically calibrated.

\-   INT8 verification demonstrates deployment consistency, not clinical

    predictive validity.

\-   The current edge engine expects prepared feature sequences.

\-   Raw ECG-to-inference on the Raspberry Pi is not yet complete.

\-   Raw respiration-to-inference on the Raspberry Pi is not yet

    complete.

\-   Raspberry Pi runtime/latency has not yet been fully measured.

\-   PPG/SpO2 integration remains under development.

\-   The system is a research/engineering prototype, not a clinical

    diagnostic or monitoring device.

---

\## Modification note --- Hardware + Stitch dashboard readiness

This revised document preserves the existing deployment model, feature order,
signal-processing parameters, verified ADS1115/MAX30102 checkpoints, and
scientific limitations.

The additions provide:

- explicit `sudo` commands for OS, I2C, device discovery, permissions and
  service management;
- normal-user commands for Python acquisition and inference;
- a two-mode Stitch dashboard contract: **SIMULATION** and **RASPBERRY PI**;
- a strict rule that Raspberry Pi mode must never silently generate synthetic
  waveforms;
- per-sensor connection/validity states;
- live-waveform and telemetry data separation;
- a Raspberry Pi API/stream boundary for the standalone dashboard;
- automatic service startup and log commands;
- a final hardware/dashboard definition-of-done checklist.

The raw-signal-to-risk pipeline remains a planned integration step where the
original document says it is not yet complete. No new clinical validation
claim is introduced.
