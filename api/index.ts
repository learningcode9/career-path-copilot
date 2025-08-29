import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Simple health check
app.http("ping", {
  route: "ping",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (_req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> => {
    return { status: 200, jsonBody: { ok: true } };
  }
});

// Your submit endpoint (trimmed)
app.http("submit", {
  route: "submit",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    // TODO: parse form-data / text and push to storage/queue
    return { status: 202, jsonBody: { status: "accepted" } };
  }
});
