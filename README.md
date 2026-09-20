# Precursor-Based Early Warning of Neonatal Apnea and Desaturation via Edge-Deployed Cardiorespiratory Risk Prediction

> **Engineering feasibility prototype for cardiorespiratory precursor analysis and lightweight edge-deployable risk inference.**
>
> **Important:** This project is a research/engineering prototype. It is **not clinically validated** and must not be interpreted as a clinical neonatal apnea diagnostic or prediction system.

## 1. Project Overview

This project investigates whether physiological changes preceding neonatal cardiorespiratory events can be represented using ECG and respiration-derived features and processed by a lightweight machine-learning model suitable for eventual edge deployment.

The intended pipeline is:

```text
ECG + Respiration + PPG/SpO2 + Temperature
                    |
                    v
             Signal Acquisition
                    |
                    v
              Preprocessing
                    |
                    v
        Physiological Feature Extraction
                    |
                    v
          Neonatal Event Detection
                    |
                    v
        Precursor/Risk Window Creation
                    |
                    v
       Subject-Independent Validation
                    |
                    v
       Temporal Risk Classification
                    |
                    v
             INT8 Quantization
                    |
                    v
              TFLite Model
                    |
                    v
          Raspberry Pi Edge Target
```

The central research idea is a **backward-walk precursor approach**: instead of treating an event annotation itself as the prediction target, the pipeline examines a fixed window immediately preceding a project-derived physiological event candidate.

The current implementation uses a **15-second pre-event window**. This demonstrates the use of pre-event physiological information but **does not establish a validated 15-second prediction lead time**.

## 2. Project Objectives

- Develop a reproducible ECG and respiration signal-processing pipeline.
- Validate signal-processing components against available reference annotations.
- Analyze neonatal physiological event candidates using ECG and respiration.
- Create precursor/risk representations from pre-event windows.
- Evaluate lightweight baseline and temporal ML models using Leave-One-Subject-Out (LOSO) validation.
- Convert a lightweight model to Float32 and full-INT8 TFLite.
- Verify numerical equivalence through the deployment conversion chain.
- Develop an eventual Raspberry Pi edge-inference pipeline.
- Experimentally validate an NTC thermistor as an auxiliary respiration waveform source.
- Establish a foundation for future multimodal ECG/respiration/PPG/SpO2 edge monitoring.

## 3. Scope and Scientific Limitations

### Demonstrated

- ECG R-peak detection validation.
- Respiration peak detection validation on BIDMC data.
- Neonatal event-analysis methodology on PICS recordings.
- Subject-independent LOSO evaluation structure.
- Lightweight temporal classification experiments.
- TFLite Float32 and INT8 conversion.
- Numerical verification of the deployment model.
- Initial thermistor circuit design and theoretical validation.

### Not demonstrated

- Clinical validation.
- Reliable neonatal apnea prediction.
- Confirmed apnea ground truth for PICS-derived candidates.
- A clinically validated prediction horizon.
- Real-time raw-signal processing on Raspberry Pi.
- Hardware-validated thermistor respiration sensing.
- Full integrated PPG/SpO2 hardware inference.

The current Stage-4 ML development dataset contains:

- **55 total windows**
- **5 precursor/event-candidate windows**
- **50 control windows**
- **10 infants**
- **3 infants containing positive precursor windows**

Therefore, the machine-learning results are **development/feasibility evidence**, not generalizable predictive-performance validation.

## 4. Dataset Sources

### Apnea-ECG

Used primarily for exploratory ECG/HRV analysis.

Example record:

```text
a01
Sampling rate: 100 Hz
Samples: 2,957,000
Duration: ~492.83 minutes
```

These experiments are not neonatal multimodal validation.

### BIDMC

Used for signal-processing validation with ECG, PPG, impedance respiration and numerical physiological measurements.

The project used reference information to validate ECG processing, respiration detection and PPG-derived pulse estimation.

### PICS

The primary neonatal physiological data source.

The project processes ECG and respiration recordings from 10 infants.

An important methodological distinction is maintained:

> PICS `.atr` annotations are treated as bradycardia-related annotations and are **not automatically treated as confirmed apnea ground truth**.

Project-derived event categories include:

- `apnea_candidate`
- `short_resp_with_brady`
- `respiratory_suppression`
- `bradycardia_only`

## 5. Repository Structure

