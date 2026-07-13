// Original educational visual atlas for The Truth Machine.
// Dashed edges mark debated placements; blue links mark symbiosis or gene flow.

import { LIFE_VIEW } from "./evolutionLife";
import { HUMAN_VIEW } from "./evolutionHuman";

export const TREE_SOURCES = [
  {
    label: "Open Tree of Life",
    url: "https://tree.opentreeoflife.org/",
    note: "open phylogenetic synthesis reference and the backbone behind Explore mode",
  },
  {
    label: "Smithsonian Human Origins — Human Family Tree",
    url: "https://humanorigins.si.edu/evidence/human-family-tree",
    note: "hominin groups, time ranges, fossils, and educational context",
  },
  {
    label: "Wikipedia",
    url: "https://www.wikipedia.org/",
    note: "species descriptions and photographs used in Explore mode, credited per branch",
  },
];

// A self-contained third mode: unlike the two curated storylines above, this
// one drives its own canvas-based state internally (see TreeExplorer.js), so
// it only needs enough metadata here to appear in the mode switcher.
export const EXPLORE_VIEW = {
  id: "explore",
  title: "Explore",
  kicker: "a real, zoomable tree of life",
  standalone: true,
};

export const TREE_VIEWS = { life: LIFE_VIEW, human: HUMAN_VIEW, explore: EXPLORE_VIEW };
