"""Siddha-Tech / Living Earth — Backend API.

FastAPI + Motor (MongoDB).
Implements:
  - JWT email/password auth (single seeded admin)
  - Public submission of new development ideas / startups (with optional pitch deck upload)
  - Admin moderation (approve / reject) of submissions
  - Read/Update site content (homepage hero, manifesto, etc.)
  - Read knowledge base (parts + chapters) and admin edit
"""

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import base64
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from chapters_seed import CHAPTERS_SEED


# ---------------- Config ----------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
JWT_ALGORITHM = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Siddha-Tech API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s :: %(message)s")
logger = logging.getLogger("siddha-tech")


# ---------------- Helpers ----------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ---------------- Models ----------------
class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class SubmissionCreate(BaseModel):
    founder_name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., max_length=40)
    startup_name: str = Field(..., min_length=1, max_length=160)
    category: str = Field(..., max_length=80)
    description: str = Field(..., min_length=10, max_length=4000)
    problem_solved: str = Field(..., min_length=5, max_length=2000)
    stage: str = Field(..., max_length=40)  # idea | prototype | launched
    team_size: int = Field(..., ge=1, le=10000)
    funding_needs: str = Field(..., max_length=200)
    location: str = Field(..., max_length=160)


class SubmissionStatusUpdate(BaseModel):
    status: str  # approved | rejected | pending
    admin_note: Optional[str] = None


class SiteContent(BaseModel):
    model_config = ConfigDict(extra="allow")

    hero_eyebrow: str
    hero_title: str
    hero_subtitle: str
    manifesto_title: str
    manifesto_body: str
    portal_eyebrow: str
    portal_title: str
    portal_subtitle: str
    study_eyebrow: str
    study_title: str
    study_subtitle: str
    video_caption: str
    footer_quote: str


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    summary: Optional[str] = None
    sections: Optional[list] = None
    tags: Optional[List[str]] = None
    reading_minutes: Optional[int] = None


# ---------------- Default site content ----------------
DEFAULT_SITE_CONTENT = {
    "hero_eyebrow": "SIDDHA-TECH · LIVING EARTH",
    "hero_title": "Rebuilding Earth from the soul outward.",
    "hero_subtitle": "A civilization where temples are reactors, language is technology, and agriculture is a sacred conversation with Bhumi Devi. Register your idea. Study the blueprint. Walk the path.",
    "manifesto_title": "We are not creating a future. We are remembering a design.",
    "manifesto_body": "Siddha-Tech fuses realized inner sciences with spiritual, architectural, and energetic systems — building temple-cities, regenerative agriculture, and consciousness infrastructure for the next Earth.",
    "portal_eyebrow": "FOUNDERS · BUILDERS · STEWARDS",
    "portal_title": "Register your idea for the new Earth.",
    "portal_subtitle": "If you are building in regenerative agriculture, sacred architecture, conscious technology, or any field of earth-development — submit your idea. Approved founders enter the Siddha-Tech council for mentorship and incubation.",
    "study_eyebrow": "THE AKASHIC BLUEPRINT",
    "study_title": "Study the manuscript of the new civilization.",
    "study_subtitle": "Seventeen chapters across six parts — organized for slow reading. The complete vision of Akash Shivapure.",
    "video_caption": "Siddha-Tech · Living Earth — a transmission",
    "footer_quote": "Om Tat Sat — That is the Truth.",
}


# ============================================================
# Routes
# ============================================================
@api_router.get("/")
async def root():
    return {"name": "Siddha-Tech API", "status": "ok"}


# ---------------- Auth ----------------
@api_router.post("/auth/login")
async def login(payload: LoginPayload, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=12 * 60 * 60,
        path="/",
    )
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
        "token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response, _: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Public Submissions ----------------
@api_router.post("/submissions")
async def create_submission(
    founder_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    startup_name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    problem_solved: str = Form(...),
    stage: str = Form(...),
    team_size: int = Form(...),
    funding_needs: str = Form(...),
    location: str = Form(...),
    pitch_deck: Optional[UploadFile] = File(None),
):
    try:
        data = SubmissionCreate(
            founder_name=founder_name,
            email=email,
            phone=phone,
            startup_name=startup_name,
            category=category,
            description=description,
            problem_solved=problem_solved,
            stage=stage,
            team_size=team_size,
            funding_needs=funding_needs,
            location=location,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    deck_payload = None
    if pitch_deck is not None and pitch_deck.filename:
        raw = await pitch_deck.read()
        if len(raw) > 15 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Pitch deck exceeds 15 MB limit")
        deck_payload = {
            "filename": pitch_deck.filename,
            "content_type": pitch_deck.content_type or "application/octet-stream",
            "size": len(raw),
            "data_b64": base64.b64encode(raw).decode("ascii"),
        }

    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "email": data.email.lower(),
        "pitch_deck": deck_payload,
        "status": "pending",
        "admin_note": None,
        "created_at": now_iso(),
    }
    await db.submissions.insert_one(doc)
    public = {k: v for k, v in doc.items() if k != "pitch_deck"}
    public["pitch_deck_filename"] = deck_payload["filename"] if deck_payload else None
    return public


