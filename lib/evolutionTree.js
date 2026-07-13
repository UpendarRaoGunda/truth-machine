// Original educational dataset for The Truth Machine.
// Scientific relationships are intentionally schematic; dashed edges mark debated placements.

export const TREE_CANVAS = {"width":2200,"height":900};

export const TREE_SOURCES = [
  {
    "label": "OneZoom Tree of Life Explorer",
    "url": "https://www.onezoom.org/life/@biota=93302?otthome=%40_ozid%3D1",
    "note": "deep-tree navigation and broad taxonomic context"
  },
  {
    "label": "Smithsonian Human Origins — Human Family Tree",
    "url": "https://humanorigins.si.edu/evidence/human-family-tree",
    "note": "hominin species, time ranges, and evidence context"
  },
  {
    "label": "Open Tree of Life",
    "url": "https://tree.opentreeoflife.org/",
    "note": "open phylogenetic synthesis reference"
  }
];

const FIELDS = ["id","x","y","label","scientific","type","status","time","summary","evidence","uncertainty"];
const makeNodes = (rows) => rows.map((row) => Object.fromEntries(FIELDS.map((field, index) => [field, row[index]])));
const makeEdges = (rows) => rows.map(([source, target, kind = "branch"]) => ({ source, target, kind }));

const deepLifeNodes = makeNodes([
  ["life",80,350,"All known life","Biota","root","living","At least 3.5+ billion years","Every organism alive today sits somewhere on one connected evolutionary tree.","genomes · fossils · comparative biology",""] ,
  ["bacteria",275,105,"Bacteria","Bacteria","domain","living","Ancient lineage","One of life's deepest branches, containing enormous metabolic and ecological diversity.","genomes · cell biology · fossils",""] ,
  ["archaea",275,255,"Archaea","Archaea","domain","living","Ancient lineage","A major domain of life; many molecular systems in eukaryotes share deep ancestry with archaea.","genomes · molecular biology",""] ,
  ["eukaryotes",275,500,"Eukaryotes","Eukaryota","domain","living","More than 1.6 billion years","Cells with nuclei: animals, plants, fungi, and many diverse microbial lineages.","fossils · cell biology · genomes",""] ,
  ["protists",485,690,"Many microbial eukaryotes","multiple lineages","clade","living","Ancient and diverse","A convenient visual bundle, not one natural clade. Eukaryotic microbes span many branches.","genomes · microscopy",""] ,
  ["plants",485,585,"Plants and relatives","Archaeplastida","clade","living","Over 1 billion years of history","The broad branch containing green plants, red algae, and close relatives.","genomes · chloroplast ancestry · fossils",""] ,
  ["fungi",485,455,"Fungi","Fungi","kingdom","living","At least hundreds of millions of years","Closer to animals than to plants, despite the old classroom habit of grouping them with plants.","genomes · cell biology · fossils",""] ,
  ["animals",485,310,"Animals","Metazoa","kingdom","living","More than 600 million years","Multicellular organisms whose lineage eventually produced everything from sponges to humans.","fossils · development · genomes",""] ,
  ["sponges",675,115,"Sponges","Porifera","clade","living","Early animal branch","Living representatives of one of the earliest-diverging animal lineages.","development · genomes · fossils",""] ,
  ["cnidarians",675,220,"Jellyfish and corals","Cnidaria","clade","living","More than 550 million years","An ancient animal branch with nerve nets, muscles, and radial body plans.","fossils · development · genomes",""] ,
  ["bilateria",675,350,"Bilateral animals","Bilateria","clade","living","More than 550 million years","The huge branch of animals with left-right body organization, including us.","development · fossils · genomes",""] ,
  ["ecdysozoa",865,145,"Molting animals","Ecdysozoa","clade","living","Cambrian and earlier roots","Arthropods, nematodes, and relatives—the most species-rich animal branch.","genomes · anatomy · fossils",""] ,
  ["lophotrochozoa",865,505,"Molluscs, annelids & kin","Lophotrochozoa","clade","living","Cambrian and earlier roots","A vast branch containing molluscs, segmented worms, brachiopods, and many others.","genomes · anatomy · fossils",""] ,
  ["deuterostomes",865,330,"Deuterostomes","Deuterostomia","clade","living","More than 520 million years","The branch containing echinoderms, hemichordates, and chordates.","development · genomes · fossils",""] ,
  ["chordates",1045,330,"Chordates","Chordata","clade","living","More than 520 million years","Animals with a notochord at some life stage. Your embryonic blueprint still carries this history.","embryology · anatomy · fossils",""] ,
  ["vertebrates",1225,330,"Vertebrates","Vertebrata","clade","living","About 500+ million years","Backboned animals. Humans are one highly modified twig inside this fish-heavy branch.","fossils · anatomy · genomes",""] ,
  ["tetrapods",1405,330,"Four-limbed vertebrates","Tetrapoda","clade","living","About 370 million years","Descendants of lobe-finned fish that moved into shallow-water and land environments.","transitional fossils · limb anatomy · genomes",""] ,
  ["amniotes",1585,330,"Amniotes","Amniota","clade","living","About 320 million years","The lineage whose reproductive innovations reduced dependence on open water.","fossils · embryology · anatomy",""] ,
  ["mammals",1765,330,"Mammals","Mammalia","class","living","More than 200 million years","Hair, milk, specialized middle-ear bones, and a long history beside dinosaurs.","fossils · anatomy · genomes",""] ,
  ["primates",1915,330,"Primates","Primates","order","living","About 65–55 million years","Grasping hands, forward-facing eyes, and flexible social brains evolved within this branch.","fossils · anatomy · genomes",""] ,
  ["apes",2045,250,"Apes","Hominoidea","clade","living","About 25–20 million years","Gibbons, orangutans, gorillas, chimpanzees, bonobos, and humans share this branch.","fossils · anatomy · genomes",""] ,
  ["hominins",2045,415,"Human lineage","Hominini","clade","living","Roughly 7 million years","The lineage after the human–chimpanzee split, represented by many overlapping species.","fossils · archaeology · genomes",""] ,
  ["sapiens",2140,540,"Modern humans","Homo sapiens","species","living","About 300,000 years–present","One surviving human species—not the goal of evolution, simply the branch still here.","fossils · archaeology · ancient and modern DNA",""]
]);

