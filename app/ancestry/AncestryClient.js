"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildLocalPreview,
  detectGenomeFormat,
  inspectGenomeSample,
  validateGenomeBundle,
} from "../../lib/ancestry.mjs";
import styles from "./ancestry.module.css";

const EMPTY_PROFILE = { displayName: "", birthYear: "", birthplace: "", familyPlaces: ["", "", "", ""] };
const EMPTY_CONSENT = { permission: false, probabilistic: false, processing: false, guardian: false };

function sizeLabel(bytes) {
  if (!bytes) return "0 B";
  const unit = bytes > 1024 ** 2 ? "MB" : "KB";
  return `${(bytes / (unit === "MB" ? 1024 ** 2 : 1024)).toFixed(1)} ${unit}`;
}

async function sampleFile(file) {
  if (/\.(bed|pgen|vcf\.gz)$/i.test(file.name)) return "";
  return file.slice(0, 2 * 1024 * 1024).text();
}

function Journey({ journey = [] }) {
  const [index, setIndex] = useState(Math.max(0, journey.length - 1));
  useEffect(() => setIndex(Math.max(0, journey.length - 1)), [journey.length]);
  const stage = journey[index];
  if (!stage) return null;
  const points = journey.map((item) => `${item.x},${item.y}`).join(" ");
  return (
    <div className={styles.journey}>
      <div className={styles.map}>
        <svg viewBox="0 0 100 70" role="img" aria-label="Probabilistic ancestral population journey">
          <rect width="100" height="70" rx="4" fill="#041613" />
          <path d="M8 17C18 8 35 8 43 15c6 4 6 13 1 18-6 5-9 15-16 21-8 5-19-1-20-10-1-9-6-17 0-27Z" fill="#0d2e28" stroke="#1d5d50" strokeWidth=".5" />
          <path d="M47 14c10-6 29-7 43-1 7 4 6 14-1 19-5 4-5 12-11 16-9 6-18 1-20-6-3-6-10-11-13-18-2-4-1-8 2-10Z" fill="#0d2e28" stroke="#1d5d50" strokeWidth=".5" />
          <path d="M76 50c8-3 17 1 18 9 0 5-6 8-12 6-5-2-9-10-6-15Z" fill="#0d2e28" stroke="#1d5d50" strokeWidth=".5" />
          <polyline points={points} fill="none" stroke="#4ff0c4" strokeWidth="1.1" strokeDasharray="2 1.4" />
          {journey.map((item, i) => <circle key={item.id} cx={item.x} cy={item.y} r={i === index ? 2.6 : 1.25} fill={i <= index ? "#4ff0c4" : "#315a52"} />)}
        </svg>
      </div>
      <article className={styles.stage}>
        <span>{stage.yearsAgo ? `${stage.yearsAgo.toLocaleString("en-US")} years ago` : "Today"}</span>
        <h3>{stage.label}</h3>
        <p>{stage.description}</p>
        <dl><div><dt>Region</dt><dd>{stage.region}</dd></div><div><dt>Confidence</dt><dd>{stage.confidence}</dd></div><div><dt>Evidence</dt><dd>{stage.evidence}</dd></div></dl>
        <input aria-label="Move through ancestral time" type="range" min="0" max={journey.length - 1} value={index} onChange={(e) => setIndex(Number(e.target.value))} />
        <div className={styles.ticks}><span>70,000 years</span><span>Today</span></div>
      </article>
    </div>
  );
}

