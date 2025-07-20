import argparse
import logging
from pathlib import Path

import onnx
from onnxconverter_common import float16

try:
    from onnxsim import simplify
except Exception:
    simplify = None


def convert_model(input_path: Path, output_path: Path) -> None:
    logger = logging.getLogger("convert_fp16_to_fp32")
    logger.info("Loading model: %s", input_path)
    model = onnx.load(input_path)

    logger.info("Converting FLOAT16 tensors to FLOAT...")
    model_fp32 = float16.convert_float16_to_float32(model)

    if simplify is not None:
        try:
            logger.info("Simplifying model with onnxsim...")
            model_fp32, check = simplify(model_fp32)
            if check:
                logger.info("Simplification successful")
            else:
                logger.warning("Simplification failed validation, using unsimplified model")
        except Exception as e:
            logger.error("Failed to simplify model: %s", e)
    else:
        logger.info("onnxsim not available, skipping simplification")

    logger.info("Saving fp32 model to: %s", output_path)
    onnx.save_model(model_fp32, output_path)
    logger.info("Conversion complete")


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(description="Convert an fp16 ONNX model to fp32")
    parser.add_argument("input", help="Input ONNX model (fp16)")
    parser.add_argument("output", help="Output ONNX model (fp32)")
    args = parser.parse_args(argv)

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    convert_model(Path(args.input), Path(args.output))


if __name__ == "__main__":
    main()
