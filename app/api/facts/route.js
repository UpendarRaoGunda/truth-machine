import { FACTS, METAPHORS, OXYMORONS, LADDER } from "../../../lib/content";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "fact";

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  switch (type) {
    case "metaphor":
      return Response.json({ item: rand(METAPHORS) }, noStore());
    case "oxymoron":
      return Response.json({ item: rand(OXYMORONS) }, noStore());
    case "ladder":
      return Response.json({ item: LADDER }, noStore());
    case "fact":
    default:
      return Response.json({ item: rand(FACTS) }, noStore());
  }
}

function noStore() {
  return { headers: { "Cache-Control": "no-store" } };
}
