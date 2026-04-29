// src/hooks/useCrawlProgress.ts
"use client";
import { useEffect, useRef, useState } from "react";
import { CrawlWebSocket } from "@/lib/websocket";
import type { WSProgress } from "@/types";

export function useCrawlProgress(jobId: string | null) {
  const [progress, setProgress] = useState<WSProgress | null>(null);
  const [done, setDone] = useState(false);
  const wsRef = useRef<CrawlWebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setDone(false);
    setProgress(null);

    const ws = new CrawlWebSocket(
      jobId,
      (data) => setProgress(data),
      () => setDone(true)
    );
    ws.connect();
    wsRef.current = ws;

    return () => ws.disconnect();
  }, [jobId]);

  return { progress, done };
}
