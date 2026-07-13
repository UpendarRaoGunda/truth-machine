// Original life-to-human atlas dataset.

const node = (config) => ({
  status: "living",
  type: "clade",
  uncertainty: "",
  traits: [],
  region: "Global",
  environment: "",
  accent: "#4ff0c4",
  ...config,
});

const edge = (source, target, kind = "branch") => ({ source, target, kind });

const lifeNodes = [
  node({ id: "luca", x: 110, y: 520, label: "Last universal common ancestor", scientific: "LUCA (inferred population)", type: "root", status: "ancestral", time: "More than 3.5 billion years ago", summary: "Not the first life, but the shared ancestral population inferred from features carried by all living cells.", evidence: "shared genetic code · ribosomes · core metabolism", icon: "microbe", trait: "A common cellular inheritance", region: "Ancient Earth", environment: "Early oceans and hydrothermal systems", accent: "#62f5d1" }),
  node({ id: "bacteria", x: 390, y: 150, label: "Bacteria", scientific: "Bacteria", type: "domain", time: "Ancient living lineage", summary: "A vast domain of cells whose metabolisms reshaped the planet, including oxygen-producing cyanobacteria.", evidence: "genomes · cell biology · microfossils", icon: "bacteria", trait: "Metabolic invention", environment: "Every major habitat", accent: "#57e8c8" }),
  node({ id: "archaea", x: 390, y: 390, label: "Archaea", scientific: "Archaea", type: "domain", time: "Ancient living lineage", summary: "A major cellular lineage. Molecular evidence places eukaryotes within, or very close to, archaeal diversity.", evidence: "genomes · ribosomal RNA · cell chemistry", icon: "archaea", trait: "Distinct membranes and information systems", environment: "Oceans, soils, bodies, and extremes", accent: "#8be6ff" }),
  node({ id: "euk-cell", x: 690, y: 520, label: "Eukaryotic cell", scientific: "Eukaryota", type: "domain", time: "At least 1.6+ billion years ago", summary: "A complex cell lineage formed through deep evolutionary history, including an archaeal host and bacterial endosymbiosis that produced mitochondria.", evidence: "genomes · organelles · cell biology · fossils", icon: "cell", trait: "Nucleus + mitochondria", environment: "Aquatic microbial ecosystems", accent: "#63d8ff" }),
  node({ id: "microbial-euk", x: 980, y: 910, label: "Microbial eukaryote diversity", scientific: "many lineages", type: "clade", time: "Ancient and diverse", summary: "A visual bundle for many eukaryotic branches. It is not a single natural group called “protists.”", evidence: "genomes · microscopy · fossils", icon: "cell", trait: "Many ways to be a eukaryote", environment: "Water, soil, hosts", uncertainty: "This tile groups many separate branches for readability.", accent: "#5bc9ff" }),
  node({ id: "plants", x: 980, y: 750, label: "Plants and relatives", scientific: "Archaeplastida", type: "clade", time: "Over 1 billion years of history", summary: "The lineage containing green plants, red algae, and relatives, powered by chloroplasts descended from cyanobacteria.", evidence: "chloroplast genomes · fossils · pigments", icon: "leaf", trait: "Photosynthesis in chloroplasts", environment: "Water and land", accent: "#8eea72" }),
  node({ id: "fungi", x: 980, y: 610, label: "Fungi", scientific: "Fungi", type: "kingdom", time: "Hundreds of millions of years", summary: "Closer to animals than to plants. Fungi digest externally and recycle ecosystems at planetary scale.", evidence: "genomes · cell walls · fossils", icon: "fungus", trait: "Absorptive feeding", environment: "Soils, organisms, oceans", accent: "#e7c68d" }),
  node({ id: "animals", x: 980, y: 430, label: "Animals", scientific: "Metazoa", type: "kingdom", time: "More than 600 million years", summary: "Multicellular organisms with developmental toolkits that generated sponges, jellyfish, insects, molluscs, fishes, and us.", evidence: "development · fossils · genomes", icon: "embryo", trait: "Multicellular bodies", environment: "Originally marine", accent: "#ffb86f" }),
  node({ id: "sponges", x: 1260, y: 100, label: "Sponges", scientific: "Porifera", type: "clade", time: "Early animal branch", summary: "Filter-feeding animals with specialized cells but no conventional nervous system or gut.", evidence: "development · genomes · fossils", icon: "sponge", trait: "Cell cooperation", environment: "Aquatic", accent: "#ffc96f" }),
  node({ id: "cnidarians", x: 1260, y: 260, label: "Jellyfish and corals", scientific: "Cnidaria", type: "clade", time: "More than 550 million years", summary: "An ancient animal branch with muscles, nerve nets, stinging cells, and radially organized bodies.", evidence: "fossils · development · genomes", icon: "jellyfish", trait: "Nerves and muscles", environment: "Mostly marine", accent: "#ff8dc9" }),
  node({ id: "bilateria", x: 1260, y: 450, label: "Bilateral animals", scientific: "Bilateria", type: "clade", time: "More than 550 million years", summary: "The immense branch with left-right body organization, heads, directional movement, and most animal species.", evidence: "developmental genes · fossils · genomes", icon: "worm", trait: "Left-right body plan", environment: "Marine origins", accent: "#f6ad73" }),
  node({ id: "ecdysozoa", x: 1550, y: 120, label: "Molting animals", scientific: "Ecdysozoa", type: "clade", time: "Cambrian and earlier roots", summary: "Arthropods, nematodes, and relatives. Their shared story includes periodically shedding an outer covering.", evidence: "genomes · development · anatomy", icon: "arthropod", trait: "Molting outer layers", environment: "Nearly everywhere", accent: "#f3a35e" }),
  node({ id: "lophotrochozoa", x: 1550, y: 810, label: "Molluscs, annelids and kin", scientific: "Lophotrochozoa", type: "clade", time: "Cambrian and earlier roots", summary: "A vast branch containing molluscs, segmented worms, brachiopods, and many less familiar body plans.", evidence: "genomes · larvae · anatomy · fossils", icon: "shell", trait: "Extraordinary body-plan diversity", environment: "Marine, freshwater, land", accent: "#dca0ff" }),
  node({ id: "deuterostomes", x: 1550, y: 450, label: "Deuterostomes", scientific: "Deuterostomia", type: "clade", time: "More than 520 million years", summary: "The branch containing echinoderms, hemichordates, and chordates.", evidence: "development · genomes · fossils", icon: "embryo", trait: "Shared developmental ancestry", environment: "Marine origins", accent: "#79cfff" }),
  node({ id: "echinoderms", x: 1810, y: 790, label: "Echinoderms", scientific: "Echinodermata", type: "clade", time: "More than 500 million years", summary: "Sea stars, urchins, and relatives are closer to us than insects are, despite their radically different adult bodies.", evidence: "development · fossils · genomes", icon: "starfish", trait: "Water vascular system", environment: "Marine", accent: "#bba0ff" }),
  node({ id: "chordates", x: 1810, y: 450, label: "Chordates", scientific: "Chordata", type: "clade", time: "More than 520 million years", summary: "Animals with a notochord at some life stage. Your embryonic body plan still carries this inheritance.", evidence: "embryology · anatomy · fossils", icon: "lancelet", trait: "Notochord and dorsal nerve cord", environment: "Marine origins", accent: "#69d9ff" }),
  node({ id: "vertebrates", x: 2070, y: 450, label: "Vertebrates", scientific: "Vertebrata", type: "clade", time: "About 500+ million years", summary: "Backboned animals. The overwhelming majority of vertebrate history is fish history.", evidence: "fossils · anatomy · genomes", icon: "fish", trait: "Skull + vertebral column", environment: "Aquatic origins", accent: "#54c7ff" }),
  node({ id: "jawless", x: 2310, y: 130, label: "Living jawless fishes", scientific: "Cyclostomata", type: "clade", time: "Ancient vertebrate branch", summary: "Lampreys and hagfishes preserve a living branch outside jawed vertebrates.", evidence: "anatomy · genomes · fossils", icon: "eel", trait: "Vertebrates before jaws", environment: "Marine and freshwater", accent: "#78c6f7" }),
  node({ id: "jawed", x: 2310, y: 450, label: "Jawed vertebrates", scientific: "Gnathostomata", type: "clade", time: "More than 440 million years", summary: "Jaws evolved from modified skeletal supports in the head region, transforming feeding and ecology.", evidence: "fossils · comparative anatomy · development", icon: "fish", trait: "Jaws and paired fins", environment: "Aquatic origins", accent: "#42bffc" }),
  node({ id: "cartilaginous", x: 2540, y: 160, label: "Sharks, rays and kin", scientific: "Chondrichthyes", type: "clade", time: "More than 400 million years", summary: "A major jawed-vertebrate branch with cartilaginous skeletons and remarkable sensory systems.", evidence: "teeth · fossils · genomes · anatomy", icon: "shark", trait: "Cartilaginous skeleton", environment: "Mostly marine", accent: "#6fb0da" }),
  node({ id: "bony-fish", x: 2540, y: 450, label: "Bony vertebrates", scientific: "Osteichthyes", type: "clade", time: "More than 420 million years", summary: "The branch containing most fishes and every land vertebrate, including humans.", evidence: "fossils · bone anatomy · genomes", icon: "fish", trait: "Bone-rich internal skeleton", environment: "Aquatic origins", accent: "#34c5ef" }),
  node({ id: "ray-finned", x: 2770, y: 130, label: "Ray-finned fishes", scientific: "Actinopterygii", type: "clade", time: "More than 400 million years", summary: "The largest living vertebrate radiation, from seahorses to tuna to cichlids.", evidence: "fossils · fins · genomes", icon: "rayfish", trait: "Fin rays", environment: "Freshwater and marine", accent: "#33bdea" }),
  node({ id: "lobe-finned", x: 2770, y: 450, label: "Lobe-finned vertebrates", scientific: "Sarcopterygii", type: "clade", time: "More than 410 million years", summary: "Coelacanths, lungfishes, and tetrapods share fleshy, internally supported appendages.", evidence: "limb-bone homologies · fossils · genomes", icon: "lobefin", trait: "Fleshy paired appendages", environment: "Aquatic origins", accent: "#49d5d2" }),
  node({ id: "tetrapods", x: 2990, y: 450, label: "Tetrapods", scientific: "Tetrapoda", type: "clade", time: "About 370 million years", summary: "Descendants of lobe-finned vertebrates whose limbs and digits opened new shallow-water and terrestrial worlds.", evidence: "transitional fossils · limbs · tracks · genomes", icon: "salamander", trait: "Limbs with digits", environment: "Shallow water to land", accent: "#7cdd9b" }),
  node({ id: "amphibians", x: 3190, y: 150, label: "Living amphibians", scientific: "Lissamphibia", type: "clade", time: "Ancient tetrapod branch", summary: "Frogs, salamanders, and caecilians are living tetrapod cousins with strong ties to moist environments.", evidence: "fossils · development · genomes", icon: "frog", trait: "Life between water and land", environment: "Freshwater and land", accent: "#8be572" }),
  node({ id: "amniotes", x: 3190, y: 450, label: "Amniotes", scientific: "Amniota", type: "clade", time: "About 320 million years", summary: "Embryonic membranes and other reproductive changes reduced dependence on open water.", evidence: "embryology · fossils · anatomy", icon: "egg", trait: "Protected embryo", environment: "Terrestrial expansion", accent: "#f1d578" }),
  node({ id: "sauropsids", x: 3390, y: 220, label: "Reptiles and birds", scientific: "Sauropsida", type: "clade", time: "More than 300 million years", summary: "The amniote branch containing turtles, lizards, crocodilians, dinosaurs, and living birds.", evidence: "fossils · eggs · feathers · genomes", icon: "feather", trait: "Scales, feathers, and vast radiations", environment: "Land, water, air", accent: "#f0b65f" }),
  node({ id: "mammals", x: 3390, y: 600, label: "Mammals", scientific: "Mammalia", type: "class", time: "More than 200 million years", summary: "Hair, milk, and specialized middle-ear bones evolved in a lineage that lived alongside dinosaurs.", evidence: "fossils · anatomy · genomes", icon: "mammal", trait: "Hair + milk", environment: "Land, sea, and air", accent: "#ff9979" }),
  node({ id: "primates", x: 3570, y: 600, label: "Primates", scientific: "Primates", type: "order", time: "About 65–55 million years", summary: "Grasping hands, forward-facing eyes, and flexible social behavior evolved within this mammal branch.", evidence: "fossils · anatomy · genomes", icon: "hand", trait: "Grasping hands + depth vision", environment: "Arboreal origins", accent: "#ff8f83" }),
  node({ id: "apes", x: 3740, y: 500, label: "Apes", scientific: "Hominoidea", type: "clade", time: "About 25–20 million years", summary: "Gibbons, orangutans, gorillas, chimpanzees, bonobos, and humans share this tailless primate branch.", evidence: "fossils · anatomy · genomes", icon: "ape", trait: "Mobile shoulders + no external tail", environment: "Forests and woodlands", accent: "#ff837b" }),
  node({ id: "hominins", x: 3740, y: 720, label: "Human lineage", scientific: "Hominini", type: "clade", time: "Roughly 7 million years", summary: "The human-side lineage after divergence from the ancestors of chimpanzees and bonobos, represented by many overlapping species.", evidence: "fossils · archaeology · genomes", icon: "footprints", trait: "Habitual bipedalism", region: "Africa, then beyond", environment: "Woodlands, grasslands, many habitats", accent: "#ff766f" }),
  node({ id: "sapiens", x: 3910, y: 720, label: "Modern humans", scientific: "Homo sapiens", type: "species", time: "About 300,000 years–present", summary: "One surviving human species—not evolution’s destination, simply the branch that remains today.", evidence: "fossils · archaeology · ancient and modern DNA", icon: "human", trait: "Cumulative culture at planetary scale", region: "African origin; worldwide today", environment: "Every major biome", accent: "#ff6f70" }),
];

