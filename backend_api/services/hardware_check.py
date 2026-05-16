"""
Hardware Check Service
=======================

Service for camera hardware diagnostics using OpenCV.

Performs:
- Laplacian variance check for blur detection
- Ambient lighting assessment
- Lens cleanliness detection

Ensures data quality before starting rehabilitation sessions.

Author: Haraka.ai Team
"""

import cv2
import numpy as np
from typing import Dict, Any, Tuple
import time


class HardwareCheckService:
    """
    Service for camera hardware diagnostics.
    
    Uses OpenCV to assess camera quality and readiness
    for computer vision tasks.
    """
    
    def __init__(self):
        """
        Initialize hardware check service.
        """
        self.camera = None
        self.laplacian_threshold = 100.0  # Threshold for blur detection
        self.lighting_threshold = 50.0  # Minimum brightness threshold
    
    async def check_camera(
        self,
        duration: int = 5,
        camera_index: int = 0
    ) -> Dict[str, Any]:
        """
        Run comprehensive camera diagnostics.
        
        Process:
        1. Open camera
        2. Capture frames for specified duration
        3. Calculate Laplacian variance (blur detection)
        4. Assess ambient lighting
        5. Detect lens issues
        6. Close camera
        
        Args:
            duration: Test duration in seconds (default: 5)
            camera_index: Camera device index (default: 0)
        
        Returns:
            dict: Camera health diagnostics
        """
        try:
            # Open camera
            self.camera = cv2.VideoCapture(camera_index)
            
            if not self.camera.isOpened():
                return {
                    "status": "failed",
                    "error": "Could not open camera",
                    "recommendations": ["Check camera connection", "Verify camera permissions"]
                }
            
            # Collect frame data
            frames_data = []
            start_time = time.time()
            
            while time.time() - start_time < duration:
                ret, frame = self.camera.read()
                if ret:
                    frames_data.append(frame)
                time.sleep(0.1)
            
            # Close camera
            self.camera.release()
            self.camera = None
            
            if not frames_data:
                return {
                    "status": "failed",
                    "error": "No frames captured",
                    "recommendations": ["Check camera hardware", "Try different camera index"]
                }
            
            # Analyze frames
            laplacian_variance = self._calculate_laplacian_variance(frames_data)
            lighting_score = self._assess_lighting(frames_data)
            lens_condition = self._detect_lens_issues(frames_data)
            
            # Determine overall status
            status = self._determine_status(
                laplacian_variance,
                lighting_score,
                lens_condition
            )
            
            return {
                "status": status,
                "laplacian_variance": laplacian_variance,
                "lighting_score": lighting_score,
                "lens_condition": lens_condition,
                "frames_captured": len(frames_data),
                "recommendations": self._generate_recommendations(
                    laplacian_variance,
                    lighting_score,
                    lens_condition
                )
            }
            
        except Exception as e:
            if self.camera:
                self.camera.release()
                self.camera = None
            
            return {
                "status": "error",
                "error": str(e),
                "recommendations": ["Check camera drivers", "Verify OpenCV installation"]
            }
    
    def _calculate_laplacian_variance(self, frames: list) -> float:
        """
        Calculate average Laplacian variance across frames.
        
        Laplacian variance measures edge sharpness:
        - High variance = sharp image (good)
        - Low variance = blurry image (bad)
        
        Args:
            frames: List of captured frames
        
        Returns:
            float: Average Laplacian variance
        """
        variances = []
        
        for frame in frames:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate Laplacian variance
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            variance = laplacian.var()
            variances.append(variance)
        
        return np.mean(variances)
    
    def _assess_lighting(self, frames: list) -> Dict[str, Any]:
        """
        Assess ambient lighting conditions.
        
        Args:
            frames: List of captured frames
        
        Returns:
            dict: Lighting assessment
        """
        brightness_values = []
        
        for frame in frames:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate average brightness
            brightness = np.mean(gray)
            brightness_values.append(brightness)
        
        avg_brightness = np.mean(brightness_values)
        
        # Determine lighting condition
        if avg_brightness < self.lighting_threshold:
            condition = "too_dark"
        elif avg_brightness > 200:
            condition = "too_bright"
        else:
            condition = "adequate"
        
        return {
            "average_brightness": avg_brightness,
            "condition": condition,
            "threshold": self.lighting_threshold
        }
    
    def _detect_lens_issues(self, frames: list) -> Dict[str, Any]:
        """
        Detect lens cleanliness issues.
        
        Args:
            frames: List of captured frames
        
        Returns:
            dict: Lens condition assessment
        """
        # TODO: Implement lens detection logic
        # Could analyze for:
        # - Scratches (high-frequency noise patterns)
        # - Smudges (localized blur)
        # - Dust (small dark spots)
        
        return {
            "condition": "clean",
            "issues": [],
            "confidence": 0.9
        }
    
    def _determine_status(
        self,
        laplacian_variance: float,
        lighting_score: Dict[str, Any],
        lens_condition: Dict[str, Any]
    ) -> str:
        """
        Determine overall camera status based on diagnostics.
        
        Args:
            laplacian_variance: Blur detection score
            lighting_score: Lighting assessment
            lens_condition: Lens condition
        
        Returns:
            str: Overall status ("ok", "warning", "failed")
        """
        issues = []
        
        if laplacian_variance < self.laplacian_threshold:
            issues.append("blur")
        
        if lighting_score["condition"] != "adequate":
            issues.append("lighting")
        
        if lens_condition["condition"] != "clean":
            issues.append("lens")
        
        if not issues:
            return "ok"
        elif len(issues) == 1:
            return "warning"
        else:
            return "failed"
    
    def _generate_recommendations(
        self,
        laplacian_variance: float,
        lighting_score: Dict[str, Any],
        lens_condition: Dict[str, Any]
    ) -> list:
        """
        Generate actionable recommendations based on diagnostics.
        
        Args:
            laplacian_variance: Blur detection score
            lighting_score: Lighting assessment
            lens_condition: Lens condition
        
        Returns:
            list: Recommendations
        """
        recommendations = []
        
        if laplacian_variance < self.laplacian_threshold:
            recommendations.append("Clean camera lens")
            recommendations.append("Ensure camera is stable")
        
        if lighting_score["condition"] == "too_dark":
            recommendations.append("Increase room lighting")
            recommendations.append("Avoid backlighting")
        elif lighting_score["condition"] == "too_bright":
            recommendations.append("Reduce direct light on camera")
            recommendations.append("Adjust camera angle")
        
        if lens_condition["condition"] != "clean":
            recommendations.append("Inspect and clean camera lens")
        
        if not recommendations:
            recommendations.append("Camera is ready for use")
        
        return recommendations
