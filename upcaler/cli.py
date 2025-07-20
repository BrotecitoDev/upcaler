import argparse

from . import upscale_image


def main(argv=None):
    parser = argparse.ArgumentParser(description="Upscale an image")
    parser.add_argument("input", help="Path to input image")
    parser.add_argument("output", help="Path to output image")
    parser.add_argument("--scale", type=float, default=2.0, help="Scale factor")
    args = parser.parse_args(argv)
    upscale_image(args.input, args.output, args.scale)


if __name__ == "__main__":
    main()