const deepLifeEdges = makeEdges([
  ["life","bacteria","branch"],["life","archaea","branch"],["life","eukaryotes","branch"],
  ["eukaryotes","protists","uncertain"],["eukaryotes","plants","branch"],["eukaryotes","fungi","branch"],["eukaryotes","animals","branch"],
  ["animals","sponges","branch"],["animals","cnidarians","branch"],["animals","bilateria","branch"],
  ["bilateria","ecdysozoa","branch"],["bilateria","lophotrochozoa","branch"],["bilateria","deuterostomes","branch"],
  ["deuterostomes","chordates","branch"],["chordates","vertebrates","branch"],["vertebrates","tetrapods","branch"],
  ["tetrapods","amniotes","branch"],["amniotes","mammals","branch"],["mammals","primates","branch"],
  ["primates","apes","branch"],["apes","hominins","branch"],["hominins","sapiens","branch"]
]);

const humanNodes = makeNodes([
  ["lca",85,365,"Human–chimp last common ancestor","unknown population","root","extinct","About 8–6 million years ago","Humans did not descend from modern chimpanzees. Both lineages inherited traits from an earlier shared population.","comparative genomics · fossils · molecular clocks",""] ,
  ["pan",300,650,"Chimpanzees & bonobos","Pan","clade","living","Living sister lineage","Our closest living relatives are evolutionary cousins, not ancestors frozen in time.","genomes · anatomy · behavior",""] ,
  ["hominin-line",300,360,"Hominin lineage","Hominini","clade","living","About 7 million years–present","The human-side branch after the split from the ancestors of chimpanzees and bonobos.","fossils · anatomy · genomes",""] ,
  ["sahelanthropus",510,80,"Sahelanthropus tchadensis","Sahelanthropus tchadensis","species","extinct","7–6 million years ago","An early possible hominin from Chad; its exact position remains debated.","skull and dental fossils","placement debated"],
  ["orrorin",510,185,"Orrorin tugenensis","Orrorin tugenensis","species","extinct","6.2–5.8 million years ago","Fragmentary Kenyan fossils suggest a mix of climbing and possible upright walking adaptations.","femur · teeth · limb fragments","relationship debated"],
  ["ardipithecus",510,310,"Ardipithecus","Ardipithecus kadabba / ramidus","clade","extinct","5.8–4.4 million years ago","Early hominins showing a mosaic of arboreal traits and forms of bipedal movement.","partial skeletons · teeth · habitat evidence",""] ,
  ["australopiths",720,360,"Australopith radiation","Australopithecus and close relatives","clade","extinct","About 4.2–2 million years ago","A diverse set of small-brained, habitual bipeds—not a single straight ladder toward humans.","skeletons · footprints · teeth",""] ,
  ["anamensis",925,65,"Australopithecus anamensis","Australopithecus anamensis","species","extinct","4.2–3.8 million years ago","One of the earliest known australopith species, with evidence of bipedalism.","jaws · teeth · limb fossils",""] ,
  ["afarensis",925,155,"Australopithecus afarensis","Australopithecus afarensis","species","extinct","3.85–2.95 million years ago","Lucy's species: clearly bipedal while retaining adaptations useful for climbing.","Lucy · Laetoli footprints · many fossils",""] ,
  ["africanus",925,250,"Australopithecus africanus","Australopithecus africanus","species","extinct","3.3–2.1 million years ago","A South African australopith known from numerous skulls and partial skeletons.","skulls · teeth · postcranial fossils",""] ,
  ["sediba",925,345,"Australopithecus sediba","Australopithecus sediba","species","extinct","About 1.98 million years ago","A mosaic of australopith-like and Homo-like features; its relationship to Homo is debated.","partial skeletons","relationship to Homo debated"],
  ["paranthropus",925,555,"Robust australopiths","Paranthropus","clade","extinct","About 2.7–1.2 million years ago","A side branch specialized for powerful chewing, overlapping in time with early Homo.","skulls · jaws · teeth",""] ,
  ["aethiopicus",1125,470,"P. aethiopicus","Paranthropus aethiopicus","species","extinct","2.7–2.3 million years ago","An early robust australopith from eastern Africa.","skull and jaw fossils",""] ,
  ["boisei",1125,565,"P. boisei","Paranthropus boisei","species","extinct","2.3–1.2 million years ago","An eastern African robust australopith with massive chewing adaptations.","many skulls · teeth · jaws",""] ,
  ["robustus",1125,660,"P. robustus","Paranthropus robustus","species","extinct","About 2–1.2 million years ago","A southern African robust australopith and evolutionary cousin of our lineage.","skulls · teeth · jaws",""] ,
  ["homo-radiation",1135,300,"Genus Homo radiation","Homo","clade","living","At least 2.4 million years–present","Multiple human species overlapped, migrated, diverged, and sometimes exchanged genes.","fossils · tools · archaeology · DNA",""] ,
  ["habilis",1335,70,"Homo habilis","Homo habilis","species","extinct","2.4–1.4 million years ago","An early Homo species associated with a larger brain than australopiths and early stone-tool traditions.","skulls · hands · teeth · tools",""] ,
  ["rudolfensis",1335,160,"Homo rudolfensis","Homo rudolfensis","species","extinct","About 1.9–1.8 million years ago","A debated early Homo species known mainly from skull and jaw fossils.","skull · jaws · teeth","species boundaries debated"],
  ["erectus",1335,260,"Homo erectus","Homo erectus","species","extinct","1.89 million–about 110,000 years ago","A long-lived, widespread human species with modern-like body proportions and major dispersals beyond Africa.","many fossils · tools · geography",""] ,
  ["naledi",1335,385,"Homo naledi","Homo naledi","species","extinct","335,000–236,000 years ago","A surprising South African species combining a small brain with a distinctive mosaic of traits.","many individuals from cave deposits",""] ,
  ["island-homo",1535,145,"Island Homo branches","Homo floresiensis / luzonensis","clade","extinct","Late Pleistocene","Island populations reveal that recent human diversity was far wider than a single species.","skeletal fossils · island archaeology","origins debated"],
  ["floresiensis",1725,85,"Homo floresiensis","Homo floresiensis","species","extinct","About 100,000–50,000 years ago","A small-bodied human species from Flores, Indonesia, often nicknamed the 'hobbit.'","partial skeletons · tools",""] ,
  ["luzonensis",1725,190,"Homo luzonensis","Homo luzonensis","species","extinct","At least about 67,000–50,000 years ago","A distinct human species identified from teeth and small bones in the Philippines.","teeth · hand and foot bones",""] ,
  ["middle-homo",1535,365,"Middle Pleistocene Homo","multiple populations","clade","extinct","Roughly 800,000–300,000 years ago","A complex collection of populations near the ancestry of later humans; names and boundaries remain disputed.","fossils · tools · emerging ancient DNA","taxonomy debated"],
  ["antecessor",1725,300,"Homo antecessor","Homo antecessor","species","extinct","About 850,000–770,000 years ago","An early European human species whose precise relationship to later humans is uncertain.","fossils · proteins · archaeology","placement debated"],
  ["heidelbergensis",1725,405,"H. heidelbergensis group","Homo heidelbergensis sensu lato","clade","extinct","About 700,000–200,000 years ago","A traditional umbrella for Middle Pleistocene fossils; researchers disagree on how broadly to use the name.","skulls · postcranial fossils · tools","taxonomy strongly debated"],
  ["neanderthal",1920,235,"Neanderthals","Homo neanderthalensis","species","extinct","About 400,000–40,000 years ago","A Eurasian human lineage with sophisticated behavior that interbred with Homo sapiens.","fossils · archaeology · ancient DNA",""] ,
  ["denisovan",1920,355,"Denisovans","Denisovan populations","species","extinct","Middle–Late Pleistocene","An ancient human lineage recognized largely through DNA, with a growing but still sparse fossil record.","ancient DNA · teeth · bone fragments","formal species naming unresolved"],
  ["sapiens-human",2085,500,"Homo sapiens","Homo sapiens","species","living","About 300,000 years–present","Our species emerged in Africa from structured populations, later dispersing and mixing with other human lineages.","fossils · archaeology · ancient and modern DNA",""]
]);

