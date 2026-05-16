"""
Whisper Service
===============

Service for transcribing Darija speech using OpenAI Whisper API.

Used to transcribe patient's qualitative pain descriptions in Darija
to provide additional context for the clinical report.

Author: Haraka.ai Team
"""

import os
from typing import Optional, Dict, Any
from openai import AsyncOpenAI


class WhisperService:
    """
    Service for speech-to-text transcription using Whisper API.
    
    Transcribes Darija (Moroccan Arabic) speech from patients
    describing their pain or exercise experience.
    """
    
    def __init__(self):
        """
        Initialize Whisper service with API credentials.
        
        Loads API key from environment variables.
        """
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "whisper-1"
    
    async def transcribe(
        self,
        audio_data: bytes,
        language: str = "ar"
    ) -> Dict[str, Any]:
        """
        Transcribe audio data to text using Whisper API.
        
        Args:
            audio_data: Audio file bytes (MP3, WAV, M4A, etc.)
            language: Language code (default: "ar" for Arabic/Darija)
        
        Returns:
            dict: Transcription result with text and metadata
        """
        if not self.client:
            raise ValueError("OpenAI client not initialized. Check API key.")
        
        try:
            # TODO: Save audio data to temporary file
            # Whisper API requires a file path, not raw bytes
            # temp_file = self._save_temp_audio(audio_data)
            
            # Transcribe using Whisper API
            # response = await self.client.audio.transcriptions.create(
            #     model=self.model,
            #     file=temp_file,
            #     language=language
            # )
            
            # TODO: Clean up temporary file
            # os.remove(temp_file)
            
            return {
                "text": "",  # Placeholder for transcribed text
                "language": language,
                "duration": 0.0,  # Placeholder
                "model_used": self.model
            }
            
        except Exception as e:
            raise RuntimeError(f"Whisper transcription failed: {str(e)}")
    
    def _save_temp_audio(self, audio_data: bytes) -> str:
        """
        Save audio data to a temporary file.
        
        Args:
            audio_data: Audio bytes
        
        Returns:
            str: Path to temporary file
        """
        import tempfile
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".mp3"
        ) as temp_file:
            temp_file.write(audio_data)
            return temp_file.name
    
    async def transcribe_with_translation(
        self,
        audio_data: bytes,
        source_language: str = "ar",
        target_language: str = "en"
    ) -> Dict[str, Any]:
        """
        Transcribe and translate audio to target language.
        
        Useful for providing English translations of Darija descriptions
        for clinicians who may not speak Darija.
        
        Args:
            audio_data: Audio file bytes
            source_language: Source language code (default: "ar")
            target_language: Target language code (default: "en")
        
        Returns:
            dict: Transcription and translation result
        """
        # First transcribe
        transcription = await self.transcribe(audio_data, source_language)
        
        # TODO: Translate using LLM or translation API
        # translated_text = await self._translate_text(
        #     transcription["text"],
        #     target_language
        # )
        
        return {
            "original_text": transcription["text"],
            "translated_text": "",  # Placeholder
            "source_language": source_language,
            "target_language": target_language
        }
    
    async def _translate_text(
        self,
        text: str,
        target_language: str
    ) -> str:
        """
        Translate text to target language.
        
        Args:
            text: Text to translate
            target_language: Target language code
        
        Returns:
            str: Translated text
        """
        # TODO: Implement translation using LLM or translation API
        return text
