export const VERDICTS = {
  SUPPORTED: "Supported",
  MOSTLY_SUPPORTED: "Mostly supported",
  MIXED: "Mixed",
  MISLEADING: "Misleading",
  UNSUPPORTED: "Unsupported",
  CONTRADICTED: "Contradicted",
  FALSE: "False",
  UNVERIFIABLE: "Unverifiable",
  OPINION: "Opinion or satire",
  OUTDATED: "Outdated",
  RESEARCH_REQUIRED: "Research required",
};

export const CLAIMS = [
  {
    id: "astrology-birth-chart",
    claim: "A person's birth chart can reliably predict their personality and future.",
    aliases: ["astrology predicts personality", "horoscope predicts future", "birth chart is accurate", "zodiac decides personality"],
    domain: "Astrology",
    verdict: VERDICTS.UNSUPPORTED,
    confidence: "High",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "Controlled tests have not shown astrologers matching birth charts to personality profiles better than chance. General statements can still feel personally accurate because people naturally recognise themselves in broad descriptions.",
    sharp: "The planets may be spectacular, but they have not passed a controlled personality test.",
    classroom: "A fair test hides the answers and checks whether predictions beat chance. Astrology has not consistently done that.",
    know: [
      "A double-blind test published in Nature found astrologers did not perform better than chance when matching natal charts to personality profiles.",
      "Broad, flattering or flexible descriptions can produce a strong feeling of personal accuracy."
    ],
    unknown: [
      "Astrological traditions make many different claims, so each precise prediction should be tested separately.",
      "Anecdotal experiences cannot determine whether a method predicts better than chance."
    ],
    change: "Large, preregistered, independently replicated studies showing accurate predictions substantially above chance would change this assessment.",
    supporting: [],
    contradicting: [
      {
        title: "A double-blind test of astrology",
        publisher: "Nature",
        type: "Peer-reviewed controlled study",
        date: "1985",
        url: "https://doi.org/10.1038/318419a0",
        note: "Tested whether astrologers could match natal charts to validated personality profiles."
      },
      {
        title: "The fallacy of personal validation",
        publisher: "Journal of Abnormal and Social Psychology",
        type: "Peer-reviewed experiment",
        date: "1949",
        url: "https://doi.org/10.1037/h0059240",
        note: "Classic evidence for why generic personality descriptions can feel uniquely accurate."
      }
    ],
    tags: ["astrology", "horoscope", "zodiac", "personality", "future"]
  },
  {
    id: "eclipse-food",
    claim: "Food becomes poisonous or unsafe merely because a solar or lunar eclipse occurs.",
    aliases: ["eclipse poisons food", "do not eat during eclipse", "eclipse makes cooked food unsafe"],
    domain: "Astronomy & health",
    verdict: VERDICTS.FALSE,
    confidence: "High",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "An eclipse is a predictable alignment that changes the visible sunlight reaching a location for a short time. It does not introduce a food-poisoning mechanism. Food safety still depends on contamination, temperature, storage and handling.",
    sharp: "The Moon can block sunlight. It cannot remotely season your lunch with poison.",
    classroom: "An eclipse changes light and shadow, not the microbes, toxins or storage conditions that determine whether food is safe.",
    know: [
      "Solar and lunar eclipses are orbital alignments.",
      "Foodborne illness is linked to pathogens, toxins, unsafe temperatures, contamination and poor handling—not astronomical shadows."
    ],
    unknown: [
      "A particular meal may still be unsafe for ordinary food-safety reasons unrelated to the eclipse."
    ],
    change: "A reproducible biological or chemical mechanism, supported by controlled measurements, would be required to change this conclusion.",
    supporting: [],
    contradicting: [
      {
        title: "Eclipses",
        publisher: "NASA Science",
        type: "Primary scientific explainer",
        date: "Current reference",
        url: "https://science.nasa.gov/eclipses/",
        note: "Explains the orbital geometry that causes eclipses."
      },
      {
        title: "Five keys to safer food",
        publisher: "World Health Organization",
        type: "Public-health guidance",
        date: "Current reference",
        url: "https://www.who.int/activities/promoting-safe-food-handling/five-key-to-safer-food-manual",
        note: "Summarises the actual factors that reduce foodborne disease."
      }
    ],
    tags: ["eclipse", "food", "poison", "astronomy", "safety"]
  },
  {
    id: "black-cat-luck",
    claim: "A black cat crossing your path changes the probability of a bad event.",
    aliases: ["black cat is bad luck", "cat crossing road causes bad luck"],
    domain: "Superstition",
    verdict: VERDICTS.UNSUPPORTED,
    confidence: "High",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "There is no demonstrated causal mechanism or reliable controlled evidence that a cat's colour or movement changes unrelated future events. Selective memory can make coincidences feel predictive.",
    sharp: "The cat has somewhere to go. It is not running your probability department.",
    classroom: "To test this fairly, we would compare many journeys with and without a cat crossing while defining 'bad luck' in advance.",
    know: [
      "No established physical or biological pathway links a passing cat to unrelated later outcomes.",
      "Humans remember striking coincidences more readily than ordinary non-events."
    ],
    unknown: [
      "A cat crossing a road can create a real traffic hazard if a driver is distracted; that is ordinary causation, not luck."
    ],
    change: "Preregistered, replicated evidence showing a specific measurable effect beyond chance and confounding would be necessary.",
    supporting: [],
    contradicting: [
      {
        title: "Judgment under Uncertainty: Heuristics and Biases",
        publisher: "Science",
        type: "Peer-reviewed review",
        date: "1974",
        url: "https://doi.org/10.1126/science.185.4157.1124",
        note: "Describes cognitive shortcuts that can make coincidences and memorable events seem more predictive than they are."
      }
    ],
    tags: ["black cat", "luck", "superstition", "coincidence"]
  },
  {
    id: "vaccines-autism",
    claim: "Routine childhood vaccines cause autism.",
    aliases: ["vaccines cause autism", "mmr causes autism", "immunisation causes autism"],
    domain: "Medicine",
    verdict: VERDICTS.FALSE,
    confidence: "Very high",
    freshness: "Actively monitored",
    lastReviewed: "2026-07-25",
    summary: "Large studies and reviews have found no causal association between routine vaccination and autism. The original report that triggered widespread fear was retracted and involved serious ethical and methodological problems.",
    sharp: "This claim survived online far longer than it survived scientific scrutiny.",
    classroom: "When millions of vaccinated and unvaccinated children are compared, autism is not found to be caused by routine vaccines.",
    know: [
      "Large population studies do not find an increased autism risk following MMR vaccination.",
      "The original 1998 paper was retracted."
    ],
    unknown: [
      "Researchers continue to study autism's complex genetic and developmental contributors.",
      "Vaccines, like all medical products, can cause adverse effects, but autism is not supported as one of them."
    ],
    change: "Consistent, independently replicated evidence demonstrating a plausible causal mechanism and increased risk would be required.",
    supporting: [],
    contradicting: [
      {
        title: "Measles, Mumps, Rubella Vaccination and Autism",
        publisher: "Annals of Internal Medicine",
        type: "Nationwide cohort study",
        date: "2019",
        url: "https://doi.org/10.7326/M18-2101",
        note: "A Danish nationwide cohort study of more than 650,000 children found no increased autism risk after MMR vaccination."
      },
      {
        title: "Vaccines and immunization: Vaccine safety",
        publisher: "World Health Organization",
        type: "International public-health guidance",
        date: "Current reference",
        url: "https://www.who.int/news-room/questions-and-answers/item/vaccines-and-immunization-vaccine-safety",
        note: "Summarises vaccine safety monitoring and the evidence on common misinformation."
      }
    ],
    tags: ["vaccines", "autism", "mmr", "medicine", "children"]
  },
  {
    id: "earth-flat",
    claim: "Earth is flat rather than approximately spherical.",
    aliases: ["earth is flat", "flat earth", "globe is fake"],
    domain: "Earth science",
    verdict: VERDICTS.FALSE,
    confidence: "Extremely high",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "Independent observations from geometry, gravity, navigation, astronomy, surveying and spacecraft consistently show that Earth is an oblate spheroid. Everyday technologies such as satellite navigation use this geometry.",
    sharp: "The phone used to post the claim keeps locating itself on the globe it denies.",
    classroom: "Different measurements—shadows, horizons, star positions, circumnavigation and satellites—all converge on the same model.",
    know: [
      "Earth's shape can be measured without relying on space photography.",
      "Geodesy, orbital mechanics and global navigation systems use a three-dimensional Earth model."
    ],
    unknown: [
      "Earth is not a perfect sphere; rotation and local topography produce measurable departures."
    ],
    change: "A replacement model would need to explain all existing measurements more accurately and make successful new predictions.",
    supporting: [],
    contradicting: [
      {
        title: "Earth Fact Sheet",
        publisher: "NASA",
        type: "Primary scientific reference",
        date: "Current reference",
        url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
        note: "Provides measured physical parameters for Earth."
      },
      {
        title: "World Geodetic System 1984",
        publisher: "National Geospatial-Intelligence Agency",
        type: "Technical geodesy standard",
        date: "Current standard",
        url: "https://earth-info.nga.mil/index.php?dir=wgs84&action=wgs84",
        note: "Documents the Earth reference system used for positioning and navigation."
      }
    ],
    tags: ["earth", "flat earth", "globe", "space", "navigation"]
  },
  {
    id: "humans-fish-ancestry",
    claim: "Humans share ancestry with ancient fish-like vertebrates.",
    aliases: ["humans came from fish", "humans are fish", "fish ancestry"],
    domain: "Evolution",
    verdict: VERDICTS.SUPPORTED,
    confidence: "Very high",
    freshness: "Stable with continuing refinement",
    lastReviewed: "2026-07-25",
    summary: "Humans are tetrapod vertebrates nested within the lobe-finned vertebrate lineage. Fossils, anatomy, embryology and genomes independently support common ancestry with ancient fish-like vertebrates. Modern humans did not descend from any living fish species.",
    sharp: "Your family tree contains fins. It does not require permission from your pride.",
    classroom: "Evolution is a branching tree: humans and living fishes share ancestors, while neither modern group is the direct parent of the other.",
    know: [
      "Tetrapod limbs and lobe-finned appendages share homologous skeletal patterns.",
      "Genetic and fossil evidence places tetrapods within vertebrate evolutionary history."
    ],
    unknown: [
      "Exact relationships and dates for some extinct branches continue to be refined as fossils and molecular analyses improve."
    ],
    change: "A better-supported phylogenetic model explaining the combined fossil, anatomical and genomic evidence would be required.",
    supporting: [
      {
        title: "Human Evolution",
        publisher: "Smithsonian Human Origins Program",
        type: "Museum and research programme",
        date: "Current reference",
        url: "https://humanorigins.si.edu/education/introduction-human-evolution",
        note: "Explains humans as primates within the broader evolutionary tree."
      },
      {
        title: "Your Inner Fish",
        publisher: "University of Chicago",
        type: "Research-based educational resource",
        date: "Current reference",
        url: "https://tiktaalik.uchicago.edu/",
        note: "Presents fossil and anatomical evidence connecting lobe-finned vertebrates and tetrapods."
      }
    ],
    contradicting: [],
    tags: ["evolution", "fish", "humans", "tetrapods", "ancestry"]
  },
  {
    id: "whale-pelvis",
    claim: "Whales retain reduced pelvic bones inherited from land-dwelling ancestors.",
    aliases: ["whales have pelvis", "whale pelvic bones", "whales evolved from land mammals"],
    domain: "Evolution",
    verdict: VERDICTS.SUPPORTED,
    confidence: "Very high",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "Living whales possess reduced pelvic elements, and the fossil record documents a transition from terrestrial artiodactyl relatives to increasingly aquatic cetaceans. These structures are modified and can retain functions; 'vestigial' does not mean useless.",
    sharp: "Evolution keeps renovation receipts, even after the legs leave the building.",
    classroom: "Whale pelvic bones are inherited, modified structures that help reveal their land-mammal ancestry.",
    know: [
      "Cetacean fossils document major changes in limbs, spine, hearing and locomotion.",
      "Living whale pelvic structures are homologous with the pelvis of other mammals."
    ],
    unknown: [
      "The exact function and evolutionary history of specific pelvic features varies among whale lineages."
    ],
    change: "A competing model would need to explain both the fossil sequence and multiple independent anatomical and genomic relationships.",
    supporting: [
      {
        title: "Thewissen Lab: Whale Origins",
        publisher: "Northeast Ohio Medical University",
        type: "Research laboratory resource",
        date: "Current reference",
        url: "https://web.neomed.edu/web/anatomy/Thewissen/whale_origins/index.html",
        note: "Summarises fossil research on the transition from land mammals to whales."
      }
    ],
    contradicting: [],
    tags: ["whale", "pelvis", "evolution", "fossil", "vestigial"]
  },
  {
    id: "name-numerology-wealth",
    claim: "Changing the spelling of a name through numerology directly increases wealth or luck.",
    aliases: ["change name for wealth", "numerology attracts money", "name spelling changes luck"],
    domain: "Numerology",
    verdict: VERDICTS.UNSUPPORTED,
    confidence: "High",
    freshness: "Stable",
    lastReviewed: "2026-07-25",
    summary: "Names can affect social perception, searchability and personal identity, but there is no reliable evidence that numerological letter values directly alter probability, markets or income through an invisible numerical mechanism.",
    sharp: "Autocorrect is not a wealth-transfer protocol.",
    classroom: "A name can influence how people respond to us, but that is different from numbers secretly changing external events.",
    know: [
      "Social effects of names are plausible and testable.",
      "A supernatural numerical pathway changing unrelated outcomes has not been demonstrated."
    ],
    unknown: [
      "A name change may indirectly affect confidence, branding or social interactions, which should not be confused with numerology."
    ],
    change: "Preregistered, independently replicated evidence separating social effects from claimed numerical effects would be required.",
    supporting: [],
    contradicting: [
      {
        title: "Scientific Method",
        publisher: "Encyclopaedia Britannica",
        type: "General methodological reference",
        date: "Current reference",
        url: "https://www.britannica.com/science/scientific-method",
        note: "Describes the need for testable hypotheses, observation and reproducible evidence."
      }
    ],
    tags: ["numerology", "name", "wealth", "luck", "money"]
  }
];

