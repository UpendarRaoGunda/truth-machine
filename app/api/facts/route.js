import {
  CONTRADICTIONS,
  FACTS,
  INSIGHTS,
  LADDER,
  SCIENTIST_QUOTES,
} from "../../../lib/content";

export const dynamic = "force-dynamic";

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "fact";

  switch (type) {
    case "insight":
      return Response.json({ item: randomItem(INSIGHTS) }, noStore());
    case "contradiction":
      return Response.json({ item: randomItem(CONTRADICTIONS) }, noStore());
    case "timeline":
      return Response.json({ item: LADDER }, noStore());
    case "scientist":
      return Response.json({ item: randomItem(SCIENTIST_QUOTES) }, noStore());
    case "fact":
    default:
      return Response.json({ item: randomItem(FACTS) }, noStore());
  }
}

function noStore() {
  return { headers: { "Cache-Control": "no-store" } };
}