function Report({ report, onDelete }) {
  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "truth-machine-ancestral-journey.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className={styles.results}>
      <header><div><span className={styles.kicker}>Evidence-labelled report</span><h2>{report.title}</h2><p>{report.personalisedGeneticInference ? "Population-level estimates from the configured genomics engine." : "Private file inspection plus the shared human migration baseline. No personalised ancestry percentage has been invented."}</p></div><div className={styles.actions}><button onClick={download}>Export report</button>{onDelete ? <button className={styles.danger} onClick={onDelete}>Delete analysis</button> : null}</div></header>
      <Journey journey={report.journey} />
      <div className={styles.reportGrid}>
        <article><span>Autosomal</span><h3>{report.autosomal?.status || "Reference analysis not run"}</h3><p>{report.autosomal?.summary || "Requires a versioned reference panel, PCA projection and reviewed population models."}</p></article>
        <article><span>Maternal river</span><h3>{report.maternal?.haplogroup || "Not classified"}</h3><p>{report.maternal?.summary || "mtDNA describes one direct maternal line only and requires sufficient markers."}</p></article>
        <article><span>Paternal river</span><h3>{report.paternal?.haplogroup || "Not classified"}</h3><p>{report.paternal?.summary || "Y-DNA describes one direct paternal line and is available only when suitable Y markers exist."}</p></article>
        <article><span>Ancient affinities</span><h3>{report.ancient?.status || "Not modelled"}</h3><p>{report.ancient?.summary || "Ancient affinities require licensed, versioned ancient-DNA panels and explicit alternative-model testing."}</p></article>
      </div>
      <div className={styles.knownUnknown}><article><h3>What this can say</h3><ul><li>Probable population affinities and broad migration corridors.</li><li>Marker coverage, quality control and model confidence.</li><li>Maternal or paternal direct-line classifications when supported.</li></ul></article><article><h3>What it cannot say</h3><ul>{(report.limitations || []).map((item) => <li key={item}>{item}</li>)}</ul></article></div>
    </section>
  );
}

