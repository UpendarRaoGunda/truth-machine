"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TREE_SOURCES, TREE_VIEWS } from "../../lib/evolutionTree";
import SpeciesGlyph from "./SpeciesGlyph";

const BASE_VIEW = { width: 1800, height: 900 };
const MIN_ZOOM = 0.42;
const MAX_ZOOM = 3.4;
const NODE_HALF_WIDTH = 88;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function splitLabel(label, max = 19) {
  const words = label.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function edgePath(source, target) {
  const startX = source.x + NODE_HALF_WIDTH;
  const endX = target.x - NODE_HALF_WIDTH;
  const distance = Math.max(70, endX - startX);
  const bend = Math.max(55, distance * 0.48);
  return `M ${startX} ${source.y} C ${startX + bend} ${source.y}, ${endX - bend} ${target.y}, ${endX} ${target.y}`;
}

function zoomViewport(current, nextZoom, focusX, focusY, canvas) {
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const oldWidth = BASE_VIEW.width / current.zoom;
  const oldHeight = BASE_VIEW.height / current.zoom;
  const newWidth = BASE_VIEW.width / zoom;
  const newHeight = BASE_VIEW.height / zoom;
  const maxX = Math.max(0, canvas.width - newWidth);
  const maxY = Math.max(0, canvas.height - newHeight);

  return {
    zoom,
    x: clamp(current.x + (oldWidth - newWidth) * focusX, 0, maxX),
    y: clamp(current.y + (oldHeight - newHeight) * focusY, 0, maxY),
  };
}

function NodeShape({ node }) {
  if (node.type === "root") {
    return <path className="evo2-node-shape" d="M-91-9C-89-39-55-50-24-43 4-52 46-43 71-20 97 4 78 38 48 42 18 54-22 47-45 35-77 38-99 19-91-9Z" />;
  }

  if (["domain", "kingdom", "clade", "class", "order"].includes(node.type)) {
    return <path className="evo2-node-shape" d="M-88-42H54L88 0 54 42H-88L-101 0Z" />;
  }

  return <rect className="evo2-node-shape" x="-88" y="-43" width="176" height="86" rx="18" />;
}

function buildLineage(selectedId, view) {
  const parents = new Map();
  view.edges.forEach((item) => {
    if (item.kind === "geneFlow" || item.kind === "symbiosis") return;
    if (!parents.has(item.target)) parents.set(item.target, item.source);
  });

  const ids = [];
  let current = selectedId;
  const guard = new Set();
  while (current && !guard.has(current)) {
    guard.add(current);
    ids.unshift(current);
    current = parents.get(current);
  }
  return ids;
}

export default function EvolutionTree() {
  const [viewId, setViewId] = useState("life");
  const activeView = TREE_VIEWS[viewId];
  const [selectedId, setSelectedId] = useState(activeView.defaultNode);
  const [query, setQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [viewport, setViewport] = useState(activeView.initialViewport);
  const [journeyId, setJourneyId] = useState(activeView.journeys[0].id);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const nodeMap = useMemo(() => new Map(activeView.nodes.map((item) => [item.id, item])), [activeView]);
  const selected = nodeMap.get(selectedId) || activeView.nodes[0];
  const activeJourney = activeView.journeys.find((item) => item.id === journeyId) || activeView.journeys[0];
  const journeyNodeSet = useMemo(() => new Set(activeJourney.steps), [activeJourney]);
  const journeyPairs = useMemo(() => {
    const pairs = new Set();
    activeJourney.steps.forEach((id, index) => {
      const next = activeJourney.steps[index + 1];
      if (next) pairs.add(`${id}>${next}`);
    });
    return pairs;
  }, [activeJourney]);
  const lineageIds = useMemo(() => buildLineage(selected.id, activeView), [selected.id, activeView]);
  const lineageSet = useMemo(() => new Set(lineageIds), [lineageIds]);
  const lineagePairs = useMemo(() => {
    const pairs = new Set();
    lineageIds.forEach((id, index) => {
      const next = lineageIds[index + 1];
      if (next) pairs.add(`${id}>${next}`);
    });
    return pairs;
  }, [lineageIds]);
  const normalizedQuery = query.trim().toLowerCase();

  const viewBox = useMemo(() => {
    const width = BASE_VIEW.width / viewport.zoom;
    const height = BASE_VIEW.height / viewport.zoom;
    return `${viewport.x} ${viewport.y} ${width} ${height}`;
  }, [viewport]);

  const setMode = (nextId) => {
    const next = TREE_VIEWS[nextId];
    setViewId(nextId);
    setSelectedId(next.defaultNode);
    setViewport(next.initialViewport);
    setJourneyId(next.journeys[0].id);
    setJourneyIndex(0);
    setQuery("");
    setSearchMessage("");
  };

  const focusNode = useCallback((item, desiredZoom = 1.55) => {
    const canvas = activeView.canvas;
    const zoom = clamp(Math.max(viewport.zoom, desiredZoom), MIN_ZOOM, MAX_ZOOM);
    const width = BASE_VIEW.width / zoom;
    const height = BASE_VIEW.height / zoom;
    setViewport({
      zoom,
      x: clamp(item.x - width / 2, 0, Math.max(0, canvas.width - width)),
      y: clamp(item.y - height / 2, 0, Math.max(0, canvas.height - height)),
    });
  }, [activeView.canvas, viewport.zoom]);

  const fitAll = () => {
    const zoom = clamp(Math.min(BASE_VIEW.width / activeView.canvas.width, BASE_VIEW.height / activeView.canvas.height) * 0.96, MIN_ZOOM, 1);
    setViewport({ x: 0, y: 0, zoom });
  };

  const resetViewport = () => setViewport(activeView.initialViewport);

  const chooseNode = (item, shouldFocus = false) => {
    setSelectedId(item.id);
    setSearchMessage("");
    if (shouldFocus) focusNode(item);
  };

  const activateJourney = (journey) => {
    const first = nodeMap.get(journey.steps[0]);
    setJourneyId(journey.id);
    setJourneyIndex(0);
    if (first) {
      setSelectedId(first.id);
      focusNode(first, 1.28);
    }
  };

  const advanceJourney = () => {
    const nextIndex = (journeyIndex + 1) % activeJourney.steps.length;
    const next = nodeMap.get(activeJourney.steps[nextIndex]);
    setJourneyIndex(nextIndex);
    if (next) {
      setSelectedId(next.id);
      focusNode(next, 1.55);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!normalizedQuery) return;
    const found = activeView.nodes.find((item) => {
      const haystack = `${item.label} ${item.scientific} ${item.time} ${item.trait} ${item.region}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (found) {
      setSearchMessage(`Found ${found.label}`);
      setSelectedId(found.id);
      focusNode(found, 1.7);
    } else {
      setSearchMessage("No match in this view. Try a broader name.");
    }
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const focusX = rect.width ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0.5;
      const focusY = rect.height ? clamp((event.clientY - rect.top) / rect.height, 0, 1) : 0.5;
      const multiplier = event.deltaY < 0 ? 1.13 : 0.885;
      setViewport((current) => zoomViewport(current, current.zoom * multiplier, focusX, focusY, activeView.canvas));
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [activeView.canvas]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMove = (event) => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (!drag || !svg) return;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const visibleWidth = BASE_VIEW.width / drag.zoom;
      const visibleHeight = BASE_VIEW.height / drag.zoom;
      const dx = (event.clientX - drag.clientX) * (visibleWidth / rect.width);
      const dy = (event.clientY - drag.clientY) * (visibleHeight / rect.height);
      setViewport({
        zoom: drag.zoom,
        x: clamp(drag.x - dx, 0, Math.max(0, activeView.canvas.width - visibleWidth)),
        y: clamp(drag.y - dy, 0, Math.max(0, activeView.canvas.height - visibleHeight)),
      });
    };

    const handleUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, activeView.canvas]);

  const beginDrag = (event) => {
    if (event.button !== 0) return;
    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    };
    setIsDragging(true);
  };

  return (
    <section className="block evolution-section evo2-section" id="evolution-tree">
      <div className="wrap evo2-wrap">
        <div className="section-tag">/ an interactive visual atlas of ancestry</div>
        <div className="evo2-heading">
          <div>
            <h2 className="section-title">The Tree of Us</h2>
            <p className="section-sub">
              Not a row of dots. A living museum of cells, bodies, fossils, habitats, innovations,
              uncertain branches, and the braided genetic history that produced us.
            </p>
          </div>
          <div className="evo2-mode-switch" aria-label="Choose evolutionary atlas view">
            {Object.values(TREE_VIEWS).map((item) => (
              <button type="button" key={item.id} className={viewId === item.id ? "active" : ""} onClick={() => setMode(item.id)}>
                <span>{item.title}</span>
                <small>{item.kicker}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="evo2-shell">
          <header className="evo2-toolbar">
            <div className="evo2-view-copy">
              <strong>{activeView.title}</strong>
              <span>{activeView.description}</span>
            </div>

            <form className="evo2-search" onSubmit={handleSearch}>
              <label htmlFor="evo2-search-input">Find a species, branch, trait, or region</label>
              <div>
                <input id="evo2-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={viewId === "life" ? "Try jaws, mammals, fungi…" : "Try Lucy, Neanderthals, Kenya…"} />
                <button type="submit" disabled={!normalizedQuery}>Find</button>
              </div>
              <output>{searchMessage}</output>
            </form>

            <div className="evo2-zoom" aria-label="Tree navigation controls">
              <button type="button" aria-label="Zoom out" onClick={() => setViewport((current) => zoomViewport(current, current.zoom / 1.22, 0.5, 0.5, activeView.canvas))}>−</button>
              <span>{Math.round(viewport.zoom * 100)}%</span>
              <button type="button" aria-label="Zoom in" onClick={() => setViewport((current) => zoomViewport(current, current.zoom * 1.22, 0.5, 0.5, activeView.canvas))}>+</button>
              <button type="button" className="wide" onClick={fitAll}>Fit all</button>
              <button type="button" className="wide" onClick={resetViewport}>Reset</button>
            </div>
          </header>

          <div className="evo2-journeys">
            <div className="evo2-journey-tabs" aria-label="Guided evolutionary journeys">
              {activeView.journeys.map((journey) => (
                <button type="button" key={journey.id} className={journey.id === activeJourney.id ? "active" : ""} onClick={() => activateJourney(journey)}>
                  {journey.label}
                </button>
              ))}
            </div>
            <div className="evo2-journey-progress">
              <div>
                <strong>{activeJourney.label}</strong>
                <span>{activeJourney.summary}</span>
              </div>
              <div className="evo2-progress-dots" aria-label={`${journeyIndex + 1} of ${activeJourney.steps.length}`}>
                {activeJourney.steps.map((id, index) => (
                  <i key={id} className={index === journeyIndex ? "current" : index < journeyIndex ? "passed" : ""} />
                ))}
              </div>
              <button type="button" onClick={advanceJourney}>Next stop →</button>
            </div>
          </div>

          <div className="evo2-workspace">
            <div className={`evo2-canvas-wrap ${isDragging ? "dragging" : ""}`}>
              <svg
                ref={svgRef}
                className="evo2-canvas"
                viewBox={viewBox}
                role="img"
                aria-label={`${activeView.title} interactive visual evolutionary atlas`}
                onPointerDown={beginDrag}
              >
                <defs>
                  <filter id="evo2Glow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="evo2Branch" x1="0" x2="1">
                    <stop offset="0" stopColor="#1a806d"/><stop offset="1" stopColor="#4ff0c4"/>
                  </linearGradient>
                  <marker id="evo2Arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                    <path d="M0 0 9 4.5 0 9Z" className="evo2-arrow" />
                  </marker>
                  <pattern id="evo2Speckles" width="42" height="42" patternUnits="userSpaceOnUse">
                    <circle cx="6" cy="8" r="1.5"/><circle cx="29" cy="27" r="1"/><circle cx="38" cy="12" r=".8"/>
                  </pattern>
                </defs>

                <g className="evo2-era-bands" aria-hidden="true">
                  {activeView.eras.map((era) => (
                    <g key={era.label} className={`tone-${era.tone}`}>
                      <rect x={era.x} y="0" width={era.width} height={activeView.canvas.height} />
                      <text x={era.x + 32} y="42">{era.label}</text>
                      <text className="note" x={era.x + 32} y="68">{era.note}</text>
                    </g>
                  ))}
                  <rect className="evo2-speckles" x="0" y="0" width={activeView.canvas.width} height={activeView.canvas.height} fill="url(#evo2Speckles)" />
                </g>

                <g className="evo2-edges" aria-hidden="true">
                  {activeView.edges.map((item, index) => {
                    const source = nodeMap.get(item.source);
                    const target = nodeMap.get(item.target);
                    if (!source || !target) return null;
                    const pair = `${item.source}>${item.target}`;
                    const isJourney = journeyPairs.has(pair);
                    const isLineage = lineagePairs.has(pair);
                    const isConnected = item.source === selected.id || item.target === selected.id;
                    return (
                      <path
                        key={`${pair}-${index}`}
                        d={edgePath(source, target)}
                        className={`evo2-edge ${item.kind} ${isJourney ? "journey" : ""} ${isLineage ? "lineage" : ""} ${isConnected ? "connected" : ""}`}
                        markerEnd={item.kind === "geneFlow" || item.kind === "symbiosis" ? "url(#evo2Arrow)" : undefined}
                      />
                    );
                  })}
                </g>

                <g className="evo2-nodes">
                  {activeView.nodes.map((item) => {
                    const labelLines = splitLabel(item.label);
                    const isSelected = item.id === selected.id;
                    const isJourney = journeyNodeSet.has(item.id);
                    const isLineage = lineageSet.has(item.id);
                    const isSearchMatch = normalizedQuery && `${item.label} ${item.scientific} ${item.trait} ${item.region}`.toLowerCase().includes(normalizedQuery);
                    return (
                      <g
                        key={item.id}
                        className={`evo2-node type-${item.type} status-${item.status} ${isSelected ? "selected" : ""} ${isJourney ? "journey" : ""} ${isLineage ? "lineage" : ""} ${isSearchMatch ? "match" : ""}`}
                        style={{ "--node-accent": item.accent }}
                        transform={`translate(${item.x} ${item.y})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.label}. ${item.time}. ${item.trait}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => chooseNode(item, viewport.zoom < 1.18)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            chooseNode(item, true);
                          }
                        }}
                      >
                        {isSelected && <rect className="evo2-selection-aura" x="-101" y="-56" width="202" height="112" rx="28" filter="url(#evo2Glow)" />}
                        <NodeShape node={item} />
                        <g className="evo2-node-icon" transform="translate(-58 -2) scale(.72)"><SpeciesGlyph name={item.icon} /></g>
                        <text className="evo2-node-label" x="-19" y={labelLines.length === 1 ? -7 : -16}>
                          {labelLines.map((line, index) => <tspan key={`${line}-${index}`} x="-19" dy={index === 0 ? 0 : 18}>{line}</tspan>)}
                        </text>
                        <text className="evo2-node-time" x="-19" y={labelLines.length === 1 ? 17 : 25}>{item.time}</text>
                        {item.status === "extinct" && <path className="evo2-fossil-crack" d="M70-34 62-20 70-10 60 2 68 15" />}
                      </g>
                    );
                  })}
                </g>
              </svg>

              <div className="evo2-canvas-help">
                <span>Wheel to zoom</span><span>Drag empty space to move</span><span>Select a specimen card</span>
              </div>
            </div>

            <aside className="evo2-detail" aria-live="polite">
              <div className="evo2-detail-art" style={{ "--node-accent": selected.accent }}>
                <svg viewBox="0 0 76 70" aria-hidden="true"><SpeciesGlyph name={selected.icon} /></svg>
                <i />
              </div>
              <div className="evo2-detail-topline">
                <span className={`status ${selected.status}`}>{selected.status}</span>
                <span>{selected.type}</span>
              </div>
              <h3>{selected.label}</h3>
              <p className="scientific">{selected.scientific}</p>
              <div className="time">{selected.time}</div>

              <div className="evo2-trait-card">
                <span>Evolutionary change</span>
                <strong>{selected.trait}</strong>
              </div>

              <p className="summary">{selected.summary}</p>

              <div className="evo2-context-grid">
                <div><span>Where</span><strong>{selected.region}</strong></div>
                <div><span>World</span><strong>{selected.environment || "Varied environments"}</strong></div>
              </div>

              <div className="evo2-evidence"><span>Evidence</span><p>{selected.evidence}</p></div>
              {selected.uncertainty && <div className="evo2-uncertainty"><span>What remains uncertain</span><p>{selected.uncertainty}</p></div>}

              <div className="evo2-breadcrumbs" aria-label="Selected lineage path">
                <span>Map route</span>
                <div>{lineageIds.map((id, index) => {
                  const item = nodeMap.get(id);
                  return item ? <button type="button" key={id} onClick={() => chooseNode(item, true)}>{item.label}{index < lineageIds.length - 1 ? <i>›</i> : null}</button> : null;
                })}</div>
              </div>

              <button type="button" className="evo2-focus" onClick={() => focusNode(selected, 1.85)}>Focus this specimen</button>
            </aside>
          </div>

          <div className="evo2-legend">
            <span><i className="line accepted" /> broad relationship</span>
            <span><i className="line debated" /> debated placement</span>
            <span><i className="line braided" /> symbiosis or gene flow</span>
            <span><i className="tile living" /> living branch</span>
            <span><i className="tile extinct" /> fossil branch</span>
          </div>
        </div>

        <div className="evo2-notes">
          <div>
            <strong>A tree is not a ladder.</strong>
            <p>Every living branch has survived the same amount of time. Fossils are usually cousins or close relatives, not proven direct grandparents.</p>
          </div>
          <div>
            <strong>Some history is braided.</strong>
            <p>Mitochondria record ancient endosymbiosis; human genomes record later mixing among Homo sapiens, Neanderthals, Denisovans, and other populations.</p>
          </div>
          <div>
            <strong>The map will change.</strong>
            <p>New fossils, proteins, genomes, dates, and analyses can revise names and relationships. Uncertainty is part of honest science.</p>
          </div>
        </div>

        <div className="evo2-sources">
          <span>Scientific and interaction references</span>
          {TREE_SOURCES.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.label}</strong><small>{source.note}</small></a>
          ))}
        </div>
      </div>
    </section>
  );
}
