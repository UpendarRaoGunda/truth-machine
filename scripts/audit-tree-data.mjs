import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../lib/data/tree-of-life.json", import.meta.url), "utf8"));
assert.ok(Array.isArray(data) && data.length > 100, "Tree data is missing or unexpectedly small.");

const byId = new Map();
for (const node of data) {
  assert.ok(node.id && node.name, "Every tree node needs an id and name.");
  assert.ok(!byId.has(node.id), `Duplicate tree node id: ${node.id}`);
  byId.set(node.id, node);
}

const roots = data.filter((node) => !node.parentId);
assert.equal(roots.length, 1, `Expected one tree root, found ${roots.length}.`);

for (const node of data) {
  if (node.parentId) assert.ok(byId.has(node.parentId), `Missing parent ${node.parentId} for ${node.name}.`);
  if (node.thumbnail?.url) {
    const url = new URL(node.thumbnail.url);
    assert.equal(url.protocol, "https:", `Non-HTTPS image for ${node.name}.`);
    assert.equal(url.hostname, "upload.wikimedia.org", `Unexpected image host for ${node.name}.`);
  }
}

const homo = data.find((node) => node.name === "Homo sapiens");
if (homo) assert.equal(homo.extinct, false, "Homo sapiens must not be marked extinct.");

console.log(`Audited ${data.length} tree nodes and ${roots.length} root.`);
