#!/bin/bash
# ═══════════════════════════════════════════════
#  WebCrawler — Management Script
#  Usage: bash manage.sh [command]
# ═══════════════════════════════════════════════

COMPOSE="docker compose"
command -v docker-compose >/dev/null 2>&1 && COMPOSE="docker-compose"

case "${1:-help}" in

  start)
    echo "Starting webcrawler services..."
    $COMPOSE up -d
    ;;

  stop)
    echo "Stopping webcrawler services (n8n untouched)..."
    $COMPOSE down
    ;;

  restart)
    echo "Restarting services..."
    $COMPOSE restart
    ;;

  logs)
    SERVICE=${2:-}
    $COMPOSE logs -f --tail=100 $SERVICE
    ;;

  status)
    $COMPOSE ps
    ;;

  update)
    echo "Pulling latest code and rebuilding..."
    git pull
    $COMPOSE build
    $COMPOSE up -d
    ;;

  backup)
    echo "Backing up Redis data..."
    DATE=$(date +%Y%m%d_%H%M%S)
    docker exec crawler_redis redis-cli BGSAVE
    docker cp crawler_redis:/data/dump.rdb ./backups/redis_${DATE}.rdb
    echo "Redis backup saved to ./backups/redis_${DATE}.rdb"
    ;;

  scale)
    WORKERS=${2:-2}
    echo "Scaling crawler workers to ${WORKERS}..."
    $COMPOSE up -d --scale crawler_worker=$WORKERS
    ;;

  shell)
    SERVICE=${2:-crawler_api}
    docker exec -it $SERVICE bash
    ;;

  *)
    echo ""
    echo "  WebCrawler Management"
    echo "  Usage: bash manage.sh [command]"
    echo ""
    echo "  Commands:"
    echo "    start              Start all services"
    echo "    stop               Stop all services (n8n untouched)"
    echo "    restart            Restart all services"
    echo "    logs [service]     Tail logs (optional: crawler_api, crawler_worker, ...)"
    echo "    status             Show running containers"
    echo "    update             Pull latest + rebuild"
    echo "    backup             Backup Redis data"
    echo "    scale [N]          Scale crawler workers to N (default: 2)"
    echo "    shell [service]    Open shell in container"
    echo ""
    ;;
esac
