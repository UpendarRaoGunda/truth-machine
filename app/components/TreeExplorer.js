"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { pack, stratify } from "d3-hierarchy";
import treeData from "../../lib/data/tree-of-life.json";

const WORLD_SIZE = 2000;
const MIN_SCALE = 0.05;
const MAX_SCALE = 60;
const LABEL_MIN_RADIUS = 15;
const IMAGE_MIN_RADIUS = 40;
const IMAGE_PRELOAD_RADIUS = 24;
const RENDER_MIN_RADIUS = 0.55;
const FOCUS_FILL_RATIO = 0.34;

const DOMAIN_HUES = [
  { match: /bacteria/i, hue: 158 },
  { match: /archaea/i, hue: 192 },
  { match: /fungi/i, hue: 40 },
  { match: /(metazoa|animalia)/i, hue: 12 },
  { match: /(viridiplantae|chloroplastida|streptophyta|plantae)/i, hue: 132 },
  { match: /(\bsar\b|stramenopiles|alveolata|rhizaria)/i, hue: 206 },
  { match: /amoebozoa/i, hue: 276 },
  { match: /excavata/i, hue: 320 },
];
const DEFAULT_HUE = 166;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hueForAncestry(node) {
  let current = node;
  while (current) {
    const found = DOMAIN_HUES.find((entry) => entry.match.test(current.data.name));
    if (found) return found.hue;
    current = current.parent;
  }
  return DEFAULT_HUE;
}

function buildLayout() {
  const root = stratify()
    .id((d) => d.id)
    .parentId((d) => d.parentId)(treeData);
  root.count();
  pack()
    .size([WORLD_SIZE, WORLD_SIZE])
    .padding((d) => Math.max(2, 11 - d.depth * 1.5))(root);

  const shiftX = root.x;
  const shiftY = root.y;
  const nodes = root.descendants();
  nodes.forEach((node) => {
    node.x -= shiftX;
    node.y -= shiftY;
  });
  nodes.forEach((node) => {
    node.hue = hueForAncestry(node);
  });
  return { root, nodes, byId: new Map(nodes.map((node) => [node.data.id, node])) };
}

function frameNode(node, cssWidth, cssHeight, previousScale) {
  const fillTarget = (Math.min(cssWidth, cssHeight) * FOCUS_FILL_RATIO) / node.r;
  const scale = clamp(fillTarget, MIN_SCALE, MAX_SCALE);
  return { x: node.x, y: node.y, scale: previousScale != null ? scale : scale };
}

