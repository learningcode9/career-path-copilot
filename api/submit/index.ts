import type { AzureFunction, Context, HttpRequest } from "@azure/functions";
import Busboy from "busboy";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const accountUrl = process.env.AZURE_STORAGE_ACCOUNT_URL!;
const landingContainer = process.env.LANDING_CONTAINER || "landing";

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    context.res = { status: 400, body: { status: "error", message: "Expected multipart/form-data" } };
    return;
  }

  const fields: Record<string, any> = {};
  let uploadedFile: { filename: string; buffer: Buffer } | null = null;

  await new Promise<void>((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers as any });
    let chunks: Buffer[] = [];

    busboy.on("file", (_name, file, info) => {
      const { filename } = info;
      chunks = [];
      file.on("data", (d: Buffer) => chunks.push(d));
      file.on("end", () => { uploadedFile = { filename, buffer: Buffer.concat(chunks) }; });
    });

    busboy.on("field", (name, val) => { fields[name] = val; });
    busboy.on("error", reject);
    busboy.on("finish", resolve);
    busboy.end(req.body);
  });

  const request_id = fields["request_id"];
  const jd_text = fields["jd_text"];
  const resume_text = fields["resume_text"];

  if (!request_id || !jd_text || (!resume_text && !uploadedFile)) {
    context.res = { status: 400, body: { status: "error", message: "Missing required data." } };
    return;
  }

  // connect to storage with Managed Identity
  const credential = new DefaultAzureCredential();
  const blobService = new BlobServiceClient(accountUrl, credential);
  const container = blobService.getContainerClient(landingContainer);

  // 1) Save JD JSON
  const jdPayload = JSON.stringify({ request_id, jd_text }, null, 2);
  await container.getBlockBlobClient(`jd/${request_id}.json`)
    .upload(Buffer.from(jdPayload), Buffer.byteLength(jdPayload), { overwrite: true });

  // 2) Save resume text
  if (resume_text) {
    await container.getBlockBlobClient(`profile/${request_id}.txt`)
      .upload(Buffer.from(resume_text), Buffer.byteLength(resume_text), { overwrite: true });
  }

  // 3) Save resume file
  if (uploadedFile) {
    const safeName = uploadedFile.filename?.replace(/[^\w.\-]/g, "_") || "resume.bin";
    await container.getBlockBlobClient(`profile/${request_id}_${safeName}`)
      .upload(uploadedFile.buffer, uploadedFile.buffer.length, { overwrite: true });
  }

  context.res = { status: 200, body: { request_id, status: "accepted" } };
};

export default httpTrigger;