```text
neonatal-apnea-monitor/
|
├── README.md
├── requirements.txt
├── .gitignore
|
├── notebooks/
|   ├── 01_explore_apnea_ecg.ipynb
|   ├── 02_signal_processing_pipeline.ipynb
|   ├── 02b_bidmc_signal_processing_validation.ipynb
|   ├── 03_neonatal_event_detection.ipynb
|   ├── 03b_pics_multi_infant_validation.ipynb
|   ├── 04_final_precursor_risk_dataset_clean.ipynb
|   ├── 05_thermistor_validation.ipynb
|   └── archive/
|
├── deployment/
|   ├── model_int8.tflite
|   ├── edge_inference.py
|   ├── edge_specification.json
|   ├── deployment_manifest.json
|   └── sklearn_reference_bundle.joblib
|
├── reports/
|   ├── validation reports
|   ├── model metrics
|   └── deployment checkpoints
|
├── data/
|   ├── raw/
|   └── processed/
|
└── hardware/
    └── thermistor/
```

## 6. Notebook Workflow

### Notebook 01 — Exploratory Apnea-ECG Analysis

`01_explore_apnea_ecg.ipynb`

Includes:

- Apnea-ECG inspection.
- 30-second segmentation.
- ECG and HRV feature extraction.
- Logistic Regression.
- Balanced Logistic Regression.
- Random Forest.
- Balanced Random Forest.
- Exploratory threshold analysis.

The exploratory results are not presented as neonatal clinical performance.

### Notebook 02 — ECG Signal Processing

`02_signal_processing_pipeline.ipynb`

Processing includes:

- 0.5–40 Hz Butterworth bandpass filtering.
- Order 4 filtering.
- 50 Hz notch filtering.
- R-peak detection.
- RR interval extraction.
- HR estimation.
- SDNN.
- RMSSD.
- Welch spectral analysis.

Example a01 results:

```text
R peaks:       29,941
Mean HR:       62.46 bpm
SDNN:          159.30 ms
RMSSD:         77.19 ms
LF/HF:         5.032
```

### Notebook 02b — BIDMC Signal Processing Validation

`02b_bidmc_signal_processing_validation.ipynb`

Example respiration validation:

```text
Reference breaths: 170
Detected breaths:  170
TP:                 170
FP:                   0
FN:                   0
Sensitivity:        100%
Precision:          100%
```

Mean timing error was approximately `0.0618 s`.

A quality-aware PPG comparison was also performed. Long waveform gaps were not automatically interpreted as physiological bradycardia.

## 7. Neonatal Event Detection

### Notebook 03

`03_neonatal_event_detection.ipynb`

The detector combines ECG-derived heart-rate information with respiration analysis:

```text
ECG -> filtering -> R peaks -> RR/HR -> bradycardia
Respiration -> filtering -> respiratory peaks -> suppression
                         |
                         v
                    overlap analysis
                         |
                         v
                     event category
```

PICS bradycardia annotations are not automatically classified as apnea.

Example ECG detector validation:

```text
Official R peaks: 128
Detected R peaks: 129

50 ms tolerance:
TP = 128
FP = 1
FN = 0

Sensitivity = 100%
Precision   = 99.22%
```

This is detector validation, not clinical outcome validation.

## 8. Multi-Infant PICS Validation

### Notebook 03b

`03b_pics_multi_infant_validation.ipynb`

The event-detection pipeline was extended across all 10 PICS infants.

Three respiratory-suppression candidates were identified among selected development events:

```text
Infant 3 Event 3
Infant 9 Event 1
Infant 9 Event 2
```

These are project-derived candidates, not confirmed apnea events.

## 9. Final Precursor/Risk Dataset

### Notebook 04

`04_final_precursor_risk_dataset_clean.ipynb`

This is the authoritative Stage-4 development notebook.

Five precursor windows were frozen:

```text
Infant 1 Event 2
Infant 3 Event 2
Infant 3 Event 3
Infant 9 Event 1
Infant 9 Event 2
```

Each is:

```text
event onset - 15 seconds -> event onset
```

Final development dataset:

```text
Total windows:       55
Control windows:     50
Precursor windows:    5
Infants:             10
Positive-bearing:     3
```

## 10. Feature Set

Twenty physiological features are used at each timestep.

### ECG

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

### Respiration

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

Temporal representation:

```text
11 timesteps x 20 features
```

Therefore each sequence contains 220 feature values.

## 11. Leave-One-Subject-Out Validation

The final development evaluation uses **Leave-One-Subject-Out (LOSO)** validation.

