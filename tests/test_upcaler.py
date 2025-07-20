import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from upcaler import upscale_image
from PIL import Image

def test_upscale_image(tmp_path):
    # create a simple 1x1 image
    img_path = tmp_path / "input.png"
    Image.new("RGB", (1, 1), color="red").save(img_path)

    out_path = tmp_path / "output.png"
    upscale_image(str(img_path), str(out_path), 2.0)
    assert os.path.exists(out_path)
    with Image.open(out_path) as img:
        assert img.size == (2, 2)
