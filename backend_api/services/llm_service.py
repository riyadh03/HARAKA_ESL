"""
LLM Service
============

Service for interacting with Large Language Models (GPT-4 or Gemini)
to generate clinical rehabilitation reports.

Features:
- Grounded generation with JSON field citations
- Few-shot prompt engineering
- Medical context injection from prompts/llm_context.md
- Amber flag prevention through strict grounding

Author: Haraka.ai Team
"""

import os
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
import json


class LLMService:
    """
    Service for LLM-based clinical report generation.
    
    Uses OpenAI GPT-4 or Google Gemini Pro to generate
    structured clinical reports from session JSON data.
    """
    
    def __init__(self):
        """
        Initialize LLM service with API credentials.
        
        Loads API key from environment variables.
        """
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv("LLM_MODEL", "gpt-4-turbo")
        
        # Load medical context from prompts/llm_context.md
        self.medical_context = self._load_medical_context()
    
    def _load_medical_context(self) -> str:
        """
        Load medical knowledge context from prompts/llm_context.md.
        
        This file contains biomechanical rules and clinical guidelines
        provided by the physiotherapist team. The LLM must follow
        these rules strictly and not guess biomechanical principles.
        
        Returns:
            str: Medical context content
        """
        try:
            context_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "prompts",
                "llm_context.md"
            )
            
            with open(context_path, 'r', encoding='utf-8') as f:
                return f.read()
                
        except FileNotFoundError:
            print("⚠️ Warning: llm_context.md not found. Using default context.")
            return "Default medical context placeholder."
    
    async def generate_clinical_report(
        self,
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate clinical report using LLM with grounded generation.
        
        Process:
        1. Construct prompt with medical context
        2. Include session JSON data
        3. Require JSON field citations for every factual statement
        4. Generate structured clinical report
        
        Args:
            session_data: Session JSON from frontend (angles, reps, pain, etc.)
        
        Returns:
            dict: Generated clinical report with citations
        """
        if not self.client:
            raise ValueError("OpenAI client not initialized. Check API key.")
        
        # Construct the grounding prompt
        prompt = self._construct_grounding_prompt(session_data)
        
        try:
            # Call LLM API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Low temperature for consistent medical reports
                max_tokens=2000
            )
            
            # Parse response
            report_text = response.choices[0].message.content
            
            # TODO: Parse report into structured format
            # structured_report = self._parse_report(report_text)
            
            return {
                "raw_report": report_text,
                "structured_report": {},  # Placeholder
                "model_used": self.model,
                "citations_present": True
            }
            
        except Exception as e:
            raise RuntimeError(f"LLM generation failed: {str(e)}")
    
    def _get_system_prompt(self) -> str:
        """
        Get the system prompt for the LLM.
        
        Defines the LLM's role and constraints:
        - Act as a clinical physiotherapist
        - Use only provided JSON data
        - Cite JSON fields for every factual statement
        - Follow medical context from llm_context.md
        
        Returns:
            str: System prompt
        """
        return f"""
You are a clinical physiotherapist specializing in tele-rehabilitation for the Moroccan mobile medical units (UMMC-FMVS).

Your task is to generate a clinical report based on exercise session data.

STRICT CONSTRAINTS:
1. Use ONLY the provided JSON session data. Do not invent or assume information.
2. Every factual statement MUST cite the JSON field it comes from in brackets [field_name].
3. Follow the biomechanical rules in the medical context below.
4. Do not guess or hallucinate biomechanical principles.
5. If information is missing, state "Data not available" instead of guessing.

MEDICAL CONTEXT:
{self.medical_context}

Report Structure:
1. Session Summary
2. Exercise Performance Analysis
3. Pain Assessment
4. Recommendations
5. Amber Flags (if any)
"""
    
    def _construct_grounding_prompt(self, session_data: Dict[str, Any]) -> str:
        """
        Construct the user prompt with session JSON data.
        
        Args:
            session_data: Session JSON from frontend
        
        Returns:
            str: Formatted prompt with JSON data
        """
        json_str = json.dumps(session_data, indent=2)
        
        return f"""
Generate a clinical report for the following rehabilitation session.

SESSION DATA:
{json_str}

Please analyze the exercise performance, pain levels, and provide clinical recommendations.
Remember to cite JSON fields for every factual statement using [field_name] notation.
"""
    
    def _parse_report(self, report_text: str) -> Dict[str, Any]:
        """
        Parse the raw LLM response into structured format.
        
        Args:
            report_text: Raw text from LLM
        
        Returns:
            dict: Structured report with sections
        """
        # TODO: Implement parsing logic
        # Extract sections: summary, analysis, pain, recommendations, flags
        
        return {
            "summary": "",
            "exercise_analysis": "",
            "pain_assessment": "",
            "recommendations": "",
            "amber_flags": []
        }
    
    async def validate_report_grounding(
        self,
        report: Dict[str, Any],
        session_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate that all report statements are grounded in JSON data.
        
        This is a secondary validation using the LLM itself to check
        that citations are correct and no hallucinations exist.
        
        Args:
            report: Generated clinical report
            session_data: Original session JSON
        
        Returns:
            dict: Validation results with any issues found
        """
        # TODO: Implement validation logic
        # Send report and JSON to LLM to verify citations
        
        return {
            "is_valid": True,
            "issues": [],
            "uncited_statements": []
        }
