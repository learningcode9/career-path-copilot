"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
// Simple health check
functions_1.app.http("ping", {
    route: "ping",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (_req, _ctx) => {
        return { status: 200, jsonBody: { ok: true } };
    }
});
// Your submit endpoint (trimmed)
functions_1.app.http("submit", {
    route: "submit",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (req, ctx) => {
        // TODO: parse form-data / text and push to storage/queue
        return { status: 202, jsonBody: { status: "accepted" } };
    }
});
