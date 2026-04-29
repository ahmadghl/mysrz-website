FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl wget gnupg gcc g++ \
    libxml2-dev libxslt1-dev zlib1g-dev \
    libffi-dev libssl-dev \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 libx11-6 libx11-xcb1 \
    libxcb1 libxext6 libxfixes3 libxi6 libxrender1 \
    libxtst6 libglib2.0-0 libnss3 libxss1 \
    fonts-liberation fonts-unifont \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN playwright install chromium

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--proxy-headers", "--forwarded-allow-ips=*"]
