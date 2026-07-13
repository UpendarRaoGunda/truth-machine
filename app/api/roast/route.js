import { ROASTS } from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  let pool = ROASTS;
  if (tag && tag !== "all") {
    pool = ROASTS.filter((r) => r.tag === tag);
    if (pool.length === 0) pool = ROASTS;
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];

  return Response.json(
    { roast: pick, tags: [...new Set(ROASTS.map((r) => r.tag))] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
