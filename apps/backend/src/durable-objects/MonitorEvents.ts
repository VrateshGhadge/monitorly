import { DurableObject } from "cloudflare:workers";

type MonitorUpdate = {
  monitorId: string;
  status: "UP" | "DOWN";
  responseTime: number | null;
  statusCode: number | null;
  checkedAt: string;
};

type AlertUpdate = {
  id: string;
  monitor: string;
  type: "DOWN" | "RECOVERY";
  message: string;
  status: "SENT" | "RESOLVED";
  email: string;
  createdAt: string;
};

export class MonitorEvents extends DurableObject {
  private clients = new Set<WritableStreamDefaultWriter<Uint8Array>>();

  async fetch(request: Request): Promise<Response> {
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const writer = new WritableStream<Uint8Array>({
          write(chunk) {
            controller.enqueue(chunk);
          },
          close() {
            try {
              controller.close();
            } catch {}
          },
          abort() {
            try {
              controller.error();
            } catch {}
          },
        }).getWriter();

        this.clients.add(writer);

        controller.enqueue(
          encoder.encode(
            `event: connected\ndata: ${JSON.stringify({
              message: "SSE connection established",
            })}\n\n`,
          ),
        );

        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            clearInterval(heartbeat);
            this.clients.delete(writer);
          }
        }, 25_000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat);
          this.clients.delete(writer);
          try {
            controller.close();
          } catch {}
        });
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  async broadcastMonitorUpdate(update: MonitorUpdate): Promise<void> {
    const encoder = new TextEncoder();

    const message =
      `event: monitor.updated\n` + `data: ${JSON.stringify(update)}\n\n`;

    const encoded = encoder.encode(message);

    for (const writer of this.clients) {
      try {
        await writer.write(encoded);
      } catch {
        this.clients.delete(writer);
      }
    }
  }

  async broadcastAlertUpdate(update: AlertUpdate): Promise<void> {
    const encoder = new TextEncoder();

    const message =
      `event: alert.updated\n` + `data: ${JSON.stringify(update)}\n\n`;

    const encoded = encoder.encode(message);

    for (const writer of this.clients) {
      try {
        await writer.write(encoded);
      } catch {
        this.clients.delete(writer);
      }
    }
  }
}
