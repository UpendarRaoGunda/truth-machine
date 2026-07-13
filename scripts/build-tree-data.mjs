// Build-time data pipeline for the "Explore" tree-of-life mode.
// Run manually with: npm run build:tree-data
//
// Sources (both public, no API key required):
//  - Open Tree of Life API (https://opentreeoflife.org) for real phylogenetic
//    parent/child structure. We resolve a curated allowlist of taxa, then pull
//    each one's full ancestor lineage and union the lineages into one tree.
//  - Wikipedia REST summary API for a short factual description + thumbnail
//    image per taxon, with attribution linking back to the source page.
//
// Output: lib/data/tree-of-life.json (checked into the repo — no runtime
// fetches, no API keys, nothing this project depends on at request time).

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "lib", "data", "tree-of-life.json");

const OTOL_BASE = "https://api.opentreeoflife.org/v3";
const WIKI_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary";
const USER_AGENT = "TruthMachineTreeBuilder/1.0 (https://github.com/UpendarRaoGunda/truth-machine)";

// Curated allowlist: mostly leaf species/genera plus a few domain/kingdom
// anchors. Real ancestor structure (phyla, classes, orders, families...)
// comes automatically from each taxon's OToL lineage, so we don't hand-wire
// intermediate ranks ourselves.
const TARGET_TAXA = [
  "Bacteria", "Archaea", "Eukaryota",
  "Escherichia coli", "Cyanobacteria",
  "Sulfolobus acidocaldarius",
  "Amoeba proteus", "Dictyostelium discoideum", "Plasmodium falciparum", "Macrocystis pyrifera", "Euglena gracilis",
  "Saccharomyces cerevisiae", "Amanita muscaria", "Armillaria ostoyae",
  "Chlamydomonas reinhardtii", "Selaginella moellendorffii", "Equisetum arvense", "Ginkgo biloba", "Pinus sylvestris", "Welwitschia mirabilis", "Amborella trichopoda", "Zea mays", "Quercus robur", "Helianthus annuus", "Carnegiea gigantea", "Dionaea muscipula",
  "Euplectella aspergillum", "Aurelia aurita", "Acropora millepora", "Mnemiopsis leidyi", "Trichoplax adhaerens", "Nematostella vectensis",
  "Apis mellifera", "Danaus plexippus", "Formica rufa", "Drosophila melanogaster", "Latrodectus mactans", "Homarus americanus", "Caenorhabditis elegans", "Hypsibius exemplaris",
  "Octopus vulgaris", "Loligo vulgaris", "Cepaea nemoralis", "Nautilus pompilius", "Lumbricus terrestris", "Schmidtea mediterranea",
  "Asterias rubens", "Strongylocentrotus purpuratus",
  "Branchiostoma lanceolatum", "Ciona intestinalis", "Petromyzon marinus", "Myxine glutinosa",
  "Carcharodon carcharias", "Danio rerio",
  "Latimeria chalumnae", "Neoceratodus forsteri",
  "Ambystoma mexicanum", "Rana temporaria",
  "Chelonia mydas", "Varanus komodoensis", "Sphenodon punctatus", "Crocodylus niloticus",
  "Tyrannosaurus rex", "Triceratops horridus", "Archaeopteryx lithographica",
  "Struthio camelus", "Aptenodytes forsteri", "Aquila chrysaetos",
  "Ornithorhynchus anatinus", "Macropus rufus", "Vombatus ursinus",
  "Loxodonta africana", "Bradypus variegatus", "Pteropus vampyrus",
  "Panthera leo", "Canis lupus",
  "Balaenoptera musculus", "Orcinus orca",
  "Giraffa camelopardalis", "Equus ferus", "Bos taurus", "Hippopotamus amphibius",
  "Mus musculus", "Oryctolagus cuniculus",
  "Lemur catta", "Ateles geoffroyi", "Macaca mulatta",
  "Hylobates lar", "Pongo pygmaeus", "Gorilla gorilla", "Pan troglodytes",
  "Homo sapiens", "Homo neanderthalensis", "Australopithecus afarensis",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function otolPost(pathname, body) {
  const res = await fetch(`${OTOL_BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OToL ${pathname} -> HTTP ${res.status}`);
  return res.json();
}

async function resolveOttIds(names) {
  const resolved = new Map();
  const unresolved = [];
  const batchSize = 25;
  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const data = await otolPost("/tnrs/match_names", { names: batch, do_approximate_matching: true });
    data.results.forEach((result) => {
      const match = result.matches?.[0];
      if (match?.taxon?.ott_id) {
        resolved.set(result.name, match.taxon);
      } else {
        unresolved.push(result.name);
      }
    });
    await sleep(150);
  }
  return { resolved, unresolved };
}

async function fetchLineage(ottId) {
  return otolPost("/taxonomy/taxon_info", { ott_id: ottId, include_lineage: true });
}

// Open Tree of Life's taxonomy carries a few known-erroneous "extinct" flags
// on unambiguously living species (e.g. Homo sapiens) — likely inherited from
// how they merge fossil and modern taxonomic sources. Correct those here
// rather than shipping a living species with an extinct/fossil treatment.
const EXTINCT_OVERRIDES = new Map([
  ["Homo sapiens", false],
  ["Schmidtea mediterranea", false],
]);

function toNode(taxon) {
  const extinct = EXTINCT_OVERRIDES.has(taxon.name)
    ? EXTINCT_OVERRIDES.get(taxon.name)
    : Boolean(taxon.flags?.includes("extinct"));
  return {
    id: String(taxon.ott_id),
    parentId: null,
    name: taxon.name,
    rank: taxon.rank || "unranked",
    extinct,
  };
}

