import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini_key():
    print("Loading .env file...")
    load_dotenv()
    
    # Check both OPENAI_API_KEY and GOOGLE_API_KEY since you might have put it in either
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("ERROR: No API key found in .env file!")
        return
        
    print(f"Using API Key: {api_key[:10]}... (truncated for security)")
    
    try:
        print("Connecting to Google Gemini servers...")
        genai.configure(api_key=api_key)
        
        # We use a simple model just to test the connection
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        print("Sending a simple 'Hello' message to Gemini...")
        response = model.generate_content("Hello! Are you working?")
        
        print("\nSUCCESS! Google accepted your key.")
        print(f"Gemini says: {response.text}")
        print("\nYou can now go back to your app, everything is working!")
        
    except Exception as e:
        print("\nFAILED! Google rejected your key.")
        print(f"Error details: {str(e)}")
        print("\nThis confirms the key is invalid or deleted. Please generate a new one at: https://aistudio.google.com/app/apikey")

if __name__ == "__main__":
    test_gemini_key()
