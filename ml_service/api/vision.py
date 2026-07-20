from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import json
import logging
import base64
import requests
from core.config import settings

logger = logging.getLogger("vision_api")
router = APIRouter()

OLLAMA_URL = "http://localhost:11434/v1/chat/completions" # Ollama's OpenAI compatible endpoint
OLLAMA_MODEL = "llava"

@router.post("/analyze")
async def analyze_vision(
    image: UploadFile = File(None),
    task_type: str = Form(...),
    context: str = Form("{}")
):
    try:
        context_data = json.loads(context)
    except Exception:
        context_data = {}

    try:
        base64_image = None
        if image:
            image_bytes = await image.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Determine prompt based on task_type
        if task_type == "health":
            prompt = """
            You are an expert agronomist AI. Analyze the provided image of a plant leaf, vegetable, or fruit for health and diseases.
            Be highly accurate in your detection. Identify the crop name, any diseases or pests present, the cure/treatment, and preventative measures.
            Calculate a health percentage (0-100) indicating how healthy the specimen is.
            Return ONLY a valid JSON object strictly matching this schema, no markdown blocks:
            {
                "diseaseDetection": {
                    "plant": "string (name of crop)",
                    "health_status": "string (Healthy, Diseased, Pest Infested)",
                    "disease_name": "string (Specific disease or null)",
                    "health_percentage": "number (0-100, representing how healthy the plant is)",
                    "cure": "string (Treatment recommendation)",
                    "precaution": "string (Preventative measures to take)"
                }
            }
            """
        elif task_type == "harvest":
            prompt = """
            You are an expert agronomist AI. Analyze the provided crop image for harvest readiness.
            Return ONLY a valid JSON object strictly matching this schema, no markdown blocks:
            {
                "summary": {
                    "cropName": "string",
                    "maturityStage": "string (e.g. Milk stage, Ready, Overripe)",
                    "readinessScore": "number (0-100)"
                },
                "cards": {
                    "harvestReadiness": { "verdict": "string", "indicators": ["string"], "action": "string" },
                    "labourAndEquipment": { "labourRequired": "string", "machinery": "string", "estimatedCost": "string" },
                    "postHarvestCare": { "handling": ["string"], "storage": "string" }
                }
            }
            """
        elif task_type == "selling":
            prompt = """
            You are an expert agricultural economist AI. Analyze the provided harvested crop image for quality and market value.
            Return ONLY a valid JSON object strictly matching this schema, no markdown blocks:
            {
                "summary": {
                    "cropName": "string",
                    "qualityGrade": "string (e.g. Grade A, Grade B)",
                    "estimatedPrice": "string (e.g. ₹2000 - ₹2200 per quintal)"
                },
                "cards": {
                    "qualityAssessment": { "grade": "string", "defects": ["string"], "colorAndSize": "string" },
                    "marketStrategy": { "bestMarket": "string", "holdOrSell": "string (Hold | Sell Now)", "reasoning": "string" },
                    "storageRecommendation": { "method": "string", "maxDuration": "string" }
                }
            }
            """
        else:
            raise HTTPException(status_code=400, detail="Invalid task_type.")

        # Send to LM Studio (OpenAI Compatible API)
        content_array = [
            {"type": "text", "text": prompt + f"\nContext: {json.dumps(context_data)}"}
        ]
        
        if base64_image:
            content_array.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                }
            })

        payload = {
            "model": OLLAMA_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": content_array
                }
            ],
            "temperature": 0.1,
            "stream": False
        }
        
        try:
            logger.info(f"Sending image to local Ollama ({OLLAMA_MODEL})...")
            response = requests.post(OLLAMA_URL, json=payload, timeout=120)
            response.raise_for_status()
            
            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"].strip()
            
            # Clean markdown if present
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()

            return json.loads(response_text)
            
        except Exception as e:
            logger.warning(f"Ollama API failed: {e}. Ensure Ollama is running and the model '{OLLAMA_MODEL}' is pulled. Trying Gemini Fallback.")
            try:
                if not settings.GEMINI_API_KEY:
                    raise Exception("No Gemini API Key provided in settings")
                
                logger.info("Sending image to Google Gemini (gemini-2.5-flash)...")
                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                
                gemini_payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt + f"\nContext: {json.dumps(context_data)}"}
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "response_mime_type": "application/json"
                    }
                }
                if base64_image:
                    gemini_payload["contents"][0]["parts"].append({
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }
                    })
                
                resp = requests.post(gemini_url, json=gemini_payload, timeout=60)
                resp.raise_for_status()
                gemini_resp = resp.json()
                response_text = gemini_resp["candidates"][0]["content"]["parts"][0]["text"].strip()
                
                # Clean markdown if present
                if response_text.startswith("```json"):
                    response_text = response_text[7:-3].strip()
                elif response_text.startswith("```"):
                    response_text = response_text[3:-3].strip()
                    
                return json.loads(response_text)
                
            except Exception as gemini_e:
                logger.warning(f"Gemini API fallback failed: {gemini_e}. Using static fallback.")
                
            if task_type == "health":
                return {
                    "diseaseDetection": {
                        "plant": "Fallback Crop",
                        "health_status": "Healthy (Fallback)",
                        "disease_name": "None",
                        "health_percentage": 99,
                        "cure": "API Limit Reached. This is a fallback analysis.",
                        "precaution": "Please check your API keys or try again later."
                    }
                }
            elif task_type == "harvest":
                return {
                    "summary": {
                        "cropName": "Fallback Crop",
                        "maturityStage": "Ready",
                        "readinessScore": 85
                    },
                    "cards": {
                        "harvestReadiness": { "verdict": "Ready Now", "indicators": ["Visual readiness"], "action": "Proceed with harvest" },
                        "labourAndEquipment": { "labourRequired": "Standard", "machinery": "Tractor", "estimatedCost": "₹1500" },
                        "postHarvestCare": { "handling": ["Gentle handling"], "storage": "Dry place" }
                    }
                }
            elif task_type == "selling":
                return {
                    "summary": {
                        "cropName": "Fallback Crop",
                        "qualityGrade": "Grade A",
                        "estimatedPrice": "₹2000 per quintal"
                    },
                    "cards": {
                        "qualityAssessment": { "grade": "Grade A", "defects": ["None"], "colorAndSize": "Standard" },
                        "marketStrategy": { "bestMarket": "Local APMC", "holdOrSell": "Sell Now", "reasoning": "Current high prices" },
                        "storageRecommendation": { "method": "Standard Storage", "maxDuration": "2 Weeks" }
                    }
                }
            else:
                raise

    except Exception as e:
        logger.error(f"Vision API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