Imputation and scaling are fitted on the training portion of each fold and applied to the held-out infant.

This is intended to prevent subject and preprocessing leakage.

A major limitation remains: 7 of the 10 folds contain no positive test windows because only 3 infants contain positive windows.

## 12. Machine-Learning Results

### Temporal Logistic Regression

```text
Accuracy:     0.8909
Sensitivity:  0.40  (2/5)
Specificity:  0.94
Precision:    0.40
F1:           0.40
AUROC:        0.824
AUPRC:        0.305
```

Confusion matrix:

```text
[[47, 3],
 [ 3, 2]]
```

The 89.09% accuracy should not be interpreted as strong predictive performance because the dataset is approximately 91% negative. An all-negative classifier would already obtain approximately 90.9% accuracy.

### GRU

Architecture:

```text
Input:       11 x 20
GRU:         16 units
Dropout:     0.20
Dense:       8 ReLU
Output:      1 sigmoid
Parameters:  1969
```

Results:

```text
Accuracy:     0.6000
Sensitivity:  0.60  (3/5)
Specificity:  0.60
Precision:    0.1304
F1:           0.2143
AUROC:        0.716
AUPRC:        0.329
```

Confusion matrix:

```text
[[30, 20],
 [ 2,  3]]
```

### 1D CNN

Results:

```text
Accuracy:     0.8182
Sensitivity:  0
Specificity:  0.90
Precision:    0
F1:           0
AUROC:        0.588
AUPRC:        0.139
```

Confusion matrix:

```text
[[45, 5],
 [ 5, 0]]
```

The CNN failed to detect any of the five positive precursor windows in this development experiment.

### Interpretation

These experiments demonstrate **pipeline feasibility**, not reliable neonatal apnea prediction.

The extremely small positive sample count makes sensitivity, precision, F1, AUROC and AUPRC estimates highly uncertain.

The temporal Logistic Regression was selected as the deployment reference model because it provided the most stable development behavior and highest development AUROC among the tested models. This is an engineering selection decision, not a claim of clinical superiority.

## 13. Edge Deployment

The selected deployment model is a lightweight temporal Logistic Regression.

Input:

```text
11 x 20
```

Flattened:

```text
220 values
```

Conversion chain:

```text
Scikit-learn
      |
      v
Keras equivalent
      |
      v
Float32 TFLite
      |
      v
INT8 TFLite
      |
      v
Standalone edge inference
```

### Verification

Sklearn -> Keras:

```text
Maximum probability difference: ~2.8e-08
Prediction mismatches: 0
```

Float32 TFLite:

```text
Maximum difference: ~2.0e-07
Prediction mismatches: 0
```

INT8 TFLite:

```text
Maximum probability difference: ~0.00565
Mean probability difference:    ~0.00125
Prediction mismatches:          0
```

This verifies the numerical integrity of the model-conversion pipeline over the current development dataset.

## 14. Current Edge-Deployment Limitation

The current standalone deployment engine expects an already processed:

```text
11 x 20 feature sequence
```

It does **not yet** perform the complete raw-signal pipeline on the Raspberry Pi.

The remaining real-time path is:

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
RR/HRV features
   |
Raw respiration
   |
   v
Respiration processing
   |
   v
Respiration features
   |
   v
11 x 20 feature sequence
   |
   v
INT8 TFLite
   |
   v
Risk probability
```

Therefore the current work should be described as **quantized edge-model deployment and numerical verification**, not complete real-time raw-signal Raspberry Pi inference.

## 15. Thermistor Hardware Branch

Hardware:

```text
Thermistor: MF52A103J3950
R25:        10 kOhm
Beta:       3950 K
Tolerance:  +/-5%
Fixed R:    10 kOhm
ADC:        ADS1115
Resolution: 16-bit
Interface:  I2C
Target:     Raspberry Pi 4
```

Circuit:

```text
3.3 V
 |
10 kOhm fixed resistor
 |
 +-------- ADS1115 A0
 |
10 kOhm NTC
 |
