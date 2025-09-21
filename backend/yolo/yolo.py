# app.py
import os, io, base64, json, argparse
from typing import Optional, List, Dict, Any
import numpy as np
from PIL import Image
import torch
from ultralytics import YOLO

# ---- Config ----
MODEL_PATH   = os.getenv("YOLO_WEIGHTS", "yolov8x-oiv7.pt")   # e.g., 'yolov8s.pt'
DEVICE       = os.getenv("YOLO_DEVICE", "cpu")           # 'cuda' if available
DEFAULT_CONF = float(os.getenv("YOLO_CONF", 0.5))        # confidence threshold
MAX_BYTES    = 20 * 1024 * 1024                          # 20MB guard for decoded image

# ---- Load YOLO once ----
model = YOLO(MODEL_PATH)
model.to(DEVICE)

def _parse_classes(arg: Optional[str]) -> Optional[List[int]]:
    """
    Accepts: None, 'person,car', '0,2' or mixed (e.g. 'person,2').
    Returns list of class IDs or None.
    """
    if not arg:
        return None
    parts = [p.strip() for p in arg.split(",") if p.strip()]
    name2id = {v: k for k, v in model.names.items()}
    out: List[int] = []
    for p in parts:
        if p.isdigit():
            out.append(int(p))
        elif p in name2id:
            out.append(int(name2id[p]))
        else:
            raise ValueError(f"Unknown class: {p}")
    return out

def _decode_data_url(s: str) -> bytes:
    """
    Accepts:
      - 'data:image/png;base64,<...>'
      - raw base64 '<...>' (no header)
    Returns raw bytes.
    """
    if not isinstance(s, str) or not s.strip():
        raise ValueError("Empty data URL / base64 string.")
    s = s.strip()
    if s.startswith("data:"):
        try:
            header, b64data = s.split(",", 1)
        except ValueError:
            raise ValueError("Invalid data URL format.")
        if ";base64" not in header:
            raise ValueError("Data URL must be base64-encoded.")
    else:
        b64data = s

    # normalize and fix padding
    b64data = b64data.replace("-", "+").replace("_", "/")
    b64data += "=" * ((4 - len(b64data) % 4) % 4)

    raw = base64.b64decode(b64data, validate=False)
    if len(raw) > MAX_BYTES:
        raise ValueError("Decoded image too large.")
    return raw

def _pil_from_data_url(s: str) -> Image.Image:
    raw = _decode_data_url(s)
    return Image.open(io.BytesIO(raw)).convert("RGB")

def _detections_list(result) -> List[Dict[str, Any]]:
    """
    Ultralytics result -> list of dicts:
    [{class_id, class_name, confidence, bbox:[x1,y1,x2,y2]}, ...]
    """
    boxes = result.boxes
    if boxes is None or len(boxes) == 0:
        return []
    xyxy = boxes.xyxy.detach().cpu().numpy()            # (N,4)
    conf = boxes.conf.detach().cpu().numpy()            # (N,)
    cls  = boxes.cls.detach().cpu().numpy().astype(int) # (N,)
    names = result.names
    dets = []
    for (x1, y1, x2, y2), c, k in zip(xyxy, conf, cls):
        dets.append({
            "class_name": names[int(k)],
            "confidence": float(c),
        })
    return dets

def detect_from_data_url(
    data_url: str,
    conf: float = DEFAULT_CONF,
    classes: Optional[str] = None,
    out_path: Optional[str] = None,
) -> str:
    """
    Run YOLO on a data URL (or raw base64 string).
    - Returns a JSON string of detections.
    - If out_path is provided, saves an annotated image there.

    JSON schema: [{"class_id", "class_name", "confidence", "bbox":[x1,y1,x2,y2]}, ...]
    """
    parsed_classes = _parse_classes(classes)
    img = _pil_from_data_url(data_url)
    arr = np.array(img)  # RGB

    with torch.inference_mode():
        result = model(arr, conf=conf, classes=parsed_classes, verbose=False)[0]
        dets = _detections_list(result)

        # Save annotated image if requested
        if out_path:
            # result.plot() returns BGR numpy array
            annotated_bgr = result.plot()
            annotated_rgb = annotated_bgr[..., ::-1]  # BGR -> RGB (no OpenCV needed)
            Image.fromarray(annotated_rgb).save(out_path)

    return json.dumps(dets, ensure_ascii=False)