export const EXAMPLE_CLAIMS = [
  "Do vaccines cause autism?",
  "Does food become poisonous during an eclipse?",
  "Can astrology predict personality?",
  "Is Earth flat?",
  "Did humans share ancestry with fish?",
];

export function normaliseText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitAtomicClaims(value = "") {
  const cleaned = value.trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?:[.!?]\s+|\n+|;\s+|\s+(?:and|but)\s+)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 4)
    .slice(0, 6);
}

function scoreCandidate(query, item) {
  const q = new Set(normaliseText(query).split(" ").filter((token) => token.length > 2));
  if (!q.size) return 0;
  const text = normaliseText([item.claim, ...item.aliases, ...item.tags].join(" "));
  let score = 0;
  q.forEach((token) => {
    if (text.includes(token)) score += token.length > 6 ? 3 : 1;
  });
  if (text.includes(normaliseText(query))) score += 8;
  return score;
}

export function findBestClaim(query) {
  const ranked = CLAIMS
    .map((item) => ({ item, score: scoreCandidate(query, item) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 2 ? ranked[0].item : null;
}

export function getClaimById(id) {
  return CLAIMS.find((item) => item.id === id) || null;
}

export function classifyClaim(value = "") {
  const text = normaliseText(value);
  if (!text) return "Empty";
  if (/\b(i think|i believe|beautiful|best|worst|should|ought)\b/.test(text)) return "Opinion or value judgement";
  if (/\b(will|next year|tomorrow|prediction|forecast)\b/.test(text)) return "Prediction";
  if (text.length < 12) return "Too vague";
  return "Factual and checkable";
}

export function toClaimReview(item, canonicalUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: canonicalUrl,
    datePublished: item.lastReviewed,
    dateModified: item.lastReviewed,
    claimReviewed: item.claim,
    reviewRating: {
      "@type": "Rating",
      ratingValue: verdictRating(item.verdict),
      bestRating: 5,
      worstRating: 1,
      alternateName: item.verdict,
    },
    author: {
      "@type": "Organization",
      name: "The Truth Machine",
      url: canonicalUrl.replace(/\/claims\/.*$/, ""),
    },
    itemReviewed: {
      "@type": "Claim",
      appearance: {
        "@type": "CreativeWork",
        url: canonicalUrl,
      },
      author: {
        "@type": "Organization",
        name: "Unspecified claimant",
      },
      datePublished: item.lastReviewed,
    },
  };
}

function verdictRating(verdict) {
  const map = {
    [VERDICTS.SUPPORTED]: 5,
    [VERDICTS.MOSTLY_SUPPORTED]: 4,
    [VERDICTS.MIXED]: 3,
    [VERDICTS.MISLEADING]: 2,
    [VERDICTS.UNSUPPORTED]: 2,
    [VERDICTS.CONTRADICTED]: 1,
    [VERDICTS.FALSE]: 1,
    [VERDICTS.OUTDATED]: 2,
    [VERDICTS.UNVERIFIABLE]: 3,
    [VERDICTS.OPINION]: 3,
    [VERDICTS.RESEARCH_REQUIRED]: 3,
  };
  return map[verdict] || 3;
}
