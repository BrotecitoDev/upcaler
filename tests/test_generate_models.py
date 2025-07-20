import json
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from generate_models import generate_models


def test_generate_models(tmp_path):
    model_dir = tmp_path / "model"
    model_dir.mkdir()
    (model_dir / "one.onnx").write_text("x")
    (model_dir / "two.safetensors").write_text("x")
    output = tmp_path / "models.json"
    mapping = generate_models(model_dir, output)
    assert output.exists()
    data = json.loads(output.read_text())
    expected = {
        "one": "model/one.onnx",
        "two": "model/two.safetensors",
    }
    assert mapping == expected
    assert data == expected

