# /opt/srz-crawl/app/crawler/spider.py
import asyncio
import hashlib
import re
import time
from typing import Set, List, Optional, Callable
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser
import httpx
from bs4 import BeautifulSoup
from loguru import logger

from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.utils.limits import increment_pages_crawled
from app.crawler.ocr import process_image
from app.crawler.queue_worker import update_job_progress
from app.rag.embeddings import generate_and_store_embeddings

# File extensions to skip
SKIP_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
    ".mp4", ".mp3", ".wav", ".avi", ".mov",
    ".zip", ".tar", ".gz", ".rar",
    ".css", ".js", ".json", ".xml",
    ".exe", ".dmg", ".pkg",
}

class CrawlSpider:
    def __init__(
        self,
        user_id: str,
        domain_id: str,
        start_url: str,
        job_id: str,
        openai_api_key: Optional[str] = None,
        delay: float = 1.0,
        max_pages: Optional[int] = None,
        on_progress: Optional[Callable] = None,
    ):
        self.user_id = user_id
        self.domain_id = domain_id
        self.start_url = start_url
        self.job_id = job_id
        self.openai_api_key = openai_api_key
        self.delay = delay
        self.max_pages = max_pages
        self.on_progress = on_progress

        parsed = urlparse(start_url)
        self.base_domain = parsed.netloc
        self.base_scheme = parsed.scheme

        self.visited: Set[str] = set()
        self.queue: List[str] = [start_url]
        self.pages_crawled = 0
        self.total_discovered = 1
        self.is_stopped = False
        self.start_time = time.time()

        self._robot_parser = RobotFileParser()
        self._robot_parser.set_url(f"{self.base_scheme}://{self.base_domain}/robots.txt")

    async def _load_robots(self):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"{self.base_scheme}://{self.base_domain}/robots.txt"
                )
                if resp.status_code == 200:
                    self._robot_parser.parse(resp.text.splitlines())
        except Exception:
            pass  # If robots.txt fails, proceed without it

    def _can_fetch(self, url: str) -> bool:
        try:
            return self._robot_parser.can_fetch("*", url)
        except Exception:
            return True

    def _should_skip(self, url: str) -> bool:
        parsed = urlparse(url)
        if parsed.netloc and parsed.netloc != self.base_domain:
            return True
        if parsed.scheme in ("mailto", "javascript", "tel", "ftp"):
            return True
        path = parsed.path.lower()
        for ext in SKIP_EXTENSIONS:
            if path.endswith(ext):
                return True
        return False

    def _normalize_url(self, url: str, base_url: str) -> Optional[str]:
        try:
            url = url.strip()
            if url.startswith("#") or not url:
                return None
            full_url = urljoin(base_url, url)
            parsed = urlparse(full_url)
            # Remove fragment
            normalized = parsed._replace(fragment="").geturl()
            return normalized
        except Exception:
            return None

    def _extract_links(self, soup: BeautifulSoup, page_url: str) -> List[str]:
        links = []
        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            url = self._normalize_url(href, page_url)
            if url and not self._should_skip(url) and url not in self.visited:
                links.append(url)
        return list(set(links))

    def _extract_images(self, soup: BeautifulSoup, page_url: str) -> List[str]:
        images = []
        for tag in soup.find_all("img", src=True):
            src = tag["src"]
            url = self._normalize_url(src, page_url)
            if url:
                images.append(url)
        return images

    def _extract_pdfs(self, soup: BeautifulSoup, page_url: str) -> List[str]:
        pdfs = []
        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            if href.lower().endswith(".pdf"):
                url = self._normalize_url(href, page_url)
                if url:
                    pdfs.append(url)
        return pdfs

    async def _crawl_page(self, url: str) -> Optional[dict]:
        """Crawl a single page and return extracted data."""
        try:
            headers = {
                "User-Agent": "SRZCrawl/1.0 (+https://srz-crawl.com/bot)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
            async with httpx.AsyncClient(
                timeout=30, follow_redirects=True, headers=headers
            ) as client:
                resp = await client.get(url)

                if resp.status_code != 200:
                    return None

                content_type = resp.headers.get("content-type", "")
                if "text/html" not in content_type:
                    return None

                soup = BeautifulSoup(resp.text, "lxml")

                # Extract metadata
                title = soup.find("title")
                title_text = title.get_text(strip=True) if title else ""

                meta_desc = soup.find("meta", attrs={"name": "description"})
                meta_desc_text = meta_desc.get("content", "") if meta_desc else ""

                # Remove scripts, styles, nav, footer for clean content
                for tag in soup(["script", "style", "nav", "footer", "header"]):
                    tag.decompose()

                content = soup.get_text(separator="\n", strip=True)
                content = re.sub(r"\n{3,}", "\n\n", content)  # collapse whitespace

                links = self._extract_links(soup, url)
                images = self._extract_images(soup, url)
                pdfs = self._extract_pdfs(soup, url)

                return {
                    "url": url,
                    "title": title_text,
                    "meta_description": meta_desc_text,
                    "content": content,
                    "content_hash": hashlib.md5(content.encode()).hexdigest(),
                    "links": links,
                    "images": images,
                    "pdfs": pdfs,
                }
        except Exception as e:
            logger.warning(f"Failed to crawl {url}: {e}")
            return None

    async def _save_page(self, page_data: dict) -> Optional[str]:
        """Save page to Supabase and return page_id."""
        try:
            supabase = await get_supabase_client_for_user(self.user_id)

            # Upsert page
            result = (
                supabase.table("pages")
                .upsert({
                    "domain_id": self.domain_id,
                    "user_id": self.user_id,
                    "url": page_data["url"],
                    "title": page_data["title"],
                    "meta_description": page_data["meta_description"],
                    "content": page_data["content"],
                    "content_hash": page_data["content_hash"],
                    "crawled_at": "now()",
                }, on_conflict="domain_id,url")
                .execute()
            )

            if result.data:
                return result.data[0]["id"]
            return None
        except Exception as e:
            logger.error(f"Error saving page {page_data['url']}: {e}")
            return None

    async def _send_progress(self):
        elapsed = time.time() - self.start_time
        speed = self.pages_crawled / elapsed if elapsed > 0 else 0
        current_url = self.queue[0] if self.queue else None

        progress = {
            "job_id": self.job_id,
            "pages_crawled": self.pages_crawled,
            "total_pages": self.total_discovered,
            "current_url": current_url,
            "speed": round(speed, 2),
            "status": "running" if not self.is_stopped else "stopped",
        }

        await update_job_progress(self.job_id, progress)
        if self.on_progress:
            await self.on_progress(progress)

    async def run(self) -> dict:
        """Main crawl loop."""
        await self._load_robots()
        logger.info(f"Starting crawl of {self.start_url} (job: {self.job_id})")

        try:
            while self.queue and not self.is_stopped:
                if self.max_pages and self.pages_crawled >= self.max_pages:
                    logger.info(f"Reached max pages limit ({self.max_pages})")
                    break

                url = self.queue.pop(0)

                if url in self.visited:
                    continue
                if not self._can_fetch(url):
                    logger.debug(f"Robots.txt disallows: {url}")
                    continue

                self.visited.add(url)

                page_data = await self._crawl_page(url)
                if page_data:
                    page_id = await self._save_page(page_data)
                    self.pages_crawled += 1

                    # Process images and PDFs in background
                    if page_id and self.openai_api_key:
                        asyncio.create_task(
                            self._process_media(page_id, page_data["images"], page_data["pdfs"])
                        )
                        asyncio.create_task(
                            generate_and_store_embeddings(
                                page_id=page_id,
                                user_id=self.user_id,
                                domain_id=self.domain_id,
                                content=page_data["content"],
                                openai_api_key=self.openai_api_key,
                            )
                        )

                    # Add new links to queue
                    new_links = [l for l in page_data["links"] if l not in self.visited]
                    self.queue.extend(new_links)
                    self.total_discovered += len(new_links)

                    await increment_pages_crawled(self.user_id, 1)

                await self._send_progress()
                await asyncio.sleep(self.delay)

        except asyncio.CancelledError:
            logger.info(f"Crawl cancelled: {self.job_id}")
            self.is_stopped = True

        # Update domain stats
        try:
            supabase = await get_supabase_client_for_user(self.user_id)
            supabase.table("domains").update({
                "pages_crawled": self.pages_crawled,
                "last_crawl_at": "now()",
                "status": "idle",
            }).eq("id", self.domain_id).execute()
        except Exception as e:
            logger.error(f"Error updating domain stats: {e}")

        result = {
            "job_id": self.job_id,
            "pages_crawled": self.pages_crawled,
            "total_discovered": self.total_discovered,
            "status": "completed" if not self.is_stopped else "stopped",
        }
        logger.info(f"Crawl finished: {result}")
        return result

    async def _process_media(self, page_id: str, images: List[str], pdfs: List[str]):
        """Process images and PDFs for a page."""
        for img_url in images[:10]:  # limit to 10 images per page
            try:
                await process_image(
                    image_url=img_url,
                    page_id=page_id,
                    user_id=self.user_id,
                    openai_api_key=self.openai_api_key,
                )
            except Exception as e:
                logger.warning(f"Image processing failed {img_url}: {e}")

        for pdf_url in pdfs[:5]:  # limit to 5 PDFs per page
            try:
                await self._process_pdf(pdf_url, page_id)
            except Exception as e:
                logger.warning(f"PDF processing failed {pdf_url}: {e}")

    async def _process_pdf(self, pdf_url: str, page_id: str):
        """Download and extract text from PDF."""
        import PyPDF2
        import io
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(pdf_url)
                if resp.status_code != 200:
                    return

                pdf_bytes = io.BytesIO(resp.content)
                reader = PyPDF2.PdfReader(pdf_bytes)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() or ""

                supabase = await get_supabase_client_for_user(self.user_id)
                supabase.table("page_pdfs").insert({
                    "page_id": page_id,
                    "user_id": self.user_id,
                    "url": pdf_url,
                    "extracted_text": text[:50000],  # limit
                }).execute()
        except Exception as e:
            logger.warning(f"PDF extraction failed: {e}")

    def stop(self):
        self.is_stopped = True