async function fetchWikiSummary(name, attempt = 0) {
  const title = encodeURIComponent(name.replace(/ /g, "_"));
  try {
    const res = await fetch(`${WIKI_SUMMARY_BASE}/${title}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    return {
      displayName: data.title || name,
      extract: data.extract ? data.extract.slice(0, 260) : null,
      thumbnail: data.thumbnail ? { url: data.thumbnail.source, width: data.thumbnail.width, height: data.thumbnail.height } : null,
      pageUrl: data.content_urls?.desktop?.page || null,
    };
  } catch (error) {
    if (attempt < 2) {
      await sleep(400 * (attempt + 1));
      return fetchWikiSummary(name, attempt + 1);
    }
    throw error;
  }
}

const KEEP_RANKS = new Set(["domain", "kingdom", "phylum", "class", "order"]);

// Collapse non-target, non-keep-rank nodes that have exactly one child —
// removes cryptic single-lineage OToL clade labels (e.g. "h2007-1", "SAR")
// while preserving every real branch point and every recognizable rank.
function pruneSingleChildChains(nodeMap) {
  let changed = true;
  while (changed) {
    changed = false;
    const childrenByParent = new Map();
    nodeMap.forEach((node) => {
      if (!node.parentId) return;
      if (!childrenByParent.has(node.parentId)) childrenByParent.set(node.parentId, []);
      childrenByParent.get(node.parentId).push(node.id);
    });

    for (const node of [...nodeMap.values()]) {
      if (node.isLeafTarget || node.id === "root") continue;
      if (KEEP_RANKS.has(node.rank)) continue;
      const kids = childrenByParent.get(node.id) || [];
      if (kids.length === 1) {
        const child = nodeMap.get(kids[0]);
        if (child) {
          child.parentId = node.parentId;
          nodeMap.delete(node.id);
          changed = true;
        }
      }
    }
  }
}

async function main() {
  console.log(`Resolving ${TARGET_TAXA.length} target taxa via Open Tree of Life...`);
  const { resolved, unresolved } = await resolveOttIds(TARGET_TAXA);
  console.log(`  resolved: ${resolved.size}, unresolved: ${unresolved.length}`);
  if (unresolved.length) console.log("  unresolved names:", unresolved.join(", "));

  const nodeMap = new Map();
  const targetOttIds = new Set([...resolved.values()].map((t) => t.ott_id));

  console.log("Fetching ancestor lineages...");
  await pool([...resolved.values()], 6, async (taxon) => {
    try {
      const info = await fetchLineage(taxon.ott_id);
      const selfNode = toNode(info);
      const lineage = info.lineage || [];
      selfNode.parentId = lineage[0] ? String(lineage[0].ott_id) : null;
      selfNode.isLeafTarget = true;
      nodeMap.set(selfNode.id, selfNode);

      lineage.forEach((ancestor, index) => {
        const node = toNode(ancestor);
        node.parentId = lineage[index + 1] ? String(lineage[index + 1].ott_id) : null;
        if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
      });
    } catch (error) {
      console.log(`  failed lineage for ${taxon.name} (${taxon.ott_id}): ${error.message}`);
    }
    await sleep(80);
  });

  // Collapse dangling roots (nodes whose parent isn't in the map) into one shared root.
  const dangling = [...nodeMap.values()].filter((n) => n.parentId && !nodeMap.has(n.parentId));
  dangling.forEach((n) => { n.parentId = null; });
  const rootless = [...nodeMap.values()].filter((n) => !n.parentId);
  if (rootless.length > 1) {
    nodeMap.set("root", { id: "root", parentId: null, name: "Life", rank: "root", extinct: false });
    rootless.forEach((n) => { n.parentId = "root"; });
  }

  console.log(`Tree assembled (pre-prune): ${nodeMap.size} nodes.`);
  pruneSingleChildChains(nodeMap);
  console.log(`Tree pruned to ${nodeMap.size} nodes (collapsed single-child pass-through clades).`);
  console.log("Fetching Wikipedia summaries + images...");

  const allNodes = [...nodeMap.values()];
  let withImages = 0;
  const noSummary = [];
  const errored = [];
  await pool(allNodes, 5, async (node) => {
    try {
      const summary = await fetchWikiSummary(node.name);
      if (summary) {
        node.commonName = summary.displayName !== node.name ? summary.displayName : null;
        node.summary = summary.extract;
        node.thumbnail = summary.thumbnail;
        node.attribution = summary.pageUrl ? { text: "Image via Wikipedia", url: summary.pageUrl } : null;
        if (summary.thumbnail) withImages += 1;
      } else {
        noSummary.push(node.name);
      }
    } catch (error) {
      errored.push(`${node.name} (${error.message})`);
    }
    await sleep(100);
  });

  console.log(`  nodes with images: ${withImages} / ${allNodes.length}`);
  if (noSummary.length) console.log(`  no Wikipedia page for ${noSummary.length} nodes: ${noSummary.slice(0, 25).join(", ")}${noSummary.length > 25 ? "…" : ""}`);
  if (errored.length) console.log(`  ERRORS (network/HTTP, not just missing pages) for ${errored.length} nodes: ${errored.join(", ")}`);

  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(allNodes, null, 2) + "\n", "utf8");
  console.log(`Wrote ${allNodes.length} nodes to ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
