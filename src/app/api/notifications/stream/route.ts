import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { subscribeRestaurantEvents } from "@/lib/events";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: connected
data: ${JSON.stringify({ ok: true })}

`)
      );

      unsubscribe = subscribeRestaurantEvents(session.restaurantId, (event) => {
        controller.enqueue(
          encoder.encode(`event: update
data: ${JSON.stringify(event)}

`)
        );
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping

`));
      }, 25000);

      request.signal.addEventListener("abort", () => {
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
        controller.close();
      });
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
