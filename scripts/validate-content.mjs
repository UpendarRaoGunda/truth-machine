import assert from "node:assert/strict";
import { CLAIMS } from "../lib/claims.mjs";

const allowedConfidence = new Set(["Low", "Medium", "High", "Very high", "Extremely high"]);
const ids = new Set();

assert.ok(CLAIMS.length >= 5, "At least five reviewed demonstration claims are required.");

for (const item of CLAIMS) {
  assert.match(item.id, /^[a-z0-9-]+$/, `Invalid claim id: ${item.id}`);
  assert.ok(!ids.has(item.id), `Duplicate claim id: ${item.id}`);
  ids.add(item.id);

  for (const field of ["claim", "domain", "verdict", "confidence", "freshness", "lastReviewed", "summary", "change"]) {
    assert.ok(typeof item[field] === "string" && item[field].trim(), `${item.id} is missing ${field}`);
  }

  assert.ok(allowedConfidence.has(item.confidence), `${item.id} uses an unsupported confidence label.`);
  assert.match(item.lastReviewed, /^\d{4}-\d{2}-\d{2}$/, `${item.id} has an invalid review date.`);
  assert.ok(Array.isArray(item.know) && item.know.length, `${item.id} needs known evidence statements.`);
  assert.ok(Array.isArray(item.unknown) && item.unknown.length, `${item.id} needs uncertainty statements.`);
  assert.ok(Array.isArray(item.supporting), `${item.id} supporting evidence must be an array.`);
  assert.ok(Array.isArray(item.contradicting), `${item.id} contradicting evidence must be an array.`);

  for (const source of [...item.supporting, ...item.contradicting]) {
    for (const field of ["title", "publisher", "type", "date", "url", "note"]) {
      assert.ok(source[field], `${item.id} has an incomplete source (${field}).`);
    }
    assert.doesNotThrow(() => new URL(source.url), `${item.id} has an invalid source URL.`);
  }
}

console.log(`Validated ${CLAIMS.length} structured claim reviews.`);
