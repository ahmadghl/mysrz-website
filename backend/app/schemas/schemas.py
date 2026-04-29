from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    paused = "paused"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class CrawlMode(str, Enum):
    static = "static"       # Scrapy only (fast)
    dynamic = "dynamic"     # Playwright (JS-heavy sites)
    auto = "auto"           # Auto-detect


# ── Crawl Job ──────────────────────────────────

class CrawlJobCreate(BaseModel):
    domain: str = Field(..., example="https://example.com")
    name: Optional[str] = None
    mode: CrawlMode = CrawlMode.auto
    max_pages: Optional[int] = Field(None, le=50000)
    crawl_delay: Optional[float] = Field(None, ge=0.5, le=30.0)
    max_depth: Optional[int] = Field(None, ge=1, le=20)
    follow_external_links: bool = False
    respect_robots_txt: bool = True
    include_patterns: Optional[List[str]] = None   # regex URL patterns to include
    exclude_patterns: Optional[List[str]] = None   # regex URL patterns to exclude
    schedule_cron: Optional[str] = None            # e.g. "0 2 * * *" for 2am daily
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class CrawlJobUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[JobStatus] = None
    max_pages: Optional[int] = None
    tags: Optional[List[str]] = None


class CrawlJobResponse(BaseModel):
    id: str
    domain: str
    name: Optional[str]
    status: JobStatus
    mode: CrawlMode
    max_pages: Optional[int]
    crawl_delay: float
    max_depth: Optional[int]
    pages_crawled: int
    pages_found: int
    pages_failed: int
    bytes_downloaded: int
    respect_robots_txt: bool
    follow_external_links: bool
    include_patterns: Optional[List[str]]
    exclude_patterns: Optional[List[str]]
    schedule_cron: Optional[str]
    tags: Optional[List[str]]
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# ── Crawled Page ───────────────────────────────

class PageResponse(BaseModel):
    id: str
    job_id: str
    url: str
    title: Optional[str]
    status_code: Optional[int]
    content_type: Optional[str]
    word_count: Optional[int]
    links_found: int
    depth: int
    load_time_ms: Optional[int]
    crawled_at: datetime
    error: Optional[str]


# ── Domain ─────────────────────────────────────

class DomainStats(BaseModel):
    domain: str
    total_jobs: int
    total_pages: int
    last_crawled: Optional[datetime]
    avg_pages_per_job: float


# ── Stats ──────────────────────────────────────

class GlobalStats(BaseModel):
    total_jobs: int
    active_jobs: int
    total_pages_crawled: int
    total_domains: int
    total_bytes_downloaded: int
    jobs_today: int
    pages_today: int


# ── Auth ───────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
