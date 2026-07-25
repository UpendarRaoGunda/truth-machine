export const dynamic = "force-dynamic";

function publicApiUrl() {
  const value = process.env.NEXT_PUBLIC_ANCESTRY_API_URL || process.env.ANCESTRY_ENGINE_URL || "";
  return value.replace(/\/$/, "");
}

export async function GET() {
  const apiUrl = publicApiUrl();
  const configured = Boolean(apiUrl && process.env.ANCESTRY_UPLOAD_SECRET);
  return Response.json({
    configured,
    apiUrl: configured ? apiUrl : null,
    acceptedFormats: [
      "VCF",
      "VCF.GZ",
      "23andMe-style raw genotype text",
      "AncestryDNA-style raw genotype text",
      "MyHeritage-style raw genotype text",
      "PLINK BED/BIM/FAM",
      "PLINK PGEN/PVAR/PSAM",
    ],
    maxDirectUploadBytes: 250 * 1024 * 1024,
    retentionHours: Number(process.env.ANCESTRY_RESULT_TTL_HOURS || 24),
    privacy: {
      directToEngine: true,
      encryptedAtRest: true,
      rawDeletedAfterAnalysis: true,
      noModelTraining: true,
      noAdvertisingOrAnalytics: true,
    },
  });
}