@api_router.get("/submissions/public")
async def list_public_approved():
    """Public listing of approved startups (no PII)."""
    cursor = db.submissions.find(
        {"status": "approved"},
        {"_id": 0, "email": 0, "phone": 0, "pitch_deck": 0, "admin_note": 0},
    ).sort("created_at", -1)
    return await cursor.to_list(200)


# ---------------- Admin Submissions ----------------
@api_router.get("/admin/submissions")
async def admin_list_submissions(
    status: Optional[str] = None, _: dict = Depends(require_admin)
):
    query = {}
    if status and status != "all":
        query["status"] = status
    cursor = db.submissions.find(
        query, {"_id": 0, "pitch_deck.data_b64": 0}
    ).sort("created_at", -1)
    items = await cursor.to_list(500)
    for it in items:
        if it.get("pitch_deck"):
            it["pitch_deck_filename"] = it["pitch_deck"].get("filename")
            it["pitch_deck_size"] = it["pitch_deck"].get("size")
            it["pitch_deck_content_type"] = it["pitch_deck"].get("content_type")
            it.pop("pitch_deck", None)
    return items


@api_router.patch("/admin/submissions/{sub_id}")
async def admin_update_submission(
    sub_id: str, update: SubmissionStatusUpdate, _: dict = Depends(require_admin)
):
    if update.status not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.submissions.update_one(
        {"id": sub_id},
        {"$set": {"status": update.status, "admin_note": update.admin_note, "reviewed_at": now_iso()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    doc = await db.submissions.find_one({"id": sub_id}, {"_id": 0, "pitch_deck.data_b64": 0})
    return doc


@api_router.delete("/admin/submissions/{sub_id}")
async def admin_delete_submission(sub_id: str, _: dict = Depends(require_admin)):
    res = await db.submissions.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}


@api_router.get("/admin/submissions/{sub_id}/pitch")
async def admin_download_pitch(sub_id: str, _: dict = Depends(require_admin)):
    doc = await db.submissions.find_one({"id": sub_id}, {"_id": 0, "pitch_deck": 1})
    if not doc or not doc.get("pitch_deck"):
        raise HTTPException(status_code=404, detail="No pitch deck for this submission")
    deck = doc["pitch_deck"]
    raw = base64.b64decode(deck["data_b64"])

    def iter_bytes():
        yield raw

    return StreamingResponse(
        iter_bytes(),
        media_type=deck.get("content_type", "application/octet-stream"),
        headers={
            "Content-Disposition": f'attachment; filename="{deck.get("filename", "pitch.bin")}"'
        },
    )


# ---------------- Site Content (CMS-lite) ----------------
@api_router.get("/site-content")
async def get_site_content():
    doc = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    if not doc:
        return DEFAULT_SITE_CONTENT
    doc.pop("id", None)
    return doc


@api_router.put("/admin/site-content")
async def update_site_content(payload: SiteContent, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["updated_at"] = now_iso()
    await db.site_content.update_one(
        {"id": "main"}, {"$set": {**data, "id": "main"}}, upsert=True
    )
    return data


# ---------------- Knowledge Base (Chapters) ----------------
@api_router.get("/chapters")
async def list_chapters():
    cursor = db.chapters.find({}, {"_id": 0}).sort([("part_order", 1), ("chapter_number", 1)])
    return await cursor.to_list(500)


@api_router.get("/chapters/{slug}")
async def get_chapter(slug: str):
    doc = await db.chapters.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return doc


@api_router.patch("/admin/chapters/{slug}")
async def update_chapter(slug: str, payload: ChapterUpdate, _: dict = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = now_iso()
    res = await db.chapters.update_one({"slug": slug}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chapter not found")
    doc = await db.chapters.find_one({"slug": slug}, {"_id": 0})
    return doc


# ---------------- Startup ----------------
@app.on_event("startup")
async def startup_event():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.submissions.create_index("id", unique=True)
    await db.submissions.create_index("created_at")
    await db.chapters.create_index("slug", unique=True)

    # Seed admin (idempotent + re-sync password)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Akash Shivapure",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Refreshed admin password")

    # Seed chapters (only insert missing slugs — don't overwrite admin edits)
    existing_slugs = {c["slug"] for c in await db.chapters.find({}, {"slug": 1, "_id": 0}).to_list(500)}
    to_insert = [c for c in CHAPTERS_SEED if c["slug"] not in existing_slugs]
    if to_insert:
        await db.chapters.insert_many(to_insert)
        logger.info("Seeded %d chapters", len(to_insert))

    # Seed default site content
    if await db.site_content.find_one({"id": "main"}) is None:
        await db.site_content.insert_one({"id": "main", **DEFAULT_SITE_CONTENT, "updated_at": now_iso()})
        logger.info("Seeded default site content")


@app.on_event("shutdown")
async def shutdown_event():
    client.close()


# ---------------- Mount ----------------
app.include_router(api_router)

# CORS — read CORS_ORIGINS env var; fallback to FRONTEND_URL.
_cors_env = os.environ.get("CORS_ORIGINS", "").strip()
if _cors_env == "*":
    _allow_origins = ["*"]
    _allow_credentials = False  # browsers reject wildcard with credentials
elif _cors_env:
    _allow_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]
    _allow_credentials = True
else:
    _allow_origins = [FRONTEND_URL]
    _allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)
