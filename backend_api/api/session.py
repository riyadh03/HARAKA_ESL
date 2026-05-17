"""
Session API Routes
==================

Endpoints for handling rehabilitation session data:
- POST /api/v1/session/submit - Submit session JSON from frontend
- GET /api/v1/session/{session_id} - Retrieve session data
- POST /api/v1/session/{session_id}/report - Generate clinical report

All endpoints receive lightweight JSON payloads (~5KB) to comply with
low-bandwidth constraints in rural Morocco.

Author: Haraka.ai Team
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
from pydantic import BaseModel

# Import models and services
from models.session import SessionData, SessionReport
from services.llm_service import LLMService
from utils.amber_flag_verifier import AmberFlagVerifier


router = APIRouter()


class SessionSubmitRequest(BaseModel):
    """
    Request model for session submission from frontend.
    
    Contains:
    - Exercise analytics (angles, repetitions, warnings)
    - Pain scale selection (emoji-based)
    - Session metadata (timestamp, patient ID, exercise type)
    - Calibration baseline data
    
    Size: ~5KB (lightweight for low-bandwidth)
    """
    session_id: str
    patient_id: str
    exercise_type: str
    timestamp: str
    exercise_analytics: Dict[str, Any]
    pain_scale: int  # 1-5 emoji scale
    calibration_baseline: Dict[str, Any]
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": "sess_001",
                "patient_id": "pat_123",
                "exercise_type": "shoulder_flexion",
                "timestamp": "2026-05-16T20:00:00Z",
                "exercise_analytics": {
                    "max_angle": 145,
                    "reps": 10,
                    "warnings": ["trunk_shift"],
                    "avg_speed": 0.8
                },
                "pain_scale": 2,
                "calibration_baseline": {
                    "neutral_angle": 90,
                    "range_of_motion": 60
                }
            }
        }


@router.post("/submit")
async def submit_session(
    request_data: SessionSubmitRequest,
    request: Request,
    verifier: AmberFlagVerifier = Depends()
) -> Dict[str, Any]:
    """
    Submit session data from frontend Edge AI.
    
    Process:
    1. Validate session data with Pydantic
    2. Store session in database (or file for MVP)
    3. Trigger LLM report generation via OpenRouter
    4. Run Amber Flag verification
    5. Return the full report to the UI
    """
    try:
        # TODO: Store session data in database for MVP
        
        # Trigger async LLM report generation
        llm_service = request.app.state.llm_service
        session_data_dict = request_data.dict()
        
        report_data = await llm_service.generate_clinical_report(session_data_dict)
        raw_report = report_data.get("raw_report", "")
        
        # Verify report with amber flag checker
        amber_flags, is_verified, flagged_report_text = verifier.verify_report(raw_report, session_data_dict)
        
        return {
            "status": "success",
            "session_id": request_data.session_id,
            "message": "Session data received successfully",
            "report": flagged_report_text,
            "raw_report": raw_report,
            "model_used": report_data.get("model_used", "unknown"),
            "amber_flags": [flag.dict() for flag in amber_flags],
            "verification_status": "verified" if is_verified else "needs_review"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process session: {str(e)}"
        )


@router.get("/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """
    Retrieve session data by ID.
    
    Args:
        session_id: Unique session identifier
    
    Returns:
        dict: Complete session data including analytics and report
    """
    try:
        # TODO: Retrieve session from database
        # For MVP: Load from JSON file
        
        return {
            "session_id": session_id,
            "status": "found",
            "data": {}  # Placeholder for session data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Session not found: {str(e)}"
        )


@router.post("/{session_id}/report")
async def generate_report(
    session_id: str,
    request: Request,
    verifier: AmberFlagVerifier = Depends()
) -> Dict[str, Any]:
    """
    Generate clinical report using LLM with amber flag verification.
    
    Process:
    1. Retrieve session data
    2. Load medical context from prompts/llm_context.md
    3. Send to LLM with grounding prompt
    4. Verify each sentence has JSON citation
    5. Flag unsupported sentences as amber flags
    
    Args:
        session_id: Session to generate report for
        llm_service: Injected LLM service
        verifier: Amber flag verifier for hallucination detection
    
    Returns:
        dict: Clinical report with amber flags highlighted
    """
    try:
        # Retrieve mock session data for MVP
        session_data = {
            "metadata": {"session_id": session_id},
            "exercise_analytics": {"max_angle": 145, "reps": 10},
            "pain_scale": 2
        }
        
        # Generate report with LLM
        llm_service = request.app.state.llm_service
        report_data = await llm_service.generate_clinical_report(session_data)
        raw_report = report_data.get("raw_report", "")
        
        # Verify report with amber flag checker
        amber_flags, is_verified, flagged_report_text = verifier.verify_report(raw_report, session_data)
        
        return {
            "session_id": session_id,
            "report": {
                "raw_report": raw_report,
                "flagged_report_text": flagged_report_text,
                "model_used": report_data.get("model_used", "unknown")
            },
            "amber_flags": [flag.dict() for flag in amber_flags],
            "verification_status": "verified" if is_verified else "needs_review"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


@router.post("/{session_id}/transcribe")
async def transcribe_pain_description(
    session_id: str,
    audio_data: bytes,
    request: Request
) -> Dict[str, Any]:
    """
    Transcribe patient's Darija pain description using Whisper API.
    
    Args:
        session_id: Session to attach transcription to
        audio_data: Audio file bytes (Darija speech)
        whisper_service: Injected Whisper service
    
    Returns:
        dict: Transcribed text in Darija
    """
    try:
        # TODO: Send audio to Whisper API
        # whisper_service = request.app.state.whisper_service
        # transcription = await whisper_service.transcribe(audio_data)
        
        return {
            "session_id": session_id,
            "transcription": "",  # Placeholder for Darija text
            "language": "ar-MA"  # Moroccan Arabic
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )
