
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


class NeonatalRiskInference:

    def __init__(
        self,
        model_path,
        specification_path
    ):

        self.model_path = Path(model_path)
        self.specification_path = Path(specification_path)

        # ----------------------------------------------------
        # Load specification
        # ----------------------------------------------------

        with open(
            self.specification_path,
            "r",
            encoding="utf-8"
        ) as f:

            self.specification = json.load(f)

        self.timesteps = (
            self.specification["timesteps"]
        )

        self.features_per_timestep = (
            self.specification["features_per_timestep"]
        )

        self.threshold = (
            self.specification[
                "deployment"
            ]["threshold"]
        )

        # ----------------------------------------------------
        # Load TFLite model
        # ----------------------------------------------------

        self.interpreter = tf.lite.Interpreter(
            model_path=str(self.model_path)
        )

        self.interpreter.allocate_tensors()

        self.input_details = (
            self.interpreter.get_input_details()[0]
        )

        self.output_details = (
            self.interpreter.get_output_details()[0]
        )

        # ----------------------------------------------------
        # Quantization parameters
        # ----------------------------------------------------

        self.input_scale = (
            self.input_details[
                "quantization"
            ][0]
        )

        self.input_zero_point = (
            self.input_details[
                "quantization"
            ][1]
        )

        self.output_scale = (
            self.output_details[
                "quantization"
            ][0]
        )

        self.output_zero_point = (
            self.output_details[
                "quantization"
            ][1]
        )

    # --------------------------------------------------------
    # Run inference
    # --------------------------------------------------------

    def predict(self, feature_sequence):

        sequence = np.asarray(
            feature_sequence,
            dtype=np.float32
        )

        expected_shape = (
            self.timesteps,
            self.features_per_timestep
        )

        if sequence.shape != expected_shape:

            raise ValueError(
                f"Expected shape {expected_shape}, "
                f"received {sequence.shape}"
            )

        # ----------------------------------------------------
        # Handle NaN values
        #
        # For deployment, missing values are replaced by
        # column-wise medians supplied by the deployment
        # preprocessing stage.
        # ----------------------------------------------------

        if not np.all(
            np.isfinite(
                sequence[
                    ~np.isnan(sequence)
                ]
            )
        ):

            raise ValueError(
                "Input contains infinite values."
            )

        # ----------------------------------------------------
        # Flatten sequence
        # ----------------------------------------------------

        flattened = sequence.reshape(
            1,
            self.timesteps *
            self.features_per_timestep
        )

        # ----------------------------------------------------
        # Quantize
        # ----------------------------------------------------

        quantized = np.round(
            flattened / self.input_scale
            + self.input_zero_point
        )

        quantized = np.clip(
            quantized,
            -128,
            127
        ).astype(np.int8)

        # ----------------------------------------------------
        # TFLite inference
        # ----------------------------------------------------

        self.interpreter.set_tensor(
            self.input_details["index"],
            quantized
        )

        self.interpreter.invoke()

        quantized_output = (
            self.interpreter.get_tensor(
                self.output_details["index"]
            )
        )

        # ----------------------------------------------------
        # Dequantize probability
        # ----------------------------------------------------

        probability = (
            quantized_output.astype(
                np.float32
            )
            - self.output_zero_point
        ) * self.output_scale

        probability = float(
            probability.reshape(-1)[0]
        )

        prediction = int(
            probability >= self.threshold
        )

        return {
            "risk_probability": probability,
            "risk_prediction": prediction,
            "risk_label": (
                "RISING_RISK"
                if prediction == 1
                else "NORMAL"
            ),
            "threshold": self.threshold
        }
