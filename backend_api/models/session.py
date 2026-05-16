"""
Session Data Models
===================

Pydantic models for validating and structuring session data.

All models enforce type safety and validation for the lightweight
JSON payloads (~5KB) sent from the frontend Edge AI.

Author: Haraka.ai Team
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional
from datetime import datetime


class ExerciseAnalytics(BaseModel):
    """
    Model for exercise performance analytics from MediaPipe.
    
    Contains biomechanical data calculated in the browser:
    - Joint angles (max, min, average)
    - Repetition count
    - Movement speed
    - Warning flags (posture issues, compensations)
    """
    max_angle: float = Field(..., description="Maximum joint angle achieved")
    min_angle: float = Field(..., description="Minimum joint angle achieved")
    avg_angle: float = Field(..., description="Average joint angle")
    reps: int = Field(..., ge=0, description="Number of repetitions completed")
    avg_speed: float = Field(..., description="Average movement speed (degrees/second)")
    warnings: List[str] = Field(default_factory=list, description="Posture or movement warnings")
    
    class Config:
        schema_extra = {
            "example": {
                "max_angle": 145.0,
                "min_angle": 45.0,
                "avg_angle": 95.0,
                "reps": 10,
                "avg_speed": 45.5,
                "warnings": ["trunk_shift", "asymmetric_movement"]
            }
        }


class CalibrationBaseline(BaseModel):
    """
    Model for patient-relative calibration baseline.
    
    Captured during the first 30 seconds of the session:
    - Neutral posture angles
    - Range of motion baseline
    - Patient-specific adjustments
    """
    neutral_angle: float = Field(..., description="Neutral joint angle for this patient")
    range_of_motion: float = Field(..., description="Expected range of motion")
    posture_adjustments: Dict[str, float] = Field(
        default_factory=dict,
        description="Patient-specific posture adjustments"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "neutral_angle": 90.0,
                "range_of_motion": 60.0,
                "posture_adjustments": {
                    "shoulder_offset": 5.0,
                    "hip_offset": -2.0
                }
            }
        }


class SessionMetadata(BaseModel):
    """
    Model for session metadata.
    
    Contains administrative information about the session:
    - Timestamp
    - Patient ID
    - Exercise type
    - Session duration
    """
    session_id: str = Field(..., description="Unique session identifier")
    patient_id: str = Field(..., description="Patient identifier")
    exercise_type: str = Field(..., description="Type of exercise performed")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    duration_seconds: int = Field(..., ge=0, description="Session duration in seconds")
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        """Validate timestamp format."""
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError("Invalid timestamp format. Use ISO 8601 format.")
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": "sess_001",
                "patient_id": "pat_123",
                "exercise_type": "shoulder_flexion",
                "timestamp": "2026-05-16T20:00:00Z",
                "duration_seconds": 120
            }
        }


class SessionData(BaseModel):
    """
    Complete session data model.
    
    Aggregates all session information:
    - Metadata
    - Exercise analytics
    - Pain scale selection
    - Calibration baseline
    - Optional pain transcription
    
    Size: ~5KB (lightweight for low-bandwidth transmission)
    """
    metadata: SessionMetadata
    exercise_analytics: ExerciseAnalytics
    pain_scale: int = Field(..., ge=1, le=5, description="Pain scale 1-5 (emoji-based)")
    calibration_baseline: CalibrationBaseline
    pain_transcription: Optional[str] = Field(
        None,
        description="Transcribed Darija pain description"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "metadata": {
                    "session_id": "sess_001",
                    "patient_id": "pat_123",
                    "exercise_type": "shoulder_flexion",
                    "timestamp": "2026-05-16T20:00:00Z",
                    "duration_seconds": 120
                },
                "exercise_analytics": {
                    "max_angle": 145.0,
                    "min_angle": 45.0,
                    "avg_angle": 95.0,
                    "reps": 10,
                    "avg_speed": 45.5,
                    "warnings": ["trunk_shift"]
                },
                "pain_scale": 2,
                "calibration_baseline": {
                    "neutral_angle": 90.0,
                    "range_of_motion": 60.0,
                    "posture_adjustments": {}
                },
                "pain_transcription": "Kayn chi haja f dahr"
            }
        }


class AmberFlag(BaseModel):
    """
    Model for amber flag (hallucination warning).
    
    Identifies statements in the clinical report that are not
    grounded in the session JSON data.
    """
    sentence: str = Field(..., description="The unsupported sentence")
    location: str = Field(..., description="Section where sentence appears")
    reason: str = Field(..., description="Why this is flagged")
    suggested_citation: Optional[str] = Field(
        None,
        description="Suggested JSON field citation"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "sentence": "The patient showed excellent form throughout.",
                "location": "Exercise Performance Analysis",
                "reason": "No JSON field supports 'excellent form' claim",
                "suggested_citation": None
            }
        }


class SessionReport(BaseModel):
    """
    Model for generated clinical report.
    
    Contains the structured clinical report with:
    - Report sections
    - Citations
    - Amber flags (if any)
    - Verification status
    """
    session_id: str = Field(..., description="Associated session ID")
    generated_at: str = Field(..., description="Report generation timestamp")
    report_sections: Dict[str, str] = Field(
        ...,
        description="Report sections (summary, analysis, recommendations, etc.)"
    )
    citations: List[str] = Field(
        default_factory=list,
        description="JSON field citations used in report"
    )
    amber_flags: List[AmberFlag] = Field(
        default_factory=list,
        description="Unsupported statements flagged for review"
    )
    verification_status: str = Field(
        ...,
        description="Verification status (verified, needs_review, failed)"
    )
    model_used: str = Field(..., description="LLM model used for generation")
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": "sess_001",
                "generated_at": "2026-05-16T20:05:00Z",
                "report_sections": {
                    "summary": "Patient completed 10 repetitions...",
                    "analysis": "Max angle of 145° achieved...",
                    "recommendations": "Continue current regimen..."
                },
                "citations": [
                    "exercise_analytics.max_angle",
                    "exercise_analytics.reps",
                    "pain_scale"
                ],
                "amber_flags": [],
                "verification_status": "verified",
                "model_used": "gpt-4-turbo"
            }
        }
