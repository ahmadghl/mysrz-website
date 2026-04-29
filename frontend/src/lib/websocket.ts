// src/lib/websocket.ts
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

export type ProgressCallback = (data: any) => void;

export class CrawlWebSocket {
  private ws: WebSocket | null = null;
  private jobId: string;
  private onProgress: ProgressCallback;
  private onDone?: () => void;
  private reconnectAttempts = 0;
  private maxReconnects = 5;

  constructor(jobId: string, onProgress: ProgressCallback, onDone?: () => void) {
    this.jobId = jobId;
    this.onProgress = onProgress;
    this.onDone = onDone;
  }

  connect() {
    try {
      this.ws = new WebSocket(`${WS_URL}/ws/crawl/${this.jobId}`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onProgress(data);
          if (["completed", "stopped", "failed"].includes(data.status)) {
            this.onDone?.();
            this.disconnect();
          }
        } catch {}
      };

      this.ws.onerror = () => {
        if (this.reconnectAttempts < this.maxReconnects) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };

      this.ws.onclose = () => {};
    } catch (e) {
      console.error("WebSocket connect error:", e);
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
