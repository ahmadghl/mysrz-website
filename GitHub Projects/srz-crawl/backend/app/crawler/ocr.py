# /opt/srz-crawl/app/crawler/ocr.py
import os
import io
import base64
from typing import Optional
import httpx
import pytesseract
from PIL import Image
from loguru import logger
from openai import AsyncOpenAI

from app.utils.dynamic_supabase import get_supabase_client_for_user

TESSERACT_PATH = os.getenv("TESSERACT_PATH", "/usr/bin/tesseract")
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


async def process_image(
    image_url: str,
    page_id: str,
    user_id: str,
    openai_api_key: Optional[str] = None,
) -> dict:
    """Download image, perform OCR, optionally get Vision description."""
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(image_url)
            if resp.status_code != 200:
                return {}

            image_bytes = resp.content
            img = Image.open(io.BytesIO(image_bytes))

            # Tesseract OCR
            ocr_text = ""
            try:
                ocr_text = pytesseract.image_to_string(img)
            except Exception as e:
                logger.debug(f"Tesseract failed for {image_url}: {e}")

            # OpenAI Vision
            vision_description = ""
            if openai_api_key:
                try:
                    vision_description = await _vision_describe(
                        image_bytes, image_url, openai_api_key
                    )
                except Exception as e:
                    logger.debug(f"Vision API failed for {image_url}: {e}")

            # Save to Supabase
            supabase = await get_supabase_client_for_user(user_id)
            result = supabase.table("page_images").insert({
                "page_id": page_id,
                "user_id": user_id,
                "url": image_url,
                "ocr_text": ocr_text.strip()[:5000] if ocr_text else None,
                "vision_description": vision_description[:2000] if vision_description else None,
            }).execute()

            return {
                "ocr_text": ocr_text,
                "vision_description": vision_description,
            }

    except Exception as e:
        logger.warning(f"Image processing failed for {image_url}: {e}")
        return {}


async def _vision_describe(
    image_bytes: bytes, image_url: str, api_key: str
) -> str:
    """Get image description from OpenAI Vision API."""
    client = AsyncOpenAI(api_key=api_key)

    # Encode image to base64
    b64 = base64.b64encode(image_bytes).decode("utf-8")

    # Detect content type
    content_type = "image/jpeg"
    if image_url.lower().endswith(".png"):
        content_type = "image/png"
    elif image_url.lower().endswith(".webp"):
        content_type = "image/webp"
    elif image_url.lower().endswith(".gif"):
        content_type = "image/gif"

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{b64}",
                            "detail": "low",
                        },
                    },
                    {
                        "type": "text",
                        "text": "Describe this image briefly. Focus on text, data, diagrams, or relevant content. Be concise.",
                    },
                ],
            }
        ],
        max_tokens=300,
    )
    return response.choices[0].message.content or ""
