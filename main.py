import os
import json
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI application
app = FastAPI(title="CallGuard AI Server")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Anthropic API Key
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

class AnalyzeRequest(BaseModel):
    transcript: str

class BatchAnalyzeRequest(BaseModel):
    transcripts: List[str]

# Exact System prompt as requested
SYSTEM_PROMPT = """You are CallGuard, an AI scam detection engine trained specifically on Indian phone fraud patterns.

Analyze the given call transcript and detect:
- Urgency tactics: account block, arrest, court, deadline, emergency
- Financial fraud: OTP request, UPI transfer, bank details, KYC update
- Impersonation: SBI, RBI, CBI, police, government, telecom company
- Fear tactics: legal action, FIR, warrant, jail
- Hinglish scam phrases: 'aapka account band', 'turant transfer karo', 'OTP batao'
- Reward scams: lottery won, KBC, prize money

Classify as:
- SAFE: Normal conversation, no red flags
- SUSPICIOUS: Some concerning elements but not conclusive
- SCAM: Clear fraud attempt with multiple red flags

Return ONLY a valid JSON object. No explanation. No markdown. No extra text. Just JSON:
{
  "risk": "SAFE" or "SUSPICIOUS" or "SCAM",
  "reason": "One clear sentence explaining why",
  "confidence": number between 0 and 100,
  "flags": ["list", "of", "detected", "red", "flags"]
}"""


def log_request(endpoint: str, transcript: str, risk: str):
    """Logs the request details to the console"""
    timestamp = datetime.now().isoformat()
    # Safely take up to 50 chars of string, removing newlines
    trunc_transcript = transcript[:50].replace('\n', ' ') if transcript else ""
    print(f"[{timestamp}] {endpoint} | Transcript: '{trunc_transcript}' | Result: {risk}")


def get_anthropic_client() -> anthropic.Anthropic:
    """Helper to fetch an Anthropic Client cleanly"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    # Implementing requested request timeout of 10 seconds
    return anthropic.Anthropic(
        api_key=ANTHROPIC_API_KEY, 
        timeout=10.0
    )


def process_transcript(transcript: str, endpoint: str) -> dict:
    """Core logic to call the AI for a particular transcript."""
    client = get_anthropic_client()
    
    try:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": transcript}
            ]
        )
        
        # Parse output as JSON
        content = response.content[0].text
        
        try:
            parsed_json = json.loads(content)
        except json.JSONDecodeError:
            # Fallback if Anthropic returns invalid JSON
            parsed_json = {
                "risk": "SUSPICIOUS", 
                "reason": "Analysis inconclusive", 
                "confidence": 50, 
                "flags": []
            }
            
        log_request(endpoint, transcript, parsed_json.get("risk", "SUSPICIOUS"))
        return parsed_json
        
    except Exception as e:
        log_request(endpoint, transcript, "ERROR")
        raise HTTPException(status_code=503, detail="AI service unavailable")


@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "model": "claude-opus-4-6", 
        "service": "CallGuard AI"
    }


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    if not payload.transcript or len(payload.transcript) < 5:
        raise HTTPException(status_code=400, detail="Transcript is empty or less than 5 chars")
        
    return process_transcript(payload.transcript, "/analyze")


@app.post("/analyze/batch")
def analyze_batch(payload: BatchAnalyzeRequest):
    results = []
    for transcript in payload.transcripts:
        if not transcript or len(transcript) < 5:
            # Default response for invalid transcript entries
            invalid_response = {
                "risk": "SUSPICIOUS", 
                "reason": "Transcript empty or less than 5 chars", 
                "confidence": 0, 
                "flags": []
            }
            results.append(invalid_response)
            log_request("/analyze/batch", transcript, "SUSPICIOUS")
        else:
            res = process_transcript(transcript, "/analyze/batch")
            results.append(res)
            
    return {"results": results}


@app.get("/test")
def test_endpoint():
    test_cases = [
        "Sir aapka SBI account block hone wala hai abhi OTP share karo",
        "Hey bro what time is the party tonight",
        "Congratulations aapne KBC mein 25 lakh jeete hain, abhi bank details do"
    ]
    
    results = []
    # Test cases run sequentially and return all 3
    for transcript in test_cases:
        res = process_transcript(transcript, "/test")
        results.append(res)
        
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
