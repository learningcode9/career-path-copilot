"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("@azure/functions");
const storage_blob_1 = require("@azure/storage-blob");
const crypto_1 = require("crypto");
const HANDLER_VERSION = "storage-v1";
function getBlobServiceClient(ctx) {
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING ||
        process.env.AzureWebJobsStorage;
    if (conn) {
        ctx.log("[submit]", HANDLER_VERSION, "Using connection string.");
        return storage_blob_1.BlobServiceClient.fromConnectionString(conn);
    }
    const accountUrl = process.env.STORAGE_ACCOUNT_URL; // e.g. https://<acct>.blob.core.windows.net
    if (!accountUrl) {
        throw new Error("No storage configuration found. Set AzureWebJobsStorage or AZURE_STORAGE_CONNECTION_STRING or STORAGE_ACCOUNT_URL.");
    }
    ctx.log("[submit]", HANDLER_VERSION, "Using account URL.");
    return new storage_blob_1.BlobServiceClient(accountUrl);
}
async function ensureContainer(client, name) {
    const container = client.getContainerClient(name);
    await container.createIfNotExists();
    return container;
}
functions_1.app.http("submit", {
    methods: ["GET", "POST"],
    route: "submit",
    authLevel: "anonymous",
    handler: async (req, ctx) => {
        try {
            // quick GET for smoke test
            if (req.method === "GET") {
                return { status: 200, jsonBody: { status: "ok", version: HANDLER_VERSION } };
            }
            const contentType = req.headers.get("content-type") || "";
            let jobDescription = "";
            let resumeText = "";
            if (contentType.includes("application/json")) {
                const body = (await req.json());
                jobDescription = body.job_description ?? "";
                resumeText = body.resume_text ?? "";
            }
            else if (contentType.includes("multipart/form-data")) {
                const form = await req.formData();
                jobDescription = form.get("job_description")?.toString() || "";
                resumeText = form.get("resume_text")?.toString() || "";
            }
            if (!jobDescription || !resumeText) {
                return { status: 400, jsonBody: { error: "JD and Resume are required", version: HANDLER_VERSION } };
            }
            const request_id = (0, crypto_1.randomUUID)();
            const nowIso = new Date().toISOString();
            const blobSvc = getBlobServiceClient(ctx);
            const landing = await ensureContainer(blobSvc, "landing");
            const jdBlobPath = `jd/${request_id}.json`;
            const profileBlobPath = `profile/${request_id}.json`;
            const jdPayload = JSON.stringify({ request_id, received_at: nowIso, job_description: jobDescription }, null, 2);
            const profilePayload = JSON.stringify({ request_id, received_at: nowIso, resume_text: resumeText }, null, 2);
            await landing.getBlockBlobClient(jdBlobPath).upload(jdPayload, Buffer.byteLength(jdPayload), { blobHTTPHeaders: { blobContentType: "application/json" } });
            await landing.getBlockBlobClient(profileBlobPath).upload(profilePayload, Buffer.byteLength(profilePayload), { blobHTTPHeaders: { blobContentType: "application/json" } });
            return {
                status: 201,
                jsonBody: {
                    status: "saved",
                    version: HANDLER_VERSION,
                    request_id,
                    jd_blob: `landing/${jdBlobPath}`,
                    profile_blob: `landing/${profileBlobPath}`
                }
            };
        }
        catch (err) {
            ctx.error("Error in submit handler:", err);
            return { status: 500, jsonBody: { error: err.message, version: HANDLER_VERSION } };
        }
    }
});
