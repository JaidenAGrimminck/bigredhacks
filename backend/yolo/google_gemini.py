# google_gemini.py
import os, base64, json
from flask import Flask, request, jsonify
from google import genai
from google.genai import types

# --- Config ---
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_INLINE_BYTES = 20 * 1024 * 1024  # ~20MB inline limit for data URLs

client = genai.Client(api_key="AIzaSyBbQcOkmejzywJdZmDIv-PWvfAjRmoy1SE")
app = Flask(__name__)

def _parse_data_url(data_url: str) -> tuple[str, bytes]:
    if not data_url or not data_url.startswith("data:"):
        raise ValueError("Expected a base64 data URL starting with 'data:'.")
    header, b64 = data_url.split(",", 1)
    if ";base64" not in header:
        raise ValueError("Only base64-encoded data URLs are supported.")
    mime = header.split(";")[0].replace("data:", "", 1) or "application/octet-stream"
    blob = base64.b64decode(b64, validate=True)
    if len(blob) > MAX_INLINE_BYTES:
        raise ValueError("Image too large for inline upload; keep under ~20MB.")
    return mime, blob

def _labels_from_gemini(image_part, items) -> list[str]:
    prompt = (
        "The image is from a user who is playing a game where they need to find certain objects around them. "
        "List up to 10 concise object labels visible in this photo within a <think></think> block. "
        "After listing the the objects, compare the list to the provided items that might be in the image. "
        "The items are: " + ", ".join(f'"{it}"' for it in items) + ". "
        "If any of those items are visible in the image, return a JSON array in the format of ```[\"item1\", \"item2\", ...]``` with the first index being the item that matches the list of items provided. "
        "If none of the items are visible, return a JSON array with a few of the most prominent objects in the image in the same format. "
    )
    cfg = types.GenerateContentConfig(response_mime_type="application/json")
    resp = client.models.generate_content(model=MODEL, contents=[image_part, prompt], config=cfg)
    text = resp.text or "{}"
    # Be resilient if the model adds fences by mistake:
    if "```" in text:
        text = text.split("```", 1)[-1]
        if "```" in text:
            text = text.split("```", 1)[0]

    print("Gemini response:", text)
    data = json.loads(text)
    labels = data if isinstance(data, list) else []
    # Normalize to lowercase strings
    labels = [str(x).strip().lower() for x in labels if isinstance(x, (str, int, float))]
    # Deduplicate while preserving order
    seen, uniq = set(), []
    for lab in labels:
        if lab and lab not in seen:
            seen.add(lab)
            uniq.append(lab)
    return uniq

@app.post("/detect")
def detect():
    """
    Expects: {"image": "data:image/...;base64,...."}
    Returns: {"labels": [...], "model": "..."}
    """
    try:
        body = request.get_json(force=True, silent=False) or {}
        data_url = body.get("image")
        if not data_url:
            return jsonify(error="Missing 'image' (base64 data URL)."), 400
        items = body.get("items")
        
        if not items or not isinstance(items, list) or not all(isinstance(i, str) for i in items):
            return jsonify(error="Missing 'items' list of strings."), 400

        mime, img_bytes = _parse_data_url(data_url)
        image_part = types.Part.from_bytes(data=img_bytes, mime_type=mime)

        labels = _labels_from_gemini(image_part, items)
        return jsonify(labels=labels, model=MODEL)
    except json.JSONDecodeError as e:
        return jsonify(error=f"JSON decode error from Gemini: {e}"), 502
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        # Surface a simple error; print full stack in dev if needed
        return jsonify(error=f"Internal error: {e}"), 500

if __name__ == "__main__":
    # Run: export GOOGLE_API_KEY=YOUR_KEY && python google_gemini.py
    app.run(host="127.0.0.1", port=3333, debug=True)