const humanEdges = makeEdges([
  ["lca","pan","branch"],["lca","hominin-line","branch"],
  ["hominin-line","sahelanthropus","uncertain"],["hominin-line","orrorin","uncertain"],["hominin-line","ardipithecus","uncertain"],["hominin-line","australopiths","branch"],
  ["australopiths","anamensis","uncertain"],["australopiths","afarensis","uncertain"],["australopiths","africanus","uncertain"],["australopiths","sediba","uncertain"],["australopiths","paranthropus","branch"],
  ["paranthropus","aethiopicus","uncertain"],["paranthropus","boisei","uncertain"],["paranthropus","robustus","uncertain"],
  ["australopiths","homo-radiation","uncertain"],["homo-radiation","habilis","uncertain"],["homo-radiation","rudolfensis","uncertain"],["homo-radiation","erectus","branch"],["homo-radiation","naledi","uncertain"],
  ["erectus","island-homo","uncertain"],["island-homo","floresiensis","uncertain"],["island-homo","luzonensis","uncertain"],
  ["erectus","middle-homo","uncertain"],["middle-homo","antecessor","uncertain"],["middle-homo","heidelbergensis","uncertain"],
  ["heidelbergensis","neanderthal","uncertain"],["heidelbergensis","denisovan","uncertain"],["middle-homo","sapiens-human","uncertain"],
  ["neanderthal","sapiens-human","geneFlow"],["denisovan","sapiens-human","geneFlow"]
]);

export const TREE_VIEWS = {
  life: {
    id: "life",
    title: "Life → Us",
    kicker: "3.8 billion years in one connected map",
    description: "Start with all life, follow the animal branch, and zoom into the tiny twig that eventually produced us.",
    nodes: deepLifeNodes,
    edges: deepLifeEdges,
    defaultNode: "life",
  },
  human: {
    id: "human",
    title: "Human Family",
    kicker: "a branching bush, not a victory ladder",
    description: "Explore overlapping hominin species, debated relationships, and the gene flow that turned a tree into a braided stream.",
    nodes: humanNodes,
    edges: humanEdges,
    defaultNode: "lca",
  },
};
