# /opt/srz-crawl/app/models/schemas.py
from pydantic import BaseModel, HttpUrl, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


# ─── Enums ───────────────────────────────────────────────────────────────────

class ScheduleType(str, Enum):
    hourly = "hourly"
    twelve_hours = "12_hours"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    custom = "custom"

class TeamRole(str, Enum):
    admin = "admin"
    editor = "editor"
    viewer = "viewer"

class CrawlStatus(str, Enum):
    pending = "pending"
    running = "running"
    paused = "paused"
    completed = "completed"
    failed = "failed"
    stopped = "stopped"


# ─── Domain ──────────────────────────────────────────────────────────────────

class DomainCreate(BaseModel):
    url: str

    @validator("url")
    def validate_url(cls, v):
        if not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v.rstrip("/")

class DomainUpdate(BaseModel):
    is_selected: Optional[bool] = None

class DomainResponse(BaseModel):
    id: str
    url: str
    is_selected: bool
    pages_crawled: int
    last_crawl_at: Optional[datetime]
    status: str
    created_at: datetime


# ─── Crawl ───────────────────────────────────────────────────────────────────

class CrawlStartRequest(BaseModel):
    domain_ids: Optional[List[str]] = None  # None = use selected domains
    max_pages: Optional[int] = None  # None = unlimited

class CrawlProgress(BaseModel):
    job_id: str
    pages_crawled: int
    total_pages: int
    current_url: Optional[str]
    speed: float  # pages per second
    status: CrawlStatus
    started_at: datetime
    estimated_completion: Optional[datetime]

class CrawlHistoryResponse(BaseModel):
    id: str
    domain_id: str
    domain_url: str
    status: CrawlStatus
    pages_crawled: int
    started_at: datetime
    completed_at: Optional[datetime]
    error: Optional[str]


# ─── Schedule ─────────────────────────────────────────────────────────────────

class ScheduleCreate(BaseModel):
    name: str
    domain_id: str
    schedule_type: ScheduleType
    urls: Optional[List[str]] = None  # specific URLs or None for full domain
    cron_expression: Optional[str] = None  # for custom type
    custom_datetime: Optional[datetime] = None  # for one-time custom
    is_recurring: bool = True

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None
    schedule_type: Optional[ScheduleType] = None
    urls: Optional[List[str]] = None
    cron_expression: Optional[str] = None
    is_enabled: Optional[bool] = None

class ScheduleResponse(BaseModel):
    id: str
    name: str
    domain_id: str
    domain_url: str
    schedule_type: ScheduleType
    cron_expression: Optional[str]
    is_enabled: bool
    next_run_at: Optional[datetime]
    last_run_at: Optional[datetime]
    created_at: datetime


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatSessionCreate(BaseModel):
    domain_id: str
    name: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):
    id: str
    name: str
    domain_id: str
    domain_url: str
    created_at: datetime
    last_message_at: Optional[datetime]

class MessageCreate(BaseModel):
    content: str
    file_ids: Optional[List[str]] = None

class MessageResponse(BaseModel):
    id: str
    role: str  # user | assistant
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    expires_at: datetime


# ─── Settings ────────────────────────────────────────────────────────────────

class OpenAIKeyUpdate(BaseModel):
    api_key: str
    model: str = "gpt-4-turbo"
    temperature: float = 0.7

class OpenAIKeyResponse(BaseModel):
    has_key: bool
    masked_key: Optional[str]  # sk-...xxxx
    model: str
    temperature: float

class PromptUpdate(BaseModel):
    system_prompt: str

class PromptResponse(BaseModel):
    system_prompt: str
    default_prompt: str

class SubscriptionResponse(BaseModel):
    tier: str
    pages_used: int
    pages_limit: int
    storage_used_mb: float
    storage_limit_mb: float
    crawls_this_month: int
    team_members_count: int
    team_members_limit: int


# ─── Supabase Config ──────────────────────────────────────────────────────────

class SupabaseConfigUpdate(BaseModel):
    supabase_url: str
    anon_key: str
    service_role_key: str

class SupabaseConfigResponse(BaseModel):
    is_custom: bool
    masked_url: Optional[str]
    has_anon_key: bool
    has_service_key: bool
    connection_status: Optional[str]
    migrated_at: Optional[datetime]

class SupabaseTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float]


# ─── Team ────────────────────────────────────────────────────────────────────

class TeamInvite(BaseModel):
    email: EmailStr
    role: TeamRole

class TeamMemberUpdate(BaseModel):
    role: TeamRole

class TeamMemberResponse(BaseModel):
    id: str
    email: str
    role: TeamRole
    status: str  # pending | active
    invited_at: datetime
    joined_at: Optional[datetime]


# ─── WebSocket ───────────────────────────────────────────────────────────────

class WSProgressMessage(BaseModel):
    job_id: str
    pages_crawled: int
    total_pages: int
    current_url: Optional[str]
    speed: float
    status: str
    message: Optional[str]
