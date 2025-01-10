import os
import uuid
import json
from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, HTTPException
from sqlmodel import col, delete, func, select

from contextlib import asynccontextmanager
from app.api.deps import CurrentUser, SessionDep
from app.detector import Detector
from app.core.config import settings
from app.utils import upload_file, generate_presigned_url
from app.models import MinioBucket, DetectHistoryCreate, DetectHistory, DetectHistoriesPublic, DetectHistoryPublic
from app.crud import create_detect_history

detector: Detector | None = None


@asynccontextmanager
async def lifespan(app: APIRouter):
    global detector
    detector = Detector(os.path.join(settings.BASE_DIR, "yolo_models", "best.pt"))
    yield


router = APIRouter(prefix="/detection", tags=["detection"], lifespan=lifespan)


# 访客
@router.post("/guest")
def guest_detection(file: UploadFile):
    # 确保文件名唯一性
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    # 保存临时文件
    temp_file_path = os.path.join(settings.BASE_DIR, "temp", unique_filename)
    os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
    with open(temp_file_path, "wb") as f:
        f.write(file.file.read())

    upload_file(temp_file_path, MinioBucket.UPLOAD, unique_filename)
    raw_url = generate_presigned_url(MinioBucket.UPLOAD, unique_filename)
    try:
        detections = detector.detect(temp_file_path)
    except Exception as e:
        print(str(e))
        return {"status": "failed"}
    finally:
        os.remove(temp_file_path)

    return {"status": "success", "rawUrl": raw_url, "detections": detections}


@router.post("/")
def detection(session: SessionDep, current_user: CurrentUser, file: UploadFile):
    # 确保文件名唯一性
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    # 保存临时文件
    temp_file_path = os.path.join(settings.BASE_DIR, "temp", unique_filename)
    os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
    with open(temp_file_path, "wb") as f:
        f.write(file.file.read())

    upload_file(temp_file_path, MinioBucket.UPLOAD, unique_filename)
    raw_url = generate_presigned_url(MinioBucket.UPLOAD, unique_filename)
    try:
        detections = detector.detect(temp_file_path)
    except Exception as e:
        print(str(e))
        return {"status": "failed"}
    finally:
        os.remove(temp_file_path)

    current_time = datetime.now(timezone.utc)
    detections_in_db = detections.copy()
    detections_in_db.pop('AnnotatedUrl')
    
    create_detect_history(
        session=session,
        detect_history_in=DetectHistoryCreate(
            raw_image=MinioBucket.UPLOAD.value + "/" + unique_filename,
            annotated_image=MinioBucket.ANNOTATED.value
            + "/"
            + unique_filename.replace(".png", "_annotated.png"),
            timestamp=current_time.isoformat(),
            detections=json.dumps(detections_in_db),
        ),
        owner_id=current_user.id,
    )

    return {"status": "success", "rawUrl": raw_url, "detections": detections}

@router.get("/history", response_model=DetectHistoriesPublic)
def get_history(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 10) -> Any:
    
    count_statement = select(func.count()).select_from(DetectHistory).where(DetectHistory.owner_id == current_user.id)
    count = session.exec(count_statement).one()
    
    statement = select(DetectHistory).offset(skip).limit(limit)
    detection_histories = session.exec(statement).all()
    # 对字段进行处理 返回url
    detection_histories = [detection.model_dump() for detection in detection_histories]
    for detection in detection_histories:
        detection["raw_image_url"] = generate_presigned_url(MinioBucket.UPLOAD, detection["raw_image"].split("/")[-1])
        detection["annotated_image_url"] = generate_presigned_url(MinioBucket.ANNOTATED, detection["annotated_image"].split("/")[-1])
        
    return DetectHistoriesPublic(data=detection_histories, count=count)
    
    
@router.get("/history/{history_id}", response_model=DetectHistoryPublic)
def get_history_by_id(session: SessionDep, current_user: CurrentUser, history_id: uuid.UUID) -> Any:
    statement = select(DetectHistory).where(DetectHistory.owner_id == current_user.id).where(DetectHistory.id == history_id)
    detection_history = session.exec(statement).first()
    if not detection_history:
        raise HTTPException(status_code=404, detail="Detection history not found")
    detection_history = detection_history.model_dump()
    detection_history["raw_image_url"] = generate_presigned_url(MinioBucket.UPLOAD, detection_history["raw_image"].split("/")[-1])
    detection_history["annotated_image_url"] = generate_presigned_url(MinioBucket.ANNOTATED, detection_history["annotated_image"].split("/")[-1])
    return detection_history