export default function TreeExplorer() {
  const { root, nodes, byId } = useMemo(buildLayout, []);

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  const targetRef = useRef({ x: 0, y: 0, scale: 1 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const imagesRef = useRef(new Map());
  const initializedRef = useRef(false);
  const dragRef = useRef(null);
  const fontsReadyRef = useRef(false);

  const [selectedId, setSelectedId] = useState(root.data.id);
  const [query, setQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [, forceTick] = useState(0);

  const selected = byId.get(selectedId) || root;
  const ancestryIds = useMemo(() => selected.ancestors().reverse().map((n) => n.data.id), [selected]);

  const flyTo = useCallback((node) => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return;
    targetRef.current = frameNode(node, width, height, cameraRef.current.scale);
  }, []);

  const selectNode = useCallback((node, shouldFly = true) => {
    setSelectedId(node.data.id);
    setSearchMessage("");
    if (shouldFly) flyTo(node);
  }, [flyTo]);

  const fitAll = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return;
    targetRef.current = { x: 0, y: 0, scale: (Math.min(width, height) * 0.47) / root.r };
  }, [root]);

  // Initial framing once the container has a measurable size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      sizeRef.current = { width, height };
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      if (!initializedRef.current && width && height) {
        initializedRef.current = true;
        const framing = { x: 0, y: 0, scale: (Math.min(width, height) * 0.47) / root.r };
        cameraRef.current = framing;
        targetRef.current = framing;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.ready.then(() => { fontsReadyRef.current = true; });
  }, []);

  // Render loop.
  useEffect(() => {
    let raf;
    let lastTick = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const { width: cssWidth, height: cssHeight } = sizeRef.current;
      if (!canvas || !cssWidth || !cssHeight) return;
      // The zoom-% readout reads camera/size refs directly; refs don't
      // trigger re-renders on their own, so nudge one a few times a second.
      if (now - lastTick > 200) {
        lastTick = now;
        forceTick((t) => t + 1);
      }
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const camera = cameraRef.current;
      const target = targetRef.current;
      camera.x += (target.x - camera.x) * 0.16;
      camera.y += (target.y - camera.y) * 0.16;
      camera.scale += (target.scale - camera.scale) * 0.16;

      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const toScreenX = (wx) => (wx - camera.x) * camera.scale + cx;
      const toScreenY = (wy) => (wy - camera.y) * camera.scale + cy;

      const visible = [];
      nodes.forEach((node) => {
        const r = node.r * camera.scale;
        if (r < RENDER_MIN_RADIUS) return;
        const sx = toScreenX(node.x);
        const sy = toScreenY(node.y);
        if (sx + r < -60 || sx - r > cssWidth + 60 || sy + r < -60 || sy - r > cssHeight + 60) return;
        visible.push({ node, sx, sy, r });
      });
      visible.sort((a, b) => b.r - a.r);

      // Bigger circles are drawn (and get label priority) first; smaller,
      // colliding labels are skipped rather than overlapping illegibly.
      const placedLabels = [];
      const labelFits = (x, y, w, h) => {
        for (const p of placedLabels) {
          if (Math.abs(x - p.x) < (w + p.w) / 2 + 3 && Math.abs(y - p.y) < (h + p.h) / 2 + 2) return false;
        }
        return true;
      };

      visible.forEach(({ node, sx, sy, r }) => {
        const isLeaf = !node.children;
        const isSelected = node.data.id === selectedId;
        const isAncestor = ancestryIds.includes(node.data.id);
        const extinct = node.data.extinct;
        const hue = node.hue;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(r, 0.4), 0, Math.PI * 2);

        if (isLeaf) {
          const lightness = extinct ? 36 : 52;
          ctx.fillStyle = `hsla(${hue}, 58%, ${lightness}%, ${extinct ? 0.14 : 0.22})`;
          ctx.fill();
          ctx.lineWidth = isSelected ? 2.6 : isAncestor ? 1.8 : 1.1;
          ctx.strokeStyle = isSelected
            ? `hsla(${hue}, 90%, 74%, 0.95)`
            : isAncestor
              ? `hsla(${hue}, 75%, 66%, 0.75)`
              : `hsla(${hue}, 68%, 58%, 0.5)`;
          if (extinct) ctx.setLineDash([Math.max(2, r * 0.08), Math.max(2, r * 0.08)]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.lineWidth = isAncestor ? 1.6 : Math.max(0.5, 1 - node.depth * 0.04);
          ctx.strokeStyle = isAncestor
            ? `hsla(${hue}, 70%, 68%, 0.55)`
            : `hsla(${hue}, 45%, 60%, ${Math.max(0.05, 0.22 - node.depth * 0.014)})`;
          ctx.stroke();
        }

        if (isLeaf && node.data.thumbnail && r >= IMAGE_PRELOAD_RADIUS) {
          let img = imagesRef.current.get(node.data.id);
          if (!img) {
            img = new Image();
            img.src = node.data.thumbnail.url;
            imagesRef.current.set(node.data.id, img);
          }
          if (r >= IMAGE_MIN_RADIUS && img.complete && img.naturalWidth) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(r - 2, 0.4), 0, Math.PI * 2);
            ctx.clip();
            const scaleFit = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
            const iw = img.naturalWidth * scaleFit;
            const ih = img.naturalHeight * scaleFit;
            ctx.drawImage(img, sx - iw / 2, sy - ih / 2, iw, ih);
            ctx.restore();
          }
        }

        if (r >= LABEL_MIN_RADIUS) {
          const hasImage = isLeaf && r >= IMAGE_MIN_RADIUS && imagesRef.current.get(node.data.id)?.complete;
          const label = node.data.commonName || node.data.name;
          const fontSize = clamp(r * (isLeaf ? 0.2 : 0.16), 9.5, 21);
          const fontFamily = fontsReadyRef.current ? '"Space Grotesk", system-ui, sans-serif' : "system-ui, sans-serif";
          ctx.font = `${isLeaf ? 500 : 600} ${fontSize}px ${fontFamily}`;
          const maxWidth = r * 1.85;
          const textWidth = Math.min(ctx.measureText(label).width, maxWidth);
          const ty = hasImage ? sy + r - fontSize * 1.05 : sy;

          if (labelFits(sx, ty, textWidth, fontSize)) {
            placedLabels.push({ x: sx, y: ty, w: textWidth, h: fontSize });
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (hasImage) {
              ctx.shadowColor = "rgba(2, 10, 9, 0.9)";
              ctx.shadowBlur = 6;
              ctx.fillStyle = "rgba(234, 255, 247, 0.97)";
            } else {
              ctx.shadowBlur = 0;
              ctx.fillStyle = isLeaf ? "rgba(234, 255, 247, 0.9)" : "rgba(234, 255, 247, 0.72)";
            }
            ctx.fillText(label, sx, ty, maxWidth);
            ctx.shadowBlur = 0;
          }
        }
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [nodes, selectedId, ancestryIds]);

  const findNodeAt = useCallback((worldX, worldY) => {
    let best = null;
    nodes.forEach((node) => {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      if (dx * dx + dy * dy <= node.r * node.r) {
        if (!best || node.r < best.r) best = node;
      }
    });
    return best;
  }, [nodes]);

  const screenToWorld = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const camera = cameraRef.current;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    return {
      x: camera.x + (clientX - rect.left - cx) / camera.scale,
      y: camera.y + (clientY - rect.top - cy) / camera.scale,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const handleWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const camera = cameraRef.current;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const worldX = camera.x + (event.clientX - rect.left - cx) / camera.scale;
      const worldY = camera.y + (event.clientY - rect.top - cy) / camera.scale;
      const multiplier = event.deltaY < 0 ? 1.16 : 0.86;
      const newScale = clamp(camera.scale * multiplier, MIN_SCALE, MAX_SCALE);
      const next = {
        scale: newScale,
        x: worldX - (event.clientX - rect.left - cx) / newScale,
        y: worldY - (event.clientY - rect.top - cy) / newScale,
      };
      cameraRef.current = next;
      targetRef.current = next;
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      camera: { ...cameraRef.current },
      moved: false,
    };
  };

  useEffect(() => {
    const handleMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
      if (!drag.moved) return;
      const next = {
        scale: drag.camera.scale,
        x: drag.camera.x - dx / drag.camera.scale,
        y: drag.camera.y - dy / drag.camera.scale,
      };
      cameraRef.current = next;
      targetRef.current = next;
    };
    const handleUp = (event) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      if (!drag.moved) {
        const world = screenToWorld(event.clientX, event.clientY);
        const hit = findNodeAt(world.x, world.y);
        if (hit) selectNode(hit);
      }
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [findNodeAt, screenToWorld, selectNode]);

  const handleSearch = (event) => {
    event.preventDefault();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    const exact = nodes.find((n) => (n.data.commonName || n.data.name).toLowerCase() === normalized || n.data.name.toLowerCase() === normalized);
    const partial = nodes.find((n) => `${n.data.name} ${n.data.commonName || ""}`.toLowerCase().includes(normalized));
    const found = exact || partial;
    if (found) {
      setSearchMessage(`Found ${found.data.commonName || found.data.name}`);
      selectNode(found);
    } else {
      setSearchMessage("No match in this tree. Try a broader or scientific name.");
    }
  };

  const zoomBy = (multiplier) => {
    const { width, height } = sizeRef.current;
    const camera = cameraRef.current;
    const newScale = clamp(camera.scale * multiplier, MIN_SCALE, MAX_SCALE);
    targetRef.current = { x: camera.x, y: camera.y, scale: newScale };
  };

  const nodeCount = nodes.length;
  const speciesCount = useMemo(() => nodes.filter((n) => !n.children).length, [nodes]);

  return (
    <div className="evo2-shell">
      <header className="evo2-toolbar">
        <div className="evo2-view-copy">
          <strong>Explore</strong>
          <span>{nodeCount.toLocaleString()} real branches from Open Tree of Life — {speciesCount} named tips, photographed via Wikipedia. Zoom continuously from the root of life down to a single species.</span>
        </div>

        <form className="evo2-search" onSubmit={handleSearch}>
          <label htmlFor="evo3-search-input">Find any branch or species</label>
          <div>
            <input id="evo3-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try octopus, fungi, Tyrannosaurus…" />
            <button type="submit" disabled={!query.trim()}>Find</button>
          </div>
          <output>{searchMessage}</output>
        </form>

        <div className="evo2-zoom" aria-label="Tree navigation controls">
          <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.3)}>−</button>
          <span>{Math.round((cameraRef.current.scale / ((Math.min(sizeRef.current.width || 1, sizeRef.current.height || 1) * 0.47) / root.r || 1)) * 100)}%</span>
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.3)}>+</button>
          <button type="button" className="wide" onClick={fitAll}>Fit all</button>
        </div>
      </header>

      <div className="evo2-workspace">
        <div className="evo3-canvas-wrap" ref={wrapRef}>
          <canvas
            ref={canvasRef}
            className="evo3-canvas"
            role="img"
            aria-label="Zoomable tree of life. Use the search box to jump directly to a species."
            onPointerDown={handlePointerDown}
            style={{ width: "100%", height: "100%", touchAction: "none" }}
          />
          <div className="evo2-canvas-help">
            <span>Scroll to zoom</span><span>Drag to pan</span><span>Click a circle to dive in</span>
          </div>
        </div>

        <aside className="evo2-detail" aria-live="polite">
          <div className="evo2-detail-art" style={{ "--node-accent": `hsl(${selected.hue}, 70%, 62%)` }}>
            {selected.data.thumbnail ? (
              <NextImage src={selected.data.thumbnail.url} alt={selected.data.commonName || selected.data.name} fill sizes="104px" className="evo3-detail-photo" />
            ) : (
              <svg viewBox="0 0 76 70" aria-hidden="true"><circle cx="38" cy="35" r="26" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
            )}
            <i />
          </div>
          <div className="evo2-detail-topline">
            <span className={`status ${selected.data.extinct ? "extinct" : "living"}`}>{selected.data.extinct ? "extinct" : "living"}</span>
            <span>{selected.data.rank}</span>
          </div>
          <h3>{selected.data.commonName || selected.data.name}</h3>
          {selected.data.commonName && <p className="scientific">{selected.data.name}</p>}

          {selected.data.summary && <p className="summary">{selected.data.summary}</p>}

          <div className="evo2-context-grid">
            <div><span>Descendant branches sampled</span><strong>{selected.descendants().length - 1 || "—"}</strong></div>
            <div><span>Depth from root</span><strong>{selected.depth}</strong></div>
          </div>

          {selected.data.attribution && (
            <div className="evo3-attribution">
              <a href={selected.data.attribution.url} target="_blank" rel="noreferrer">{selected.data.attribution.text} — source &amp; license</a>
            </div>
          )}

          <div className="evo2-breadcrumbs" aria-label="Selected lineage path">
            <span>Map route</span>
            <div>
              {selected.ancestors().reverse().map((node, index, arr) => (
                <button type="button" key={node.data.id} onClick={() => selectNode(node)}>
                  {node.data.commonName || node.data.name}{index < arr.length - 1 ? <i>›</i> : null}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="evo2-focus" onClick={() => flyTo(selected)}>Focus this branch</button>
        </aside>
      </div>

      <div className="evo2-legend">
        <span><i className="line accepted" /> nested clade structure</span>
        <span><i className="tile living" /> living branch</span>
        <span><i className="tile extinct" /> fossil branch</span>
        <span>Circle size ≈ how many sampled branches sit inside it — not a claim about real species counts.</span>
      </div>
    </div>
  );
}
