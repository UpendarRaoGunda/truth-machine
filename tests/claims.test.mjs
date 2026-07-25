import test from "node:test";
import assert from "node:assert/strict";
import {
  CLAIMS,
  classifyClaim,
  findBestClaim,
  getClaimById,
  splitAtomicClaims,
  toClaimReview,
} from "../lib/claims.mjs";

test("reviewed examples are retrievable", () => {
  assert.equal(findBestClaim("Do vaccines cause autism?")?.id, "vaccines-autism");
  assert.equal(findBestClaim("is the earth flat")?.id, "earth-flat");
  assert.equal(findBestClaim("whales have pelvic bones")?.id, "whale-pelvis");
});

test("unknown claims do not receive an invented match", () => {
  assert.equal(findBestClaim("A newly announced local policy starts next Tuesday"), null);
});

test("messages can be separated into atomic claims", () => {
  const parts = splitAtomicClaims("Earth is flat and vaccines cause autism.");
  assert.equal(parts.length, 2);
});

test("classification separates opinion from factual claims", () => {
  assert.equal(classifyClaim("I think this is the best painting"), "Opinion or value judgement");
  assert.equal(classifyClaim("Earth is flat"), "Factual and checkable");
});

test("claim review JSON-LD contains required fields", () => {
  const item = getClaimById(CLAIMS[0].id);
  const schema = toClaimReview(item, `https://example.com/claims/${item.id}`);
  assert.equal(schema["@type"], "ClaimReview");
  assert.equal(schema.claimReviewed, item.claim);
  assert.equal(schema.reviewRating.alternateName, item.verdict);
});
