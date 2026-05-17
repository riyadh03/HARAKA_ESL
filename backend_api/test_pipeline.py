import requests
import json
import time

def test_pipeline():
    url = "http://localhost:8000/api/v1/session/submit"
    
    print("="*50)
    print("TESTING HARAKA.AI EDGE-TO-CLOUD PIPELINE")
    print("="*50)
    
    # Mock data exactly like NurseDashboard.tsx
    session_data = {
        "session_id": f"sess_{int(time.time()*1000)}",
        "patient_id": "AL-1956",
        "exercise_type": "Élévation Latérale du Bras",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "exercise_analytics": {
            "reps": 12,
            "max_angle": 85,
            "warnings": ["Mobilité réduite détectée"]
        },
        "pain_scale": 0,
        "calibration_baseline": {}
    }
    
    print("\n[ ] Sending Session Data to FastAPI Backend:")
    print(json.dumps(session_data, indent=2))
    print("\n[ ] Waiting for LLM (OpenRouter) to generate clinical report...")
    
    start_time = time.time()
    
    try:
        response = requests.post(url, json=session_data)
        response.raise_for_status()
        
        end_time = time.time()
        result = response.json()
        
        print(f"\n[+] SUCCESS! (Took {end_time - start_time:.2f} seconds)")
        print(f"[*] Model Used: {result.get('model_used')}")
        
        print("\n" + "="*50)
        print("GENERATED CLINICAL REPORT")
        print("="*50)
        print(result.get("report", result.get("raw_report", "No report text returned.")))
        
        print("\n" + "="*50)
        print("AMBER FLAGS (Hallucination Detection)")
        print("="*50)
        amber_flags = result.get("amber_flags", [])
        if not amber_flags:
            print("[+] No hallucinations detected. 100% grounded in JSON data.")
        else:
            for i, flag in enumerate(amber_flags, 1):
                print(f"\nFlag #{i}:")
                print(f"[-] Unsupported Claim: '{flag.get('sentence')}'")
                print(f"[!] Reason: {flag.get('reason')}")
        
        print("\n" + "="*50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the backend. Is Docker running?")
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ ERROR: API returned an error - {e}")
        try:
            print(response.json())
        except:
            print(response.text)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    test_pipeline()
