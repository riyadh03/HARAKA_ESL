"""
Amber Flag Verifier
===================

Utility for detecting hallucinations in LLM-generated clinical reports.

Uses regex-based verification to ensure every factual statement in the
report has a corresponding JSON field citation. Unsupported statements
are flagged as "Amber Flags" for clinician review.

Author: Haraka.ai Team
"""

import re
from typing import Dict, Any, List, Tuple
from models.session import AmberFlag


class AmberFlagVerifier:
    """
    Verifier for detecting unsupported statements in clinical reports.
    
    Ensures LLM grounding by checking that:
    1. Every factual statement has a citation [field_name]
    2. Citations reference valid JSON fields
    3. No information is invented or hallucinated
    """
    
    def __init__(self):
        """
        Initialize amber flag verifier.
        """
        # Regex pattern to extract citations
        self.citation_pattern = r'\[([^\]]+)\]'
        
        # Regex pattern to identify factual statements
        # (sentences with numbers, measurements, or specific claims)
        self.factual_pattern = r'(?:\d+\.?\d*|achieved|completed|performed|showed|demonstrated)'
    
    def verify_report(
        self,
        report_text: str,
        session_data: Dict[str, Any]
    ) -> Tuple[List[AmberFlag], bool]:
        """
        Verify that all statements in the report are grounded in JSON data.
        
        Process:
        1. Extract all citations from report
        2. Validate citations exist in session JSON
        3. Identify sentences without citations
        4. Flag unsupported statements as amber flags
        
        Args:
            report_text: Generated clinical report text
            session_data: Original session JSON data
        
        Returns:
            tuple: (list of amber flags, overall verification status)
        """
        amber_flags = []
        
        # Split report into sentences
        sentences = self._split_into_sentences(report_text)
        
        for sentence in sentences:
            # Check if sentence is factual (contains measurements or claims)
            if self._is_factual_statement(sentence):
                # Extract citations from sentence
                citations = self._extract_citations(sentence)
                
                if not citations:
                    # No citations for factual statement - flag it
                    flag = AmberFlag(
                        sentence=sentence.strip(),
                        location="unknown",  # TODO: Determine section
                        reason="Factual statement without JSON citation",
                        suggested_citation=None
                    )
                    amber_flags.append(flag)
                else:
                    # Validate citations exist in session data
                    for citation in citations:
                        if not self._citation_exists_in_data(citation, session_data):
                            flag = AmberFlag(
                                sentence=sentence.strip(),
                                location="unknown",  # TODO: Determine section
                                reason=f"Citation [{citation}] not found in session data",
                                suggested_citation=self._suggest_citation(sentence, session_data)
                            )
                            amber_flags.append(flag)
        
        # Determine overall verification status
        is_verified = len(amber_flags) == 0
        
        return amber_flags, is_verified
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences.
        
        Args:
            text: Report text
        
        Returns:
            list: Sentences
        """
        # Simple sentence splitting on periods, question marks, exclamation marks
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _is_factual_statement(self, sentence: str) -> bool:
        """
        Determine if a sentence is factual (requires citation).
        
        Factual statements contain:
        - Numbers or measurements
        - Performance claims (achieved, completed, performed)
        - Demonstrations (showed, demonstrated)
        
        Args:
            sentence: Sentence to check
        
        Returns:
            bool: True if factual, False otherwise
        """
        # Check for numbers
        if re.search(r'\d+', sentence):
            return True
        
        # Check for factual keywords
        factual_keywords = [
            'achieved', 'completed', 'performed', 'showed',
            'demonstrated', 'reached', 'maintained', 'exceeded'
        ]
        
        sentence_lower = sentence.lower()
        for keyword in factual_keywords:
            if keyword in sentence_lower:
                return True
        
        return False
    
    def _extract_citations(self, sentence: str) -> List[str]:
        """
        Extract JSON field citations from a sentence.
        
        Args:
            sentence: Sentence to extract citations from
        
        Returns:
            list: Citations (field names)
        """
        matches = re.findall(self.citation_pattern, sentence)
        return matches
    
    def _citation_exists_in_data(self, citation: str, session_data: Dict[str, Any]) -> bool:
        """
        Check if a citation field exists in the session JSON data.
        
        Args:
            citation: Field name (e.g., "exercise_analytics.max_angle")
            session_data: Session JSON data
        
        Returns:
            bool: True if field exists, False otherwise
        """
        # Navigate through nested JSON using dot notation
        keys = citation.split('.')
        current = session_data
        
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return False
        
        return True
    
    def _suggest_citation(self, sentence: str, session_data: Dict[str, Any]) -> str:
        """
        Suggest a citation for an uncited sentence.
        
        Analyzes the sentence to find relevant JSON fields.
        
        Args:
            sentence: Uncited sentence
            session_data: Session JSON data
        
        Returns:
            str: Suggested citation field name
        """
        # Extract keywords from sentence
        keywords = self._extract_keywords(sentence)
        
        # Search for matching fields in session data
        matching_fields = self._find_matching_fields(keywords, session_data)
        
        if matching_fields:
            return matching_fields[0]
        
        return None
    
    def _extract_keywords(self, sentence: str) -> List[str]:
        """
        Extract relevant keywords from a sentence.
        
        Args:
            sentence: Sentence to extract keywords from
        
        Returns:
            list: Keywords
        """
        # Remove common words and extract nouns/numbers
        stop_words = ['the', 'a', 'an', 'is', 'was', 'of', 'in', 'to', 'for']
        
        words = sentence.lower().split()
        keywords = [w for w in words if w not in stop_words and len(w) > 2]
        
        return keywords
    
    def _find_matching_fields(self, keywords: List[str], data: Dict[str, Any]) -> List[str]:
        """
        Find JSON fields that match the given keywords.
        
        Args:
            keywords: Keywords to search for
            data: Session JSON data
        
        Returns:
            list: Matching field paths
        """
        matches = []
        
        def search_dict(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    
                    # Check if key matches any keyword
                    if any(keyword in key.lower() for keyword in keywords):
                        matches.append(current_path)
                    
                    # Recursively search nested objects
                    search_dict(value, current_path)
        
        search_dict(data)
        
        return matches
    
    def generate_verification_summary(
        self,
        amber_flags: List[AmberFlag],
        total_sentences: int
    ) -> Dict[str, Any]:
        """
        Generate a summary of the verification results.
        
        Args:
            amber_flags: List of detected amber flags
            total_sentences: Total number of sentences in report
        
        Returns:
            dict: Verification summary
        """
        flagged_count = len(amber_flags)
        unflagged_count = total_sentences - flagged_count
        verification_rate = (unflagged_count / total_sentences * 100) if total_sentences > 0 else 0
        
        return {
            "total_sentences": total_sentences,
            "flagged_sentences": flagged_count,
            "unflagged_sentences": unflagged_count,
            "verification_rate_percent": round(verification_rate, 2),
            "status": "verified" if flagged_count == 0 else "needs_review"
        }
