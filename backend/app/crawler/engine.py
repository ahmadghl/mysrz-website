import asyncio
import time
import re
from typing import Optional, List, Set
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from playwright.async_api import async_playwright

from app.core.config import settings
from app.schemas.schemas import CrawlMode

class CrawlResult:
    def __init__(self):
        self.url: str = ""
        self.status_code: int = 0
        self.title: str = ""
        self.content_type: str = ""
        self.html: str = ""
        self.text: str = ""
        self.word_count: int = 0
        self.links: List[str] = []
        self.load_time_ms: int = 0
        self.error: Optional[str] = None
        self.depth: int = 0
        self.bytes_downloaded: int = 0

class RobotsChecker:
    def __init__(self):
        self._cache = {}

    def can_fetch(self, url: str, user_agent: str = "*") -> bool:
        parsed = urlparse(url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        if base not in self._cache:
            rp = RobotFileParser()
            rp.set_url(f"{base}/robots.txt")
            try:
                rp.read()
                self._cache[base] = rp
            except Exception:
                self._cache[base] = None
        rp = self._cache.get(base)
        return True if rp is None else rp.can_fetch(user_agent, url)

class PageFetcher:
    def __init__(self, mode: CrawlMode = CrawlMode.auto):
        self.mode = mode
        self._client: Optional[httpx.AsyncClient] = None
        self._playwright = None
        self._browser = None

    async def start(self):
        self._client = httpx.AsyncClient(
            timeout=settings.REQUEST_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": settings.USER_AGENT},
            limits=httpx.Limits(max_connections=20),
        )
        if self.mode in (CrawlMode.dynamic, CrawlMode.auto):
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=settings.PLAYWRIGHT_HEADLESS,
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )

    async def stop(self):
        if self._client: await self._client.aclose()
        if self._browser: await self._browser.close()
        if self._playwright: await self._playwright.stop()

    async def fetch(self, url: str, depth: int = 0) -> CrawlResult:
        result = CrawlResult()
        result.url, result.depth = url, depth
        start = time.time()
        try:
            if self.mode == CrawlMode.static:
                await self._fetch_static(url, result)
            elif self.mode == CrawlMode.dynamic:
                await self._fetch_dynamic(url, result)
            else:
                await self._fetch_static(url, result)
                if len(result.text) < 200: await self._fetch_dynamic(url, result)
        except Exception as e:
            result.error = str(e)
        result.load_time_ms = int((time.time() - start) * 1000)
        return result

    async def _fetch_static(self, url: str, result: CrawlResult):
        resp = await self._client.get(url)
        result.status_code = resp.status_code
        result.content_type = resp.headers.get("content-type", "")
        result.html = resp.text
        result.bytes_downloaded = len(resp.content)
        self._parse_html(result)

    async def _fetch_dynamic(self, url: str, result: CrawlResult):
        page = await self._browser.new_page()
        try:
            await page.goto(url, timeout=30000, wait_until="networkidle")
            result.html = await page.content()
            result.bytes_downloaded = len(result.html.encode('utf-8'))
            result.status_code = 200
            self._parse_html(result)
        finally:
            await page.close()

    def _parse_html(self, result: CrawlResult):
        soup = BeautifulSoup(result.html, "lxml")
        result.title = soup.title.string if soup.title else ""
        result.text = soup.get_text(separator=" ", strip=True)
        result.word_count = len(result.text.split())
        result.links = [a["href"] for a in soup.find_all("a", href=True) if not a["href"].startswith(("#", "mailto:"))]

class CrawlEngine:
    def __init__(self, job_id: str, domain: str, **kwargs):
        self.job_id, self.domain = job_id, domain.rstrip("/")
        self.base_domain = urlparse(self.domain).netloc
        self.max_pages = kwargs.get('max_pages', 1000)
        self.on_page_crawled = kwargs.get('on_page_crawled')
        self.visited, self.queue = set(), asyncio.Queue()
        self.fetcher = PageFetcher(mode=kwargs.get('mode', CrawlMode.auto))
        self.pages_crawled, self.bytes_downloaded = 0, 0
        self.stopped = False

    async def run(self):
        await self.fetcher.start()
        await self.queue.put((self.domain, 0))
        while not self.stopped and not self.queue.empty() and self.pages_crawled < self.max_pages:
            url, depth = await self.queue.get()
            if url in self.visited: continue
            self.visited.add(url)
            result = await self.fetcher.fetch(url, depth)
            if not result.error:
                self.pages_crawled += 1
                self.bytes_downloaded += result.bytes_downloaded
                if self.on_page_crawled: await self.on_page_crawled(result)
                for link in result.links:
                    norm = urljoin(url, link).split("#")[0]
                    if urlparse(norm).netloc == self.base_domain and norm not in self.visited:
                        await self.queue.put((norm, depth + 1))
            await asyncio.sleep(0.5)
        await self.fetcher.stop()
