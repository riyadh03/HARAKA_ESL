"""
Camera Health Check CLI
=======================

Runs a short (default 5s) camera health check using OpenCV.
Measures:
- Laplacian variance (blur detection)
- Average brightness (ambient lighting)

Usage:
    python camera_health_check.py --duration 5 --camera 0

Outputs JSON to stdout with diagnostics and recommendations.
"""

import cv2
import numpy as np
import time
import argparse
import json
import sys


def calculate_laplacian_variance(frames):
    variances = []
    for f in frames:
        gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        lap = cv2.Laplacian(gray, cv2.CV_64F)
        variances.append(float(np.var(lap)))
    return float(np.mean(variances)) if variances else 0.0


def calculate_average_brightness(frames):
    vals = []
    for f in frames:
        gray = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        vals.append(float(np.mean(gray)))
    return float(np.mean(vals)) if vals else 0.0


def analyze_frames(frames, lap_threshold=100.0, lighting_threshold=50.0):
    lap_var = calculate_laplacian_variance(frames)
    brightness = calculate_average_brightness(frames)

    if brightness < lighting_threshold:
        lighting_condition = "too_dark"
    elif brightness > 200:
        lighting_condition = "too_bright"
    else:
        lighting_condition = "adequate"

    if lap_var < lap_threshold:
        blur_condition = "blurry"
    else:
        blur_condition = "sharp"

    issues = []
    recommendations = []

    if blur_condition == "blurry":
        issues.append("blur")
        recommendations.extend(["Clean camera lens", "Ensure camera is steady / on tripod"])

    if lighting_condition == "too_dark":
        issues.append("lighting")
        recommendations.extend(["Increase room lighting", "Avoid backlight"])
    elif lighting_condition == "too_bright":
        issues.append("lighting")
        recommendations.extend(["Reduce direct light on camera", "Adjust curtains / blinds"])

    status = "ok"
    if len(issues) == 1:
        status = "warning"
    elif len(issues) > 1:
        status = "failed"

    return {
        "status": status,
        "laplacian_variance": lap_var,
        "brightness": brightness,
        "lighting_condition": lighting_condition,
        "blur_condition": blur_condition,
        "frames_captured": len(frames),
        "recommendations": recommendations,
    }


def run_camera_check(duration=5, camera_index=0, sample_interval=0.1):
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        return {"status": "failed", "error": "Could not open camera"}

    frames = []
    start = time.time()
    try:
        while time.time() - start < duration:
            ret, frame = cap.read()
            if not ret:
                # small sleep to avoid tight loop
                time.sleep(sample_interval)
                continue
            frames.append(frame)
            time.sleep(sample_interval)
    finally:
        cap.release()

    result = analyze_frames(frames)
    return result


def main():
    parser = argparse.ArgumentParser(description="5-second camera health check")
    parser.add_argument("--duration", type=int, default=5, help="Duration in seconds")
    parser.add_argument("--camera", type=int, default=0, help="Camera index")
    args = parser.parse_args()

    res = run_camera_check(duration=args.duration, camera_index=args.camera)
    json.dump(res, sys.stdout, indent=2)
    sys.stdout.write("\n")

    # Exit with non-zero code on failure
    if res.get("status") in ("failed", "error"):
        sys.exit(2)


if __name__ == "__main__":
    main()
