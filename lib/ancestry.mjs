export const ACCEPTED_GENOME_EXTENSIONS = [
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

export const MAX_BROWSER_FILE_BYTES = 250 * 1024 * 1024;

export const GENERIC_JOURNEY = [
  {
    id: "africa-70000",
    yearsAgo: 70000,
    label: "Deep African ancestry",
    region: "Africa",
    confidence: "Very high",
    scope: "Shared human history",
    description:
      "All living humans ultimately trace deep ancestry to populations in Africa. This is a species-level baseline, not a personalised location claim.",
    evidence: "Population genetics, fossils, archaeology and ancient DNA",
    x: 48,
    y: 58,
  },
  {
    id: "northeast-africa-65000",
    yearsAgo: 65000,
    label: "Northeast African and Arabian corridors",
    region: "Northeast Africa / Arabia",
    confidence: "High for broad dispersal; route details debated",
    scope: "Shared human history",
    description:
      "Some populations ancestral to most present-day non-Africans expanded through one or more corridors linking northeast Africa and Arabia.",
    evidence: "Genomic divergence estimates and archaeology",
    x: 55,
    y: 49,
  },
  {
    id: "southwest-asia-55000",
    yearsAgo: 55000,
    label: "Southwest Asian population hub",
    region: "Southwest Asia",
    confidence: "Moderate",
    scope: "Population-history model",
    description:
      "Southwest Asia was likely an important staging region before later population expansions across Eurasia. Exact boundaries and dates remain uncertain.",
    evidence: "Ancient genomes and demographic modelling",
    x: 61,
    y: 43,
  },
  {
    id: "eurasian-branching-50000",
    yearsAgo: 50000,
    label: "Eurasian branching and admixture",
    region: "Eurasia",
    confidence: "High for broad branching",
    scope: "Shared human history",
    description:
      "Ancestral populations diversified across Eurasia and interacted with archaic humans. Different descendants followed different routes.",
    evidence: "Modern and ancient genomes",
    x: 67,
    y: 38,
  },
  {
    id: "southern-route-45000",
    yearsAgo: 45000,
    label: "Southern and eastern dispersals",
    region: "South Asia, Southeast Asia and Sahul",
    confidence: "High for settlement; exact route timing varies",
    scope: "One major branch of human history",
    description:
      "Population expansions reached South Asia, Southeast Asia and Sahul. This does not mean every user descends equally from every route.",
    evidence: "Archaeology, modern genomes and ancient DNA",
    x: 78,
    y: 58,
  },
  {
    id: "northern-route-40000",
    yearsAgo: 40000,
    label: "Northern Eurasian and European expansions",
    region: "Central Asia and Europe",
    confidence: "High for settlement patterns",
    scope: "One major branch of human history",
    description:
      "Other populations expanded into northern Eurasia and Europe, repeatedly mixing and replacing one another over thousands of years.",
    evidence: "Ancient DNA and archaeology",
    x: 65,
    y: 28,
  },
  {
    id: "holocene-12000",
    yearsAgo: 12000,
    label: "Holocene population transformations",
    region: "Multiple regions",
    confidence: "High for major transitions",
    scope: "Regional population history",
    description:
      "Farming, pastoralism, seafaring and urbanisation produced large migrations and mixtures. Personal ancestry requires genome-to-reference comparison.",
    evidence: "Ancient DNA, archaeology and historical linguistics",
    x: 70,
    y: 45,
  },
  {
    id: "recent-family",
    yearsAgo: 0,
    label: "Your documented family geography",
    region: "Provided by you",
    confidence: "Depends on family records",
    scope: "Recent context only",
    description:
      "Birthplaces and family records describe recent family history. They are not substitutes for genetic evidence and are never used to infer caste or religion.",
    evidence: "User-provided family information",
    x: 73,
    y: 51,
  },
];

function lowerName(name = "") {
  return String(name).trim().toLowerCase();
}

export function detectGenomeFormat(name, sample = "") {
  const file = lowerName(name);
  const head = String(sample || "").slice(0, 200000);

  if (file.endsWith(".vcf.gz")) return "vcf-gzip";
  if (file.endsWith(".vcf") || head.includes("##fileformat=VCF")) return "vcf";
  if (file.endsWith(".bed")) return "plink-bed";
  if (file.endsWith(".bim")) return "plink-bim";
  if (file.endsWith(".fam")) return "plink-fam";
  if (file.endsWith(".pgen")) return "plink-pgen";
  if (file.endsWith(".pvar")) return "plink-pvar";
  if (file.endsWith(".psam")) return "plink-psam";

  const looksLikeConsumerRaw =
    /(^|\n)#.*(23andme|ancestrydna|myheritage)/i.test(head) ||
    /(^|\n)rs\d+\s+[0-9XYMT]+\s+\d+\s+[ACGTDI-]+/m.test(head) ||
    /(^|\n)rsid[\t, ]+chromosome[\t, ]+position[\t, ]+genotype/i.test(head);
  if ((file.endsWith(".txt") || file.endsWith(".csv")) && looksLikeConsumerRaw) {
    return "consumer-genotype";
  }
  if (file.endsWith(".txt") || file.endsWith(".csv")) return "text-unknown";
  return "unsupported";
}

export function validateGenomeBundle(files = []) {
  const list = Array.from(files).map((file) => ({
    name: file.name || "",
    size: Number(file.size || 0),
    format: file.format || detectGenomeFormat(file.name || "", file.sample || ""),
  }));

  const errors = [];
  if (!list.length) errors.push("Choose at least one genome file.");
  for (const file of list) {
    if (file.size <= 0) errors.push(`${file.name || "A file"} is empty.`);
    if (file.size > MAX_BROWSER_FILE_BYTES) {
      errors.push(`${file.name} is larger than the 250 MB direct-upload limit.`);
    }
    if (file.format === "unsupported") errors.push(`${file.name} is not a supported format.`);
  }

  const formats = new Set(list.map((file) => file.format));
  const hasPrimary = ["vcf", "vcf-gzip", "consumer-genotype"].some((format) => formats.has(format));
  const hasBedSet = ["plink-bed", "plink-bim", "plink-fam"].every((format) => formats.has(format));
  const hasPgenSet = ["plink-pgen", "plink-pvar", "plink-psam"].every((format) => formats.has(format));

  if (list.length && !hasPrimary && !hasBedSet && !hasPgenSet) {
    errors.push("Provide a VCF/raw genotype file or a complete PLINK BED/BIM/FAM or PGEN/PVAR/PSAM set.");
  }

  return {
    valid: errors.length === 0,
    errors,
    formats: [...formats],
    files: list,
  };
}

export function inspectGenomeSample(sample = "") {
  const text = String(sample || "");
  const lines = text.split(/\r?\n/);
  const dataLines = lines.filter((line) => line && !line.startsWith("#"));
  const joined = `\n${text.toUpperCase()}\n`;
  return {
    sampledLines: dataLines.length,
    mitochondrialMarkers: /\n(?:CHR)?(?:M|MT)[\t ,]/.test(joined),
    yChromosomeMarkers: /\n(?:CHR)?Y[\t ,]/.test(joined),
    vcfHeader: text.includes("##fileformat=VCF"),
  };
}

export function sanitizeProfile(profile = {}) {
  const currentYear = new Date().getUTCFullYear();
  const birthYear = Number(profile.birthYear || 0);
  return {
    displayName: String(profile.displayName || "").trim().slice(0, 80),
    birthYear: birthYear >= 1900 && birthYear <= currentYear ? birthYear : null,
    birthplace: String(profile.birthplace || "").trim().slice(0, 160),
    familyPlaces: Array.isArray(profile.familyPlaces)
      ? profile.familyPlaces.map((value) => String(value).trim().slice(0, 160)).filter(Boolean).slice(0, 8)
      : [],
  };
}

export function buildLocalPreview(profile, validation, inspection = {}) {
  const clean = sanitizeProfile(profile);
  return {
    mode: "local-qc-preview",
    personalisedGeneticInference: false,
    title: clean.displayName ? `${clean.displayName}’s ancestry workspace` : "Your ancestry workspace",
    recentContext: {
      birthYear: clean.birthYear,
      birthplace: clean.birthplace || null,
      familyPlaces: clean.familyPlaces,
      warning:
        "Recent family geography is displayed as context only. It is not used to infer genetic ancestry, caste, religion or identity.",
    },
    genome: {
      formats: validation.formats || [],
      fileCount: validation.files?.length || 0,
      sampledLines: inspection.sampledLines || 0,
      mitochondrialMarkersObservedInSample: Boolean(inspection.mitochondrialMarkers),
      yMarkersObservedInSample: Boolean(inspection.yChromosomeMarkers),
      warning:
        "Browser inspection checks format and marker coverage only. It does not calculate ancestry percentages.",
    },
    journey: GENERIC_JOURNEY,
    conclusions: [],
    limitations: [
      "No individual ancient ancestor can be identified from this preview.",
      "Population affinities require a configured reference panel and formal analysis backend.",
      "Maternal and paternal haplogroups describe only two direct lines among many ancestors.",
      "A genetic affinity is not a race, caste, nationality, religion or measure of human worth.",
    ],
  };
}

export function hasProhibitedInference(report) {
  const content = JSON.stringify(report || {}).toLowerCase();
  const prohibited = [
    "caste prediction",
    "religion prediction",
    "racial purity",
    "race score",
    "intelligence score",
    "criminality",
    "superior population",
  ];
  return prohibited.some((term) => content.includes(term));
}
