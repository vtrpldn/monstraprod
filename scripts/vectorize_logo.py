#!/usr/bin/env python3
"""Upscale and deterministically trace the supplied Monstra raster logo."""

from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


Point = tuple[int, int]


def add_edge(edges: dict[Point, list[Point]], start: Point, end: Point) -> None:
    edges[start].append(end)


def trace_boundaries(mask: np.ndarray) -> list[list[Point]]:
    """Turn a binary pixel mask into closed, consistently oriented contours."""

    edges: dict[Point, list[Point]] = defaultdict(list)
    up = np.zeros_like(mask)
    up[1:] = mask[:-1]
    down = np.zeros_like(mask)
    down[:-1] = mask[1:]
    left = np.zeros_like(mask)
    left[:, 1:] = mask[:, :-1]
    right = np.zeros_like(mask)
    right[:, :-1] = mask[:, 1:]

    for y, x in zip(*np.nonzero(mask & ~up), strict=True):
        add_edge(edges, (int(x), int(y)), (int(x + 1), int(y)))
    for y, x in zip(*np.nonzero(mask & ~right), strict=True):
        add_edge(edges, (int(x + 1), int(y)), (int(x + 1), int(y + 1)))
    for y, x in zip(*np.nonzero(mask & ~down), strict=True):
        add_edge(edges, (int(x + 1), int(y + 1)), (int(x), int(y + 1)))
    for y, x in zip(*np.nonzero(mask & ~left), strict=True):
        add_edge(edges, (int(x), int(y + 1)), (int(x), int(y)))

    contours: list[list[Point]] = []
    while edges:
        start = next(iter(edges))
        current = start
        contour = [start]

        while True:
            destinations = edges[current]
            current = destinations.pop()
            if not destinations:
                del edges[contour[-1]]
            contour.append(current)
            if current == start:
                break

        if len(contour) >= 4:
            contours.append(contour)

    return contours


def distance_to_line(point: Point, start: Point, end: Point) -> float:
    px, py = point
    sx, sy = start
    ex, ey = end
    dx = ex - sx
    dy = ey - sy
    if dx == 0 and dy == 0:
        return float(np.hypot(px - sx, py - sy))
    return abs(dy * px - dx * py + ex * sy - ey * sx) / float(np.hypot(dx, dy))


def rdp(points: list[Point], epsilon: float) -> list[Point]:
    """Ramer-Douglas-Peucker simplification for an open point sequence."""

    if len(points) <= 2:
        return points

    start = points[0]
    end = points[-1]
    max_distance = 0.0
    split_at = 0

    for index, point in enumerate(points[1:-1], start=1):
        distance = distance_to_line(point, start, end)
        if distance > max_distance:
            max_distance = distance
            split_at = index

    if max_distance <= epsilon:
        return [start, end]

    left = rdp(points[: split_at + 1], epsilon)
    right = rdp(points[split_at:], epsilon)
    return left[:-1] + right


def simplify_closed(contour: list[Point], epsilon: float) -> list[Point]:
    points = contour[:-1]
    start_index = min(range(len(points)), key=lambda index: points[index])
    rotated = points[start_index:] + points[:start_index]
    simplified = rdp(rotated + [rotated[0]], epsilon)
    return simplified if simplified[-1] == simplified[0] else simplified + [simplified[0]]


def svg_path(contours: list[list[Point]], scale: int) -> str:
    commands: list[str] = []
    for contour in contours:
        simplified = simplify_closed(contour, epsilon=3.0)
        points = [(x / scale, y / scale) for x, y in simplified]
        commands.append(f"M{points[0][0]:.2f} {points[0][1]:.2f}")
        commands.extend(f"L{x:.2f} {y:.2f}" for x, y in points[1:-1])
        commands.append("Z")
    return " ".join(commands)


def write_svg(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    scale = 4
    image = Image.open(args.source).convert("RGBA")
    upscaled = image.resize(
        (image.width * scale, image.height * scale),
        Image.Resampling.LANCZOS,
    )

    pixels = np.asarray(upscaled)
    red = pixels[..., 0].astype(np.int16)
    green = pixels[..., 1].astype(np.int16)
    blue = pixels[..., 2].astype(np.int16)
    alpha = pixels[..., 3]
    mask = (alpha > 100) & (red > 90) & (red - green > 48) & (red - blue > 42)
    mask_image = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
    mask_image = mask_image.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = np.asarray(mask_image) > 127

    contours = trace_boundaries(mask)
    path_data = svg_path(contours, scale)
    ys, xs = np.nonzero(mask)
    padding = 4
    min_x = max(0, int(xs.min() / scale) - padding)
    min_y = max(0, int(ys.min() / scale) - padding)
    max_x = min(image.width, int(np.ceil(xs.max() / scale)) + padding)
    max_y = min(image.height, int(np.ceil(ys.max() / scale)) + padding)
    view_width = max_x - min_x
    view_height = max_y - min_y

    args.output_dir.mkdir(parents=True, exist_ok=True)
    logo_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x} {min_y} {view_width} {view_height}" role="img" aria-labelledby="logo-title">
  <title id="logo-title">Monstra Prod</title>
  <path fill="#ef332d" fill-rule="evenodd" d="{path_data}"/>
</svg>
'''
    write_svg(args.output_dir / "monstra-logo.svg", logo_svg)

    favicon_size = 512
    favicon_padding = 48
    usable = favicon_size - 2 * favicon_padding
    favicon_scale = min(usable / view_width, usable / view_height)
    translate_x = (favicon_size - view_width * favicon_scale) / 2 - min_x * favicon_scale
    translate_y = (favicon_size - view_height * favicon_scale) / 2 - min_y * favicon_scale
    favicon_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {favicon_size} {favicon_size}">
  <rect width="{favicon_size}" height="{favicon_size}" rx="96" fill="#090909"/>
  <path transform="translate({translate_x:.3f} {translate_y:.3f}) scale({favicon_scale:.6f})" fill="#ef332d" fill-rule="evenodd" d="{path_data}"/>
</svg>
'''
    write_svg(args.output_dir / "favicon.svg", favicon_svg)

    upscaled.save("/tmp/monstra-logo-upscaled-4x.png", optimize=True)
    print(
        f"upscaled={upscaled.width}x{upscaled.height} "
        f"contours={len(contours)} viewBox={min_x} {min_y} {view_width} {view_height}"
    )


if __name__ == "__main__":
    main()
