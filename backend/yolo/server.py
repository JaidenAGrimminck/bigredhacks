from flask import Flask, request, jsonify, send_from_directory
from yolo import detect_from_data_url
import os, json, traceback
from uuid import uuid4
from werkzeug.exceptions import HTTPException

app = Flask(__name__)

# Always return JSON on errors so the client can see details
@app.errorhandler(Exception)
def handle_any_error(e):
    code = 500
    payload = {"type": e.__class__.__name__, "error": str(e)}
    if isinstance(e, HTTPException):
        code = e.code
        payload["name"] = e.name
    payload["traceback"] = traceback.format_exc()
    return jsonify(payload), code

def _coerce_to_dict(x):
    """
    Accepts:
      - dict -> returned as-is
      - list -> wrapped as {"detections": list}
      - str  -> try json.loads, then recurse; else {"raw": str}
      - anything else -> {"raw": str(x)}
    """
    if isinstance(x, dict):
        return x
    if isinstance(x, list):
        return {"detections": x}
    if isinstance(x, str):
        try:
            parsed = json.loads(x)
            return _coerce_to_dict(parsed)
        except Exception:
            return {"raw": x}
    return {"raw": str(x)}

@app.post("/detect")
def detect():
    data = request.get_json(silent=True) or {}
    data_url = data.get("data_url")
    if not data_url:
        return jsonify(error="Missing 'data_url' in JSON body"), 400

    try:
        conf = float(data.get("conf", 0.25))
    except Exception:
        return jsonify(error="'conf' must be a float"), 400


    y = detect_from_data_url(
        data_url=data_url,
        conf=conf,
    )

    result = _coerce_to_dict(y)
    return jsonify(result), 200

@app.get("/outputs/<path:filename>")
def get_output(filename):
    return send_from_directory("outputs", filename, as_attachment=False)

if __name__ == "__main__":
    # stick with your port 3333
    app.run(host="0.0.0.0", port=3333)
