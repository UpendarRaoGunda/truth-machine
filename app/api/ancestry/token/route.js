import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const MAX_BYTES = 250 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED = [
  ".vcf",
  ".vcf.gz",
  ".txt",
  ".csv",
  ".bed",
  ".bim",
  ".fam",
  ".pgen",
  ".pvar",
  ".psam",
];

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function allowedName(name) {
  const lower = String(name || "").toLowerCase();
  return ALLOWED.some((extension) => lower.endsWith(extension));
}

export async function POST(request) {
  const secret = process.env.ANCESTRY_UPLOAD_SECRET;
  const apiUrl = process.env.NEXT_PUBLIC_ANCESTRY_API_URL || process.env.ANCESTRY_ENGINE_URL;
  if (!secret || !apiUrl) {
    return Response.json({ error: "The secure ancestry engine is not configured." }, { status: 503 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const files = Array.isArray(input.files) ? input.files : [];
  if (!files.length || files.length > MAX_FILES) {
    return Response.json({ error: `Choose between 1 and ${MAX_FILES} files.` }, { status: 400 });
  }

  let totalBytes = 0;
  for (const file of files) {
    const size = Number(file?.size || 0);
    if (!allowedName(file?.name) || size <= 0 || size > MAX_BYTES) {
      return Response.json({ error: "One or more files are unsupported, empty or too large." }, { status: 400 });
    }
    totalBytes += size;
  }
  if (totalBytes > MAX_BYTES) {
    return Response.json({ error: "The selected bundle exceeds the 250 MB direct-upload limit." }, { status: 400 });
  }

  const consent = input.consent || {};
  const birthYear = Number(input.birthYear || 0);
  const currentYear = new Date().getUTCFullYear();
  const isMinor = birthYear >= 1900 && birthYear > currentYear - 18;
  if (!consent.permission || !consent.probabilistic || !consent.processing || (isMinor && !consent.guardian)) {
    return Response.json({ error: "All applicable consent statements are required." }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: "truth-machine-ancestry-upload",
    iat: now,
    exp: now + 10 * 60,
    nonce: crypto.randomUUID(),
    maxBytes: totalBytes,
    maxFiles: files.length,
  };
  const encoded = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");

  return Response.json({ token: `${encoded}.${signature}`, expiresInSeconds: 600 });
}
