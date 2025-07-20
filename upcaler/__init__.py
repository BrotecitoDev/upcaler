from PIL import Image


def upscale_image(input_path: str, output_path: str, scale_factor: float) -> Image.Image:
    """Upscale an image by a scale factor and save it."""
    img = Image.open(input_path)
    new_size = (int(img.width * scale_factor), int(img.height * scale_factor))
    upscaled = img.resize(new_size, Image.LANCZOS)
    upscaled.save(output_path)
    return upscaled


__all__ = ["upscale_image"]