GND
```

At 25 C:

```text
NTC resistance = 10 kOhm
Divider voltage = 1.65 V
Divider current = 165 uA
```

Theoretical Beta-model response has been verified.

### Current status

The hardware has **not yet been assembled**.

After assembly, planned validation includes:

1. ADS1115 I2C communication
2. Raw ADC acquisition
3. Voltage conversion
4. Signal stability
5. Respiratory waveform visibility
6. Respiratory peak detection
7. Respiratory rate estimation
8. Respiratory pause detection
9. Signal-quality assessment

## 16. PPG and SpO2

PPG processing has been explored and validated using BIDMC data with quality-aware handling of waveform gaps.

SpO2 has not yet been integrated into the final model.

Additional hardware modalities should be integrated after the core ECG/respiration/edge path is established.

## 17. Reproducibility

The project uses deterministic seeds where applicable and saves:

- feature datasets
- temporal arrays
- model metrics
- model checkpoints
- deployment artifacts
- configuration
- feature specifications
- validation reports

Raw PhysioNet datasets are not included in this repository. Users should obtain the datasets through their respective official sources and place them under the expected local data directories.

## 18. Scientific Boundaries

### Not claimed

- Clinical validation
- Clinical diagnosis
- Reliable neonatal apnea prediction
- Confirmed apnea ground truth from PICS bradycardia annotations
- Validated 15-second prediction lead time
- Full real-time Raspberry Pi raw-signal inference
- Experimentally validated thermistor respiration sensing

### Current defensible claims

The project demonstrates:

- Ground-truth-anchored ECG signal-processing validation.
- Respiration signal-processing validation.
- A neonatal event-analysis pipeline.
- A subject-independent LOSO evaluation framework.
- Feasibility of temporal precursor-window modeling.
- Lightweight model conversion to Float32 and INT8 TFLite.
- Numerical verification of the deployment conversion chain.
- Initial thermistor hardware design and theoretical verification.

## 19. Future Work

### Critical

1. Assemble and experimentally validate the thermistor/ADS1115 circuit.
2. Acquire real thermistor waveforms.
3. Establish respiratory waveform quality and detection performance.
4. Port the required raw ECG/respiration preprocessing to the Raspberry Pi.
5. Measure actual on-device inference latency and throughput.
6. Maintain strict separation between development results and future validation.

### Important

1. Expand the number of positive neonatal events and positive-bearing infants.
2. Establish better event/reference labeling.
3. Investigate whether physiological information appears earlier within the 15-second pre-event window.
4. Evaluate lead-time-specific prediction.
5. Add reproducibility configuration and environment files.
6. Perform additional model ablations only when supported by sufficient data.

### Optional

- PPG hardware integration.
- SpO2 integration.
- Additional multimodal features.
- More advanced temporal architectures after the dataset is sufficiently large.

## 20. Project Status

| Component | Status |
|---|---|
| Project setup | Complete |
| Apnea-ECG exploratory analysis | Complete |
| ECG processing | Complete |
| BIDMC ECG validation | Complete |
| BIDMC respiration validation | Complete |
| BIDMC PPG validation | Partial / exploratory |
| PICS event detection | Complete |
| Multi-infant PICS validation | Complete |
| Final precursor dataset | Complete for current development set |
| LOSO validation | Complete |
| Temporal Logistic Regression | Complete |
| GRU experiment | Complete |
| CNN experiment | Complete |
| Float32 TFLite | Complete |
| INT8 TFLite | Complete |
| Standalone feature-vector inference | Complete |
| Raw Raspberry Pi signal pipeline | Not yet complete |
| Thermistor circuit design | Complete |
| Thermistor hardware assembly | Not yet started |
| Thermistor experimental validation | Pending |
| SpO2 integration | Pending |
| Clinical validation | Not performed |

## 21. Final Perspective

This project is currently an **engineering feasibility prototype**, not a clinically validated neonatal apnea prediction system.

The strongest demonstrated components are:

1. Signal-processing validation against reference annotations.
2. Subject-independent LOSO evaluation methodology.
3. Explicit separation between bradycardia/event candidates and confirmed apnea.
4. Reproducible model/deployment artifacts.
5. Numerically verified Float32 and INT8 deployment conversion.

The most important limitation is the very small number of positive precursor windows currently available for machine-learning development.

Future work should prioritize **better event/reference labeling, more positive neonatal examples, experimental hardware validation, and complete raw-signal edge processing** rather than simply increasing model complexity.

## License

This repository is intended for academic and research use.

Dataset licensing and usage restrictions of external datasets remain applicable. External datasets should be obtained directly from their respective official sources and should not be redistributed through this repository.

## Disclaimer

This software is a research and engineering prototype.

It is not a medical device, does not provide medical diagnosis, and has not been clinically validated for neonatal apnea or desaturation prediction.

Do not use the system to make clinical decisions or to monitor patients without appropriate clinical validation, regulatory approval, and qualified medical oversight.
