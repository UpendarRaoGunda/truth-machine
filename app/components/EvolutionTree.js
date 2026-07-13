"use client";

import { useMemo, useRef, useState } from "react";
import { TREE_CANVAS, TREE_SOURCES, TREE_VIEWS } from "../../lib/evolutionTree";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function radiusFor(node) {
  if (node.type === "root") return 23;
  if (node.type === "domain" || node.type === "kingdom") return 19;
  if (node.type === "clade" || node.type === "class" || node.type === "order") return 16;
  return 13;
}

function splitLabel(label, max = 24) {
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
  return lines.slice(0, 3);
}

function edgePath(source, target) {
  const horizontal = Math.max(55, (target.x - source.x) * 0.48);
  return `M ${source.x} ${source.y} C ${source.x + horizontal} ${source.y}, ${target.x - horizontal} ${target.y}, ${target.x} ${target.y}`;
}

export default function EvolutionTree() {
  const [viewId, setViewId] = useState("life");
  const [selectedId, setSelectedId] = useState(TREE_VIEWS.life.defaultNode);
  const [query, setQuery] = useState("");
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const activeView = TREE_VIEWS[viewId];
  const nodeMap = useMemo(
    () => new Map(activeView.nodes.map((node) => [node.id, node])),
    [activeView]
  );
  const selected = nodeMap.get(selectedId) || activeView.nodes[0];
  const normalizedQuery = query.trim().toLowerCase();

  const viewBox = useMemo(() => {
    const width = TREE_CANVAS.width / viewport.zoom;
    const height = TREE_CANVAS.height / viewport.zoom;
    return `${viewport.x} ${viewport.y} ${width} ${height}`;
  }, [viewport]);

  const setMode = (nextId) => {
    const next = TREE_VIEWS[nextId];
    setViewId(nextId);
    setSelectedId(next.defaultNode);
    setQuery("");
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const setZoom = (nextZoom, focusX = 0.5, focusY = 0.5) => {
    setViewport((current) => {
      const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const oldWidth = TREE_CANVAS.width / current.zoom;
      const oldHeight = TREE_CANVAS.height / current.zoom;
      const newWidth = TREE_CANVAS.width / zoom;
      const newHeight = TREE_CANVAS.height / zoom;
      const x = clamp(
        current.x + (oldWidth - newWidth) * focusX,
        0,
        TREE_CANVAS.width - newWidth
      );
      const y = clamp(
        current.y + (oldHeight - newHeight) * focusY,
        0,
        TREE_CANVAS.height - newHeight
      );
      return { x, y, zoom };
    });
  };

  const resetViewport = () => setViewport({ x: 0, y: 0, zoom: 1 });

  const focusNode = (node, desiredZoom = 2.15) => {
    const zoom = clamp(Math.max(viewport.zoom, desiredZoom), MIN_ZOOM, MAX_ZOOM);
    const width = TREE_CANVAS.width / zoom;
    const height = TREE_CANVAS.height / zoom;
    setViewport({
      zoom,
      x: clamp(node.x - width / 2, 0, TREE_CANVAS.width - width),
      y: clamp(node.y - height / 2, 0, TREE_CANVAS.height - height),
    });
  };

  const chooseNode = (node, shouldFocus = false) => {
    setSelectedId(node.id);
    if (shouldFocus) focusNode(node);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const found = activeView.nodes.find((node) => {
      const haystack = `${node.label} ${node.scientific} ${node.time}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (found) chooseNode(found, true);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    const focusX = rect ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0.5;
    const focusY = rect ? clamp((event.clientY - rect.top) / rect.height, 0, 1) : 0.5;
    const multiplier = event.deltaY < 0 ? 1.18 : 0.84;
    setZoom(viewport.zoom * multiplier, focusX, focusY);
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: viewport.x,
      y: viewport.y,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current || !svgRef.current || viewport.zoom <= 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const visibleWidth = TREE_CANVAS.width / viewport.zoom;
    const visibleHeight = TREE_CANVAS.height / viewport.zoom;
    const dx = (event.clientX - dragRef.current.clientX) * (visibleWidth / rect.width);
    const dy = (event.clientY - dragRef.current.clientY) * (visibleHeight / rect.height);

    setViewport((current) => ({
      ...current,
      x: clamp(dragRef.current.x - dx, 0, TREE_CANVAS.width - visibleWidth),
      y: clamp(dragRef.current.y - dy, 0, TREE_CANVAS.height - visibleHeight),
    }));
  };

  const stopDragging = (event) => {
    if (dragRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <section className="block evolution-section" id="evolution-tree">
      <div className="wrap">
        <div className="section-tag">/ interactive evidence tree</div>
        <div className="evolution-heading">
          <div>
            <h2 className="section-title">The Tree of Us</h2>
            <p className="section-sub">
              Zoom from all life into the human family. Solid lines show broad accepted
              branching; dashed lines mark uncertain relationships; blue lines show ancient
              gene flow rather than a simple parent-child branch.
            </p>
          </div>
          <div className="tree-mode-switch" aria-label="Choose evolutionary tree view">
            {Object.values(TREE_VIEWS).map((item) => (
              <button
                className={`tree-mode ${viewId === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setMode(item.id)}
                type="button"
              >
                <span>{item.title}</span>
                <small>{item.kicker}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="tree-shell">
          <div className="tree-toolbar">
            <div>
              <strong>{activeView.title}</strong>
              <span>{activeView.description}</span>
            </div>

            <form className="tree-search" onSubmit={handleSearch}>
              <label htmlFor="tree-search-input">Find a branch or species</label>
              <div>
                <input
                  id="tree-search-input"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={viewId === "life" ? "Try mammals or chordates" : "Try Neanderthals or Lucy"}
                  type="search"
                  value={query}
                />
                <button type="submit" disabled={!normalizedQuery}>Find</button>
              </div>
            </form>

            <div className="tree-zoom-controls" aria-label="Tree zoom controls">
              <button type="button" onClick={() => setZoom(viewport.zoom / 1.25)} aria-label="Zoom out">−</button>
              <span>{Math.round(viewport.zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom(viewport.zoom * 1.25)} aria-label="Zoom in">+</button>
              <button className="tree-reset" type="button" onClick={resetViewport}>Reset</button>
            </div>
          </div>

          <div className="tree-workspace">
            <div className="tree-canvas-wrap">
              <svg
                ref={svgRef}
                className={`tree-canvas ${viewport.zoom > 1 ? "is-zoomed" : ""}`}
                viewBox={viewBox}
                role="img"
                aria-label={`${activeView.title} interactive evolutionary relationship map`}
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
              >
                <defs>
                  <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <marker id="geneArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" className="gene-arrow" />
                  </marker>
                </defs>

                <g className="tree-grid" aria-hidden="true">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <line key={`v-${index}`} x1={index * 200} y1="0" x2={index * 200} y2={TREE_CANVAS.height} />
                  ))}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <line key={`h-${index}`} x1="0" y1={index * 190} x2={TREE_CANVAS.width} y2={index * 190} />
                  ))}
                </g>

                <g className="tree-edges" aria-hidden="true">
                  {activeView.edges.map((edge, index) => {
                    const source = nodeMap.get(edge.source);
                    const target = nodeMap.get(edge.target);
                    if (!source || !target) return null;
                    return (
                      <path
                        key={`${edge.source}-${edge.target}-${index}`}
                        d={edgePath(source, target)}
                        className={`tree-edge ${edge.kind}`}
                        markerEnd={edge.kind === "geneFlow" ? "url(#geneArrow)" : undefined}
                      />
                    );
                  })}
                </g>

                <g className="tree-nodes">
                  {activeView.nodes.map((node) => {
                    const radius = radiusFor(node);
                    const isSelected = node.id === selected?.id;
                    const isMatch = normalizedQuery && `${node.label} ${node.scientific}`.toLowerCase().includes(normalizedQuery);
                    const labelLines = splitLabel(node.label);

                    return (
                      <g
                        className={`tree-node node-${node.type} status-${node.status} ${isSelected ? "selected" : ""} ${isMatch ? "match" : ""}`}
                        key={node.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${node.label}, ${node.time}`}
                        transform={`translate(${node.x} ${node.y})`}
                        onClick={(event) => {
                          event.stopPropagation();
                          chooseNode(node, viewport.zoom < 1.45);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            chooseNode(node, true);
                          }
                        }}
                      >
                        <circle className="tree-node-hit" r={radius + 22} />
                        <circle className="tree-node-halo" r={radius + 8} />
                        <circle className="tree-node-core" r={radius} filter={isSelected ? "url(#nodeGlow)" : undefined} />
                        <circle className="tree-node-pip" r={Math.max(4, radius * 0.34)} />
                        <text className="tree-node-label" x={radius + 13} y={-(labelLines.length - 1) * 9}>
                          {labelLines.map((line, index) => (
                            <tspan key={`${line}-${index}`} x={radius + 13} dy={index === 0 ? 0 : 19}>{line}</tspan>
                          ))}
                        </text>
                        <text className="tree-node-time" x={radius + 13} y={(labelLines.length - 1) * 19 + 20}>
                          {node.time}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              <div className="tree-canvas-help">
                <span>Scroll or use +/− to zoom</span>
                <span>Drag to move</span>
                <span>Select any node for evidence</span>
              </div>
            </div>

            <aside className="tree-detail" aria-live="polite">
              <div className="tree-detail-topline">
                <span className={`tree-status ${selected.status}`}>{selected.status}</span>
                <span>{selected.type}</span>
              </div>
              <h3>{selected.label}</h3>
              <p className="tree-scientific">{selected.scientific}</p>
              <div className="tree-time">{selected.time}</div>
              <p className="tree-summary">{selected.summary}</p>
              <div className="tree-evidence">
                <span>Evidence</span>
                <p>{selected.evidence}</p>
              </div>
              {selected.uncertainty && (
                <div className="tree-uncertainty">
                  <span>Uncertainty</span>
                  <p>{selected.uncertainty}</p>
                </div>
              )}
              <button type="button" className="tree-focus-button" onClick={() => focusNode(selected)}>
                Focus this branch
              </button>
            </aside>
          </div>

          <div className="tree-legend">
            <span><i className="legend-line solid" /> accepted broad branch</span>
            <span><i className="legend-line uncertain" /> uncertain or debated placement</span>
            <span><i className="legend-line gene" /> documented gene flow</span>
            <span><i className="legend-dot living" /> living lineage</span>
            <span><i className="legend-dot extinct" /> extinct lineage</span>
          </div>
        </div>

        <div className="tree-caveat">
          <strong>This is a map of evidence, not a list of direct grandparents.</strong>
          <p>
            Fossil species are usually evolutionary relatives, not proven direct ancestors. Human evolution is a branching,
            partly braided history, and some placements will change as new fossils, proteins, and DNA are discovered.
          </p>
        </div>

        <div className="tree-sources">
          <span>Scientific references:</span>
          {TREE_SOURCES.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label}<small>{source.note}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
