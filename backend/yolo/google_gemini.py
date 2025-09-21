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


def _grade_with_gemini(items: list[dict], description: str, *, parse_points: bool = True, default_points: int = 2) -> list[int]:
    """
    If parse_points=True, Gemini extracts max_points from each question (default if missing).
    If parse_points=False, each item must include 'max_points' and we clamp to it.
    Returns a list[int] of scores, one per item.
    """
    if parse_points:
        prompt = (
            f"You are an autograder for a viewer who watched a reel, with the description {description}. For each item:\n"
            f"1) Parse integer max_points from item.question (e.g., '5 points', '(5 pts)'); "
            f"if absent, use {default_points}.\n"
            "2) Grade item.response from 0..max_points (integers only).\n"
            "Make sure to read the question carefully and grade based on the content of the response.\n"
            "Grade strictly based on correctness, completeness, and relevance to the question. Make sure that the response's grammar is correct.\n"
            "Use <think></think> to reason step-by-step if needed.\n"
            "Return ONLY JSON: {\"scores\": [int, ...]} in item order."
        )
    else:
        prompt = (
            "You are an autograder. For each item with item.max_points, "
            "grade item.response from 0..item.max_points (integers only). "
            "Return ONLY JSON: {\"scores\": [int, ...]} in item order."
        )

    # print(prompt, flush=True)

    cfg = types.GenerateContentConfig(response_mime_type="application/json")
    resp = client.models.generate_content(
        model=MODEL,
        contents=[prompt, json.dumps({"items": items}, ensure_ascii=False)],
        config=cfg,
    )

    text = (resp.text or "{}").strip()
    # print(text, flush=True)
    if "```" in text:  # be resilient to code fences
        text = text.split("```", 1)[-1].split("```", 1)[0]

    data = json.loads(text)
    raw = data.get("scores", [])
    n = len(items)

    def to_int(x):
        try:
            return int(round(float(x)))
        except Exception:
            return 0

    scores = [max(0, to_int(x)) for x in raw][:n] + [0] * (n - len(raw))

    # If max_points supplied (parse_points=False), clamp per item.
    if not parse_points:
        scores = [min(scores[i], int(items[i].get("max_points", 0))) for i in range(n)]

    return scores

@app.post("/grade")
def grade():
    # print("testing/??", flush=True)
    """
    POST /grade
    Body: { "questions": [str, ...], "responses": [str, ...] }
    Returns: { "scores": [int, ...] }
    (Gemini parses point values from each question; defaults to 2 if absent.)
    """
    try:
        body = request.get_json(force=True)
        questions = body.get("questions")
        responses = body.get("responses")
        description = body.get("description", "A video reel with various questions.")

        # print("Grading", len(questions), "questions")

        if not isinstance(questions, list) or not isinstance(responses, list):
            return jsonify(error="'questions' and 'responses' must be lists"), 400
        if len(questions) != len(responses):
            return jsonify(error="Lengths of 'questions' and 'responses' must match"), 400
        if not questions:
            return jsonify(scores=[])
        
        # print("grading", flush=True)

        items = [{"question": str(q), "response": str(r)} for q, r in zip(questions, responses)]
        scores = _grade_with_gemini(items, description=description, parse_points=True, default_points=2)
        return jsonify(scores=scores)

    except json.JSONDecodeError as e:
        return jsonify(error=f"Bad JSON: {e}"), 400
    except Exception as e:
        return jsonify(error=f"Internal error: {e}"), 500

if __name__ == "__main__":
    # Run: export GOOGLE_API_KEY=YOUR_KEY && python google_gemini.py
    app.run(host="127.0.0.1", port=3333, debug=True)
