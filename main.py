from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import cv2
import numpy as np
from insightface.app import FaceAnalysis
import pickle
from typing import List
import shutil
from pathlib import Path
import json
import mediapipe as mp
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import imgaug.augmenters as iaa
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

load_dotenv()

app = FastAPI(title="Face Recognition API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
DATASET_PATH = "dataset"
TEST_IMAGES_PATH = "test-images"
OUTPUT_PATH = "output"
EMBEDDINGS_FILE = "face_embeddings.pkl"

# Create directories
for path in [DATASET_PATH, TEST_IMAGES_PATH, OUTPUT_PATH]:
    Path(path).mkdir(parents=True, exist_ok=True)

# Initialize models (lazy loading)
face_app = None
face_mesh = None

def get_face_app():
    global face_app
    if face_app is None:
        face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        face_app.prepare(ctx_id=0, det_size=(640, 640))
    return face_app

def get_face_mesh():
    global face_mesh
    if face_mesh is None:
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)
    return face_mesh

def get_db_connection():
    try:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            return None
        return psycopg2.connect(database_url)
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None

@app.get("/")
async def root():
    return {"status": "Face Recognition API is running"}

@app.post("/api/process-student")
async def process_student(
    studentId: str = Form(...),
    front: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...)
):
    """Process and validate student photos"""
    try:
        student_dir = Path(DATASET_PATH) / studentId
        student_dir.mkdir(parents=True, exist_ok=True)
        
        mesh = get_face_mesh()
        results = {}
        
        for pose, file in [("front", front), ("left", left), ("right", right)]:
            # Save file
            file_path = student_dir / f"{pose}.jpg"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Validate face
            img = cv2.imread(str(file_path))
            if img is None:
                results[pose] = {"success": False, "error": "Invalid image"}
                continue
            
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            face_results = mesh.process(rgb)
            
            if face_results.multi_face_landmarks:
                cv2.imwrite(str(file_path), img)
                results[pose] = {"success": True}
            else:
                results[pose] = {"success": False, "error": "No face detected"}
        
        return JSONResponse(content={
            "success": True,
            "studentId": studentId,
            "results": results
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train")
async def train_faces():
    """Train face recognition model"""
    try:
        if not os.path.exists(DATASET_PATH):
            raise HTTPException(status_code=400, detail="No dataset found")
        
        app_model = get_face_app()
        face_dict = {}
        embedding_vectors = []
        labels = []
        
        augmenter = iaa.Sequential([
            iaa.Fliplr(0.5),
            iaa.Affine(rotate=(-15, 15)),
            iaa.Multiply((0.8, 1.2)),
            iaa.GammaContrast((0.7, 1.3)),
        ])
        
        student_folders = [d for d in os.listdir(DATASET_PATH) 
                          if os.path.isdir(os.path.join(DATASET_PATH, d))]
        
        for student_folder in student_folders:
            person_path = os.path.join(DATASET_PATH, student_folder)
            person_embeddings = []
            
            image_files = [f for f in os.listdir(person_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            for image_name in image_files:
                image_path = os.path.join(person_path, image_name)
                img = cv2.imread(image_path)
                if img is None:
                    continue
                
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                faces = app_model.get(img_rgb)
                
                if len(faces) > 0:
                    face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
                    emb = face.normed_embedding
                    person_embeddings.append(emb)
                    embedding_vectors.append(emb)
                    labels.append(student_folder)
                
                # Augmentation
                for _ in range(2):
                    aug_img = augmenter.augment_image(img_rgb)
                    faces_aug = app_model.get(aug_img)
                    if len(faces_aug) > 0:
                        face_aug = max(faces_aug, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
                        emb_aug = face_aug.normed_embedding
                        person_embeddings.append(emb_aug)
                        embedding_vectors.append(emb_aug)
                        labels.append(student_folder)
            
            if person_embeddings:
                median_embedding = np.median(person_embeddings, axis=0)
                median_embedding = median_embedding / np.linalg.norm(median_embedding)
                face_dict[student_folder.lower()] = median_embedding
                
                # Update database
                conn = get_db_connection()
                if conn:
                    try:
                        cursor = conn.cursor()
                        embedding_bytes = median_embedding.tobytes()
                        cursor.execute("""
                            UPDATE "Student" 
                            SET "faceEmbedding" = %s 
                            WHERE id = %s
                        """, (embedding_bytes, student_folder))
                        conn.commit()
                        cursor.close()
                        conn.close()
                    except Exception as e:
                        print(f"DB update error: {e}")
        
        # Save embeddings
        with open(EMBEDDINGS_FILE, "wb") as f:
            pickle.dump(face_dict, f)
        
        return JSONResponse(content={
            "success": True,
            "studentsTrained": len(face_dict),
            "totalSamples": len(embedding_vectors)
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recognize")
async def recognize_faces(
    frames: List[UploadFile] = File(...),
    courseId: str = Form(...)
):
    """Recognize faces from uploaded frames"""
    try:
        # Clear and save new frames
        shutil.rmtree(TEST_IMAGES_PATH, ignore_errors=True)
        Path(TEST_IMAGES_PATH).mkdir(parents=True, exist_ok=True)
        
        for idx, frame in enumerate(frames):
            file_path = Path(TEST_IMAGES_PATH) / f"frame_{idx}.jpg"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(frame.file, buffer)
        
        # Load embeddings
        if not os.path.exists(EMBEDDINGS_FILE):
            raise HTTPException(status_code=400, detail="No trained model found")
        
        with open(EMBEDDINGS_FILE, "rb") as f:
            known_faces = pickle.load(f)
        
        app_model = get_face_app()
        recognized_students = set()
        all_detections = []
        confidences = []
        
        image_files = sorted([f for f in os.listdir(TEST_IMAGES_PATH) 
                            if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        
        for idx, img_name in enumerate(image_files):
            img_path = os.path.join(TEST_IMAGES_PATH, img_name)
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            faces = app_model.get(img_rgb)
            
            for face_idx, face in enumerate(faces):
                embedding = face.normed_embedding
                if np.linalg.norm(embedding) > 0:
                    embedding = embedding / np.linalg.norm(embedding)
                
                best_match, best_sim = None, 0.0
                for name, known_emb in known_faces.items():
                    sim = np.dot(embedding, known_emb) / (np.linalg.norm(embedding) * np.linalg.norm(known_emb))
                    if sim > best_sim and sim > 0.45:
                        best_match, best_sim = name, sim
                
                if best_match:
                    recognized_students.add(best_match)
                    confidences.append(best_sim)
                    all_detections.append({
                        "imageIndex": idx,
                        "faceIndex": face_idx,
                        "confidence": float(best_sim),
                        "studentId": best_match
                    })
        
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0
        
        return JSONResponse(content={
            "totalFaces": len(all_detections),
            "recognizedStudents": list(recognized_students),
            "averageConfidence": avg_confidence,
            "detections": all_detections
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)