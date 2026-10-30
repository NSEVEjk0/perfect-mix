import { analyze } from "@/lib/engine";
import { validateInput } from "@/lib/planner";
import type { TraceStep } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
const recent = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const times = (recent.get(ip) ?? []).filter((t) => Date.now() - t < 60_000);
  if (times.length >= 5)
    return Response.json(
      { error: "Please wait a minute before starting another analysis." },
      { status: 429 },
    );
  if (recent.size > 2000) recent.clear();
  recent.set(ip, [...times, Date.now()]);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 5000) throw new Error("The research brief is too long.");
    input = validateInput(JSON.parse(raw));
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Invalid research brief." },
      { status: 400 },
    );
  }
  if (!process.env.QLOO_KEY)
    return Response.json(
      { error: "Live Qloo is not configured on the server." },
      { status: 503 },
    );
  if (!request.headers.get("accept")?.includes("text/event-stream")) {
    try {
      return Response.json(await analyze(input, () => {}));
    } catch (e) {
      return Response.json(
        {
          error:
            e instanceof Error ? e.message : "Research could not be completed.",
        },
        { status: 502 },
      );
    }
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          /* Client disconnected. */
        }
      };
      try {
        send(
          "report",
          await analyze(input, (step: TraceStep) => send("step", step)),
        );
      } catch (e) {
        send("error", {
          error:
            e instanceof Error
              ? e.message
              : "The research could not be completed. Please try again.",
        });
      } finally {
        try {
          controller.close();
        } catch {
          /* Already closed. */
        }
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