const lifeEdges = [
  edge("luca", "bacteria"), edge("luca", "archaea"),
  edge("archaea", "euk-cell"), edge("bacteria", "euk-cell", "symbiosis"),
  edge("euk-cell", "microbial-euk", "uncertain"), edge("euk-cell", "plants"), edge("euk-cell", "fungi"), edge("euk-cell", "animals"),
  edge("animals", "sponges"), edge("animals", "cnidarians"), edge("animals", "bilateria"),
  edge("bilateria", "ecdysozoa"), edge("bilateria", "lophotrochozoa"), edge("bilateria", "deuterostomes"),
  edge("deuterostomes", "echinoderms"), edge("deuterostomes", "chordates"), edge("chordates", "vertebrates"),
  edge("vertebrates", "jawless"), edge("vertebrates", "jawed"), edge("jawed", "cartilaginous"), edge("jawed", "bony-fish"),
  edge("bony-fish", "ray-finned"), edge("bony-fish", "lobe-finned"), edge("lobe-finned", "tetrapods"),
  edge("tetrapods", "amphibians"), edge("tetrapods", "amniotes"), edge("amniotes", "sauropsids"), edge("amniotes", "mammals"),
  edge("mammals", "primates"), edge("primates", "apes"), edge("apes", "hominins"), edge("hominins", "sapiens"),
];

