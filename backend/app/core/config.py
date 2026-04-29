from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    APP_NAME: str = "WebCrawler"
    APP_ENV: str = "production"
    SECRET_KEY: str = "change-me"
    DEBUG: bool = False

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3001"]

    REDIS_URL: str = "redis://localhost:6379/0"

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    MAX_CONCURRENT_CRAWLS: int = 5
    DEFAULT_CRAWL_DELAY: float = 1.0
    MAX_PAGES_PER_DOMAIN: int = 10000
    REQUEST_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    USER_AGENT: str = "WebCrawlerBot/1.0"

    PLAYWRIGHT_HEADLESS: bool = True
    PLAYWRIGHT_TIMEOUT: int = 30000

    OPENAI_API_KEY: str = ""
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = 'ignore'
        extra = "ignore"

    def model_post_init(self, __context):
        # Allow CORS_ORIGINS as JSON string in env
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = json.loads(self.CORS_ORIGINS)


settings = Settings()

# These lines appended by feature update
