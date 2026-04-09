# CallGuard AI Server

A complete production-ready FastAPI backend for an AI scam detection engine trained specifically on Indian phone fraud patterns.

## Prerequisites

- Python 3.8+
- An API Key from Anthropic (`ANTHROPIC_API_KEY`)

## Installation

1. **Install the requirements:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up your environment variables:**
   Open the `.env` file and add your actual API key:
   ```env
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
   ```

## Running the Server

Start the API server using uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Your server will be running at `http://localhost:8000` (or `http://0.0.0.0:8000`).

## Exposing with ngrok

To share the local server securely over the Internet:
```bash
ngrok http 8000
```
This generates a forwarding URL that you can use externally.

## API Endpoints & Usage

### 1. GET /health
Check the status of the server.

**Example command:**
```bash
curl -X GET http://localhost:8000/health
```

---

### 2. POST /analyze
Analyzes a single transcript. Expects a JSON payload with a `transcript` field.

**Example command:**
```bash
curl -X POST http://localhost:8000/analyze \
     -H "Content-Type: application/json" \
     -d '{"transcript": "Sir aapka SBI account block hone wala hai abhi OTP share karo"}'
```

---

### 3. POST /analyze/batch
Sequential processing for an array of multiple transcripts. Expects a `transcripts` array field.

**Example command:**
```bash
curl -X POST http://localhost:8000/analyze/batch \
     -H "Content-Type: application/json" \
     -d '{"transcripts": ["Hey bro what time is the party tonight", "Congratulations aapne KBC mein 25 lakh jeete hain, abhi bank details do"]}'
```

---

### 4. GET /test
Automatically runs 3 predefined test cases and streams their responses, allowing for quick verification without additional client input.

**Example command:**
```bash
curl -X GET http://localhost:8000/test
```