export default function AncestryClient() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [files, setFiles] = useState([]);
  const [validation, setValidation] = useState(null);
  const [consent, setConsent] = useState(EMPTY_CONSENT);
  const [capabilities, setCapabilities] = useState({ loading: true, configured: false });
  const [report, setReport] = useState(null);
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ancestry/capabilities", { cache: "no-store" }).then((r) => r.json()).then((data) => setCapabilities({ loading: false, ...data })).catch(() => setCapabilities({ loading: false, configured: false }));
  }, []);

  const isMinor = useMemo(() => {
    const year = Number(profile.birthYear);
    return year >= 1900 && year > new Date().getFullYear() - 18;
  }, [profile.birthYear]);
  const consentReady = consent.permission && consent.probabilistic && consent.processing && (!isMinor || consent.guardian);

  const updateProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const updateFamilyPlace = (index, value) => setProfile((current) => ({ ...current, familyPlaces: current.familyPlaces.map((item, i) => i === index ? value : item) }));

  const inspect = async () => {
    setError(""); setStatus("Inspecting format and marker coverage locally…");
    const summaries = await Promise.all(files.map(async (file) => {
      const sample = await sampleFile(file);
      return { name: file.name, size: file.size, sample, format: detectGenomeFormat(file.name, sample) };
    }));
    const checked = validateGenomeBundle(summaries);
    setValidation(checked);
    if (!checked.valid) { setStatus(""); setError(checked.errors.join(" ")); return; }
    const inspection = summaries.reduce((all, item) => {
      const one = inspectGenomeSample(item.sample);
      return { sampledLines: all.sampledLines + one.sampledLines, mitochondrialMarkers: all.mitochondrialMarkers || one.mitochondrialMarkers, yChromosomeMarkers: all.yChromosomeMarkers || one.yChromosomeMarkers };
    }, { sampledLines: 0, mitochondrialMarkers: false, yChromosomeMarkers: false });
    setReport(buildLocalPreview(profile, checked, inspection));
    setStatus("Local inspection complete. No genome data left this browser.");
  };

  const runSecure = async () => {
    setError("");
    if (!validation?.valid || !consentReady || !capabilities.configured) return;
    try {
      setStatus("Requesting a short-lived upload token…");
      const tokenResponse = await fetch("/api/ancestry/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files: files.map(({ name, size }) => ({ name, size })), birthYear: profile.birthYear, consent }) });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenData.error || "Token request failed.");
      const form = new FormData();
      form.append("profile", JSON.stringify(profile));
      form.append("consent", JSON.stringify(consent));
      files.forEach((file) => form.append("files", file));
      setStatus("Encrypting and uploading directly to the isolated engine…");
      const create = await fetch(`${capabilities.apiUrl}/v1/jobs`, { method: "POST", headers: { Authorization: `Bearer ${tokenData.token}` }, body: form });
      const created = await create.json();
      if (!create.ok) throw new Error(created.detail || "Analysis could not be created.");
      setJob({ id: created.jobId, key: created.accessKey });
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const poll = await fetch(`${capabilities.apiUrl}/v1/jobs/${created.jobId}`, { headers: { "X-Job-Key": created.accessKey }, cache: "no-store" });
        const data = await poll.json();
        if (!poll.ok) throw new Error(data.detail || "Analysis status failed.");
        setStatus(data.message || data.status);
        if (data.status === "complete") { setReport(data.report); break; }
        if (data.status === "failed") throw new Error(data.error || "Analysis failed.");
      }
    } catch (reason) { setError(reason.message || "Secure analysis failed."); setStatus(""); }
  };

  const deleteAnalysis = async () => {
    if (job && capabilities.apiUrl) await fetch(`${capabilities.apiUrl}/v1/jobs/${job.id}`, { method: "DELETE", headers: { "X-Job-Key": job.key } }).catch(() => {});
    setJob(null); setReport(null); setFiles([]); setValidation(null); setStatus("Analysis and local report reference deleted.");
  };

  return <>
    <section className={styles.hero}><div><span className={styles.kicker}>Ancestral Journey · 70,000 years to you</span><h1>Your genome is a map with blurred borders—not a list of exact ancestors.</h1><p>Explore probable ancestral population affinities, migration corridors and direct maternal or paternal lines. Every result carries confidence, alternatives, methods and limitations.</p><div className={styles.badges}><span>English only</span><span>Open-source pipeline</span><span>Privacy first</span><span>No caste or race claims</span></div></div><div className={styles.orb}><span>70K</span><small>years of population history</small></div></section>
    <section className={styles.truth}><strong>The scientific promise</strong><p>Truth Machine estimates population-level history. It will never claim to reconstruct every individual ancestor or place an unnamed prehistoric person in an exact village.</p></section>
    <section className={styles.workspace}>
      <div className={styles.formPanel}>
        <span className={styles.kicker}>1 · Recent family context</span><h2>Start with what your family actually knows.</h2>
        <div className={styles.formGrid}><label>Name for the report<input value={profile.displayName} onChange={(e) => updateProfile("displayName", e.target.value)} maxLength="80" /></label><label>Birth year<input type="number" min="1900" max={new Date().getFullYear()} value={profile.birthYear} onChange={(e) => updateProfile("birthYear", e.target.value)} /></label><label className={styles.full}>Birthplace<input value={profile.birthplace} onChange={(e) => updateProfile("birthplace", e.target.value)} maxLength="160" /></label></div>
        <div className={styles.family}>{profile.familyPlaces.map((place, i) => <input key={i} value={place} onChange={(e) => updateFamilyPlace(i, e.target.value)} placeholder={`Parent/grandparent birthplace ${i + 1}`} maxLength="160" />)}</div>
        <hr />
        <span className={styles.kicker}>2 · Genetic evidence</span><h2>Add a genome export.</h2><p className={styles.muted}>VCF, consumer raw genotype text, or complete PLINK BED/BIM/FAM and PGEN/PVAR/PSAM bundles. BAM/CRAM remain an advanced backend workflow.</p>
        <label className={styles.drop}><input type="file" multiple accept=".vcf,.vcf.gz,.txt,.csv,.bed,.bim,.fam,.pgen,.pvar,.psam" onChange={(e) => { setFiles(Array.from(e.target.files || [])); setValidation(null); setReport(null); }} /><strong>Choose genome files</strong><span>Nothing uploads until you explicitly request secure analysis.</span></label>
        {files.length ? <div className={styles.files}>{files.map((file) => <span key={file.name}>{file.name} · {sizeLabel(file.size)}</span>)}</div> : null}
        <button className={styles.primary} onClick={inspect} disabled={!files.length}>Inspect privately on this device</button>
        {validation ? <div className={validation.valid ? styles.ok : styles.problem}><strong>{validation.valid ? "File bundle accepted" : "File bundle needs attention"}</strong><p>{validation.valid ? `Detected: ${validation.formats.join(", ")}.` : validation.errors.join(" ")}</p></div> : null}
      </div>
      <aside className={styles.privacy}>
        <span className={styles.kicker}>Privacy control room</span><h2>Your genome is not ordinary app data.</h2>
        <ul><li>Short-lived, size-bound upload token</li><li>Random analysis ID and separate access key</li><li>AES-256-GCM encrypted storage</li><li>Raw files and decrypted workspace deleted after processing</li><li>Results expire and can be deleted immediately</li><li>No ads, analytics, model training, sale or third-party sharing</li></ul>
        <div className={styles.engine}><i className={capabilities.configured ? styles.online : styles.offline} /><div><strong>{capabilities.loading ? "Checking engine…" : capabilities.configured ? "Secure engine configured" : "Local preview mode"}</strong><small>{capabilities.configured ? "Real analysis can be submitted after consent." : "Deploy the included ancestry-engine service and reference panels to enable personalised inference."}</small></div></div>
        <div className={styles.consent}>{[["permission", "I own this genome or have explicit permission."], ["probabilistic", "I understand results are probabilistic population estimates, not exact ancestors."], ["processing", "I consent to encrypted processing and automatic raw-file deletion."], ...(isMinor ? [["guardian", "I am the verified parent or legal guardian authorising analysis for a minor."]] : [])].map(([key, text]) => <label key={key}><input type="checkbox" checked={consent[key]} onChange={(e) => setConsent((current) => ({ ...current, [key]: e.target.checked }))} /><span>{text}</span></label>)}</div>
        <button className={styles.secure} onClick={runSecure} disabled={!validation?.valid || !consentReady || !capabilities.configured}>Run secure open-source analysis</button>
      </aside>
    </section>
    {status ? <p className={styles.status}>{status}</p> : null}{error ? <p className={styles.error}>{error}</p> : null}
    {report ? <Report report={report} onDelete={job ? deleteAnalysis : null} /> : null}
    <section className={styles.methods}><span className={styles.kicker}>Open methods · versioned evidence</span><h2>What the deployable engine is designed to run</h2><div className={styles.methodGrid}><article><b>BCFtools</b><p>Validation, normalisation, indexing and VCF statistics.</p></article><article><b>PLINK 2</b><p>Quality control, conversion, missingness, frequencies and PCA projection.</p></article><article><b>ADMIXTOOLS 2</b><p>Formal f-statistics and alternative admixture model testing.</p></article><article><b>HaploGrep 3</b><p>Maternal haplogroup classification when mtDNA evidence is sufficient.</p></article><article><b>Y-LineageTracker</b><p>Paternal direct-line classification when suitable Y markers exist.</p></article><article><b>Versioned panels</b><p>IGSR/1000 Genomes, SGDP and AADR are mounted separately with checksums, citations and reuse terms.</p></article></div></section>
    <section className={styles.restrictions}><div><span className={styles.kicker}>Hard guardrails</span><h2>Truth Machine refuses these outputs.</h2></div><div>{["Caste or religion predictions", "Racial purity or superiority scores", "Exact prehistoric villages or named ancient ancestors", "Intelligence, personality or criminality from ancestry", "Medical diagnosis inside ancestry", "Famous-person relationships without genealogy"].map((item) => <span key={item}>{item}</span>)}</div></section>
  </>;
}
