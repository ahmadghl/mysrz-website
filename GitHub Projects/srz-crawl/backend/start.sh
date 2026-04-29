#!/bin/bash
# /opt/srz-crawl/start.sh

set -e

cd /opt/srz-crawl

# Activate virtualenv
source venv/bin/activate

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Install/update dependencies
pip install -r requirements.txt --quiet

# Create log directory
mkdir -p logs

echo "Starting SRZ Crawl backend on port ${PORT:-3001}..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port ${PORT:-3001} \
  --workers 1 \
  --log-level info \
  --access-log