export const LIFE_VIEW = {
  id: "life",
  title: "Life → Us",
  kicker: "a visual atlas from cells to culture",
  description: "Follow one highlighted route through a much larger branching history. Side branches are not failures; they are the overwhelming richness of life.",
  canvas: { width: 4100, height: 1120 },
  initialViewport: { x: 0, y: 65, zoom: 1 },
  defaultNode: "luca",
  nodes: lifeNodes,
  edges: lifeEdges,
  eras: [
    { x: 0, width: 850, label: "Deep cellular time", note: "LUCA, bacteria, archaea, eukaryotic cells", tone: "deep" },
    { x: 850, width: 880, label: "Eukaryotic worlds", note: "multicellularity and animal body plans", tone: "ocean" },
    { x: 1730, width: 980, label: "Vertebrate experiments", note: "skulls, jaws, bone, fins", tone: "reef" },
    { x: 2710, width: 720, label: "Water to land", note: "lobed fins, digits, protected embryos", tone: "shore" },
    { x: 3430, width: 670, label: "Mammals to humans", note: "hair, hands, apes, bipedalism", tone: "forest" },
  ],
  journeys: [
    { id: "route-to-you", label: "The route to you", summary: "Seventeen transformations; never a fresh design.", steps: ["luca", "archaea", "euk-cell", "animals", "bilateria", "deuterostomes", "chordates", "vertebrates", "jawed", "bony-fish", "lobe-finned", "tetrapods", "amniotes", "mammals", "primates", "apes", "hominins", "sapiens"] },
    { id: "fish-inside", label: "The fish inside you", summary: "Your jaw, spine, limbs, and lungs carry aquatic history.", steps: ["vertebrates", "jawed", "bony-fish", "lobe-finned", "tetrapods"] },
    { id: "side-branches", label: "Branches we did not become", summary: "Evolution is a bush of successful experiments, not a queue.", steps: ["sponges", "cnidarians", "ecdysozoa", "lophotrochozoa", "echinoderms", "ray-finned", "sauropsids"] },
  ],
};
