import json
from utils.amber_flag_verifier import AmberFlagVerifier

def test_amber_flag_verifier():
    # 1. Simulate the session data sent by the frontend
    session_data = {
        "metadata": {
            "session_id": "sess_001",
            "patient_id": "pat_123"
        },
        "exercise_analytics": {
            "max_angle": 145,
            "min_angle": 45,
            "reps": 10
        },
        "pain_scale": 2
    }
    
    # 2. Simulate the LLM's raw response.
    # It contains both grounded sentences (with correct JSON citations)
    # and hallucinated/invented sentences (no citations, or wrong citations).
    mock_llm_report = (
        "The patient completed the session successfully. "
        "A maximum angle of 145 degrees was achieved during the exercise [exercise_analytics.max_angle]. "
        "The patient also demonstrated excellent core stability throughout the session. "
        "A total of 10 repetitions were performed [exercise_analytics.reps]. "
        "The patient reported feeling a sharp pain in the lower back [pain_scale.lower_back]. "
        "Pain scale was moderate at 2 out of 5 [pain_scale]."
    )
    
    print("--- Session Data ---")
    print(json.dumps(session_data, indent=2))
    print("\n--- Raw LLM Report ---")
    print(mock_llm_report)
    
    # 3. Run the verifier
    verifier = AmberFlagVerifier()
    amber_flags, is_verified, flagged_report_text = verifier.verify_report(mock_llm_report, session_data)
    
    print("\n--- Verifier Results ---")
    print(f"Is Verified (No Hallucinations)? {is_verified}")
    print(f"Total Amber Flags Detected: {len(amber_flags)}")
    
    print("\n--- Detected Amber Flags (Hallucinations) ---")
    for idx, flag in enumerate(amber_flags, 1):
        print(f"Flag {idx}:")
        print(f"  Sentence: {flag.sentence}")
        print(f"  Reason: {flag.reason}")
    
    print("\n--- Final Output for Frontend (with HTML Spans) ---")
    print(flagged_report_text)

if __name__ == "__main__":
    test_amber_flag_verifier()
