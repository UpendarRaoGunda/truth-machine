// Original educational visual atlas for The Truth Machine.
// Dashed edges mark debated placements; blue links mark symbiosis or gene flow.

import { LIFE_VIEW } from "./evolutionLife";
import { HUMAN_VIEW } from "./evolutionHuman";

export const TREE_SOURCES = [
  {
    label: "OneZoom Tree of Life Explorer",
    url: "https://www.onezoom.org/life/@biota=93302?otthome=%40_ozid%3D1",
    note: "deep-tree navigation and broad taxonomic context",
  },
  {
    label: "Smithsonian Human Origins — Human Family Tree",
    url: "https://humanorigins.si.edu/evidence/human-family-tree",
    note: "hominin groups, time ranges, fossils, and educational context",
  },
  {
    label: "Open Tree of Life",
    url: "https://tree.opentreeoflife.org/",
    note: "open phylogenetic synthesis reference",
  },
];

export const TREE_VIEWS = { life: LIFE_VIEW, human: HUMAN_VIEW };
