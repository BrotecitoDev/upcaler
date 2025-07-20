#!/usr/bin/env python3
"""Utility to generate models.json from local model files."""

import argparse
import json
from pathlib import Path
from typing import Mapping


def generate_models(model_dir: Path = Path("model"), output: Path = Path("models.json")) -> Mapping[str, str]:
    """Scan *model_dir* and write a JSON mapping to *output*.

    Only files with extensions ``.onnx`` or ``.safetensors`` are included.
    Returned mapping uses forward slashes for paths so it works on GitHub Pages.
    """
    mapping = {}
    prefix = Path(model_dir).name
    for path in sorted(model_dir.iterdir()):
        if path.suffix.lower() not in {".onnx", ".safetensors"}:
            continue
        mapping[path.stem] = f"{prefix}/{path.name}"
    output.write_text(json.dumps(mapping, indent=2, ensure_ascii=False))
    return mapping


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(description="Generate models.json")
    parser.add_argument("--model-dir", default="model", help="Directory with model files")
    parser.add_argument("--output", default="models.json", help="Path for generated JSON")
    args = parser.parse_args(argv)

    generate_models(Path(args.model_dir), Path(args.output))


if __name__ == "__main__":
    main()

