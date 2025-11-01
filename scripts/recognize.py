#!/usr/bin/env python3
"""
Face Recognition Script (Vercel-Compatible)
Uses /tmp for temporary storage.
"""

import os
import cv2
import numpy as np
from insightface.app import FaceAnalysis
import pickle
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import json
import sys
import logging
import contextlib
import io
import shutil

# ----------------- Logging Setup -----------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.handlers.clear()
stderr_handler = logging.StreamHandler(sys.stderr)
stderr_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(levelname)s: %(message)s')
stderr_handler.setFormatter(formatter)
logger.addHandler(stderr_handler)

# ----------------- Temp Paths -----------------
BASE_TMP = "/tmp"
TEST_FOLDER = os.path.join(BASE_TMP, "test-images")
OUTPUT_FOLDER = os.path.join(BASE_TMP, "output")
EMBEDDINGS_FILE = os.path.join(BASE_TMP, "face_embeddings.pkl")

os.makedirs(TEST_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ----------------- Helper Functions -----------------
def enhance_image(img):
    try:
        pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        pil = ImageEnhance.Brightness(pil).enhance(1.2)
        pil = ImageEnhance.Contrast(pil).enhance(1.5)
        pil = ImageEnhance.Sharpness(pil).enhance(1.3)
        return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.warning(f"Image enhancement failed: {e}")
        return img

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def save_annotated_image(pil_image, faces, known_faces, image_name, confidence_threshold):
    try:
        draw = ImageDraw.Draw(pil_image)
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        recognized = set()
        for face in faces:
            bbox = face.bbox.astype(int)
            embedding = face.normed_embedding
            if np.linalg.norm(embedding) > 0:
                embedding = embedding / np.linalg.norm(embedding)
            best_match, best_sim = "Unknown", 0.0
            for name, known_emb in known_faces.items():
                sim = cosine_similarity(embedding, known_emb)
                if sim > best_sim and sim > confidence_threshold and name not in recognized:
                    best_match, best_sim = name.title(), sim
            if best_match != "Unknown":
                recognized.add(best_match.lower())
            color = "lime" if best_match != "Unknown" else "red"
            draw.rectangle([bbox[0]-1, bbox[1]-1, bbox[2]+1, bbox[3]+1], outline=color, width=3)
            draw.text((bbox[0], max(0, bbox[1]-20)), f"{best_match} {best_sim:.2f}", fill=color, font=font)
        save_path = os.path.join(OUTPUT_FOLDER, f"annotated_{image_name}")
        pil_image.save(save_path, quality=95)
    except Exception as e:
        logger.error(f"Failed to save annotated image: {e}")

def safe_get(app, img):
    f = io.StringIO()
    with contextlib.redirect_stdout(f):
        faces = app.get(img)
    out = f.getvalue()
    if out.strip():
        sys.stderr.write(out + "\n")
    return faces

def process_image(image_path, known_faces, app, idx, confidence_threshold=0.45):
    detections = []
    try:
        img = cv2.imread(image_path)
        if img is None or img.shape[0] == 0:
            logger.warning(f"Invalid image: {image_path}")
            return detections
        pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        faces = []
        for variant in [img, enhance_image(img)]:
            try:
                detected = safe_get(app, variant)
                if detected:
                    faces.extend(detected)
            except Exception as e:
                logger.debug(f"Face detection error: {e}")

        unique_faces = []
        for face in faces:
            bbox = face.bbox
            if not any(
                max(0, min(bbox[2], uf.bbox[2])-max(bbox[0], uf.bbox[0])) *
                max(0, min(bbox[3], uf.bbox[3])-max(bbox[1], uf.bbox[1])) / 
                min((bbox[2]-bbox[0])*(bbox[3]-bbox[1]), (uf.bbox[2]-uf.bbox[0])*(uf.bbox[3]-uf.bbox[1])) > 0.7
                for uf in unique_faces
            ):
                unique_faces.append(face)

        recognized = set()
        for i, face in enumerate(unique_faces):
            bbox = face.bbox.astype(int).tolist()
            emb = face.normed_embedding
            if np.linalg.norm(emb) == 0:
                continue
            emb = emb / np.linalg.norm(emb)
            best_match, best_sim = None, 0.0
            for name, known_emb in known_faces.items():
                sim = cosine_similarity(emb, known_emb)
                if sim > best_sim and sim > confidence_threshold and name not in recognized:
                    best_match, best_sim = name, sim
            detections.append({
                "imageIndex": idx,
                "faceIndex": i,
                "bbox": bbox,
                "confidence": float(best_sim),
                "studentId": best_match if best_match else None
            })
            if best_match:
                recognized.add(best_match)
                logger.info(f"✓ Recognized: {best_match} ({best_sim:.3f})")

        save_annotated_image(pil, unique_faces, known_faces, os.path.basename(image_path), confidence_threshold)

    except Exception as e:
        logger.error(f"Error processing {image_path}: {e}")
    return detections

# ----------------- Main -----------------
def main():
    try:
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        for f in os.listdir(OUTPUT_FOLDER):
            path = os.path.join(OUTPUT_FOLDER, f)
            try:
                os.remove(path)
            except Exception:
                pass

        if not os.path.exists(EMBEDDINGS_FILE):
            print(json.dumps({"error": "No trained model found"}))
            sys.exit(1)

        with open(EMBEDDINGS_FILE, "rb") as f:
            known_faces = pickle.load(f)

        app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))

        image_files = [f for f in os.listdir(TEST_FOLDER) if f.lower().endswith(('.jpg','.jpeg','.png'))]
        if not image_files:
            print(json.dumps({"error": "No images found"}))
            sys.exit(1)

        all_detections, total_faces, recognized, confs = [], 0, set(), []

        for idx, name in enumerate(image_files):
            dets = process_image(os.path.join(TEST_FOLDER, name), known_faces, app, idx)
            all_detections.extend(dets)
            for d in dets:
                total_faces += 1
                if d["studentId"]:
                    recognized.add(d["studentId"])
                    confs.append(d["confidence"])

        avg_conf = float(np.mean(confs)) if confs else 0.0
        print(json.dumps({
            "totalFaces": total_faces,
            "recognizedStudents": list(recognized),
            "averageConfidence": avg_conf,
            "detections": all_detections
        }))

    except Exception as e:
        logger.error(f"Recognition failed: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
