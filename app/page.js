"use client";

import { useEffect, useState } from "react";
import EvolutionTree from "./components/EvolutionTree";
import {
  CONTRADICTIONS,
  FACTS,
  INSIGHTS,
  LADDER,
  ROASTS,
  SCIENTIST_QUOTES,
} from "../lib/content";

function pickDifferent(items, current, identity = (item) => item) {
  if (!items.length) return current;
  if (items.length === 1) return items[0];
  const alternatives = items.filter((item) => identity(item) !== identity(current));
  return alternatives[Math.floor(Math.random() * alternatives.length)] || items[0];
}

export default function Home() {
  const tags = ["all", ...new Set(ROASTS.map((item) => item.tag))];
  const [activeTag, setActiveTag] = useState("all");
  const [roast, setRoast] = useState(ROASTS[0]);
  const [fact, setFact] = useState(FACTS[0]);
  const [comparison, setComparison] = useState(INSIGHTS[0]);
  const [contradictions, setContradictions] = useState(CONTRADICTIONS);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setContradictions([...CONTRADICTIONS].sort(() => Math.random() - 0.5));
  }, []);

  const selectTag = (tag) => {
    setActiveTag(tag);
    const pool = tag === "all" ? ROASTS : ROASTS.filter((item) => item.tag === tag);
    setRoast((current) => pickDifferent(pool, current, (item) => item.id));
  };

  const anotherRealityCheck = () => {
    const pool = activeTag === "all" ? ROASTS : ROASTS.filter((item) => item.tag === activeTag);
    setRoast((current) => pickDifferent(pool, current, (item) => item.id));
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const shareRoast = async () => {
    const text = `${roast.line}\n\n— Evidence check: ${roast.truth}\n\nvia The Truth Machine`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const copyRoast = async () => {
    const text = `${roast.line} — Evidence check: ${roast.truth}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied.");
    } catch {
      showToast("Copy was blocked by the browser.");
    }
  };

  return (
    <>
      <div className="blob a" />
      <div className="blob b" />

      <nav>
        <div className="wrap">
          <a className="logo" href="#top" aria-label="The Truth Machine home">
            <span className="dot" />
            the<b>·</b>truth<b>·</b>machine
          </a>
          <div className="navlinks">
            <a href="#reality-check">Reality Check</a>
            <a href="#evolution-tree">Life Atlas</a>
            <a href="#scientists">Scientists</a>
            <a href="#evidence">Evidence</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <span className="eyebrow">no stars · no omens · just receipts</span>
          <h1 className="title">
            You are a <em>fish</em> that learned to<br />worry about Mercury retrograde.
          </h1>
          <p className="lede">
            We live in an age of satellites, vaccines, and gene editing—and still hang
            chillies on the door to fight the dark. Here is a <b>reality check with a
            sense of humour</b>, followed by the far stranger and more beautiful story
            of how life actually produced us.
          </p>
        </div>
      </header>

      <div className="wrap">
        <section className="roaster" id="reality-check">
          <div className="roaster-head">
            <div>
              <span className="mini-label">Evidence beats habit</span>
              <h2>Reality Check</h2>
            </div>
            <div className="chips" aria-label="Choose a subject">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`chip ${activeTag === tag ? "active" : ""}`}
                  onClick={() => selectTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <p className="roast-line">{roast.line}</p>
          <div className="roast-truth">
            <span>evidence check</span>
            <p>{roast.truth}</p>
          </div>

          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={anotherRealityCheck}>⚡ Another reality check</button>
            <button type="button" className="btn btn-ghost" onClick={shareRoast}>Share</button>
            <button type="button" className="btn btn-ghost" onClick={copyRoast}>Copy</button>
          </div>
        </section>
      </div>

      <EvolutionTree />

      <section className="block" id="deep-time">
        <div className="wrap">
          <div className="section-tag">/ deep time in nine transformations</div>
          <h2 className="section-title">Your body is an archive with four billion years of edits.</h2>
          <p className="section-sub">
            Evolution rarely starts over. It modifies what already works, leaving old
            structures, awkward routes, and brilliant compromises inside every organism.
          </p>

          <div className="ladder">
            {LADDER.map((rung) => (
              <article className="rung" key={`${rung.era}-${rung.who}`}>
                <div className="era">{rung.era}</div>
                <div className="who">{rung.who}</div>
                <div className="note">{rung.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block insight-strip">
        <div className="wrap">
          <div className="section-tag">/ see the old idea differently</div>
          <p className="comparison">{comparison}</p>
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setComparison((current) => pickDifferent(INSIGHTS, current))}>Show another →</button>
          </div>
        </div>
      </section>

      <section className="block scientists-section" id="scientists">
        <div className="wrap">
          <div className="section-tag">/ scientists versus comfortable nonsense</div>
          <h2 className="section-title">They studied nature. Nature never asked for your lucky number.</h2>
          <p className="section-sub">
            The quotations are authentic and linked to their sources. The sarcastic line below each one is ours—because historical accuracy and mockery can coexist.
          </p>

          <div className="scientist-grid">
            {SCIENTIST_QUOTES.map((item) => (
              <article className="scientist-card" key={item.scientist}>
                <header>
                  <div className="scientist-mark" aria-hidden="true">
                    <span>{item.initials}</span>
                    <i />
                  </div>
                  <div>
                    <h3>{item.scientist}</h3>
                    <p>{item.field} · {item.years}</p>
                  </div>
                </header>

                <blockquote>“{item.quote}”</blockquote>

                <div className="scientist-punchline">
                  <span>Translated for superstition</span>
                  <p>{item.punchline}</p>
                </div>

                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Source: {item.source} ↗
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="contradictions">
        <div className="wrap">
          <div className="section-tag">/ beliefs that collide with their own evidence</div>
          <h2 className="section-title">Two ideas enter. Only one survives contact with reality.</h2>
          <p className="section-sub">The quiet contradictions that modern life lets us carry without noticing.</p>
          <div className="grid contradiction-grid">
            {contradictions.map((item) => (
              <article className="card" key={item.phrase}>
                <div className="ox">{item.phrase}</div>
                <div className="oxn">{item.note}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="evidence">
        <div className="wrap">
          <div className="section-tag">/ stranger than any story we invented</div>
          <div className="factbox">
            <span className="mini-label">One evidence-backed surprise</span>
            <p>{fact}</p>
            <button type="button" className="btn btn-primary" onClick={() => setFact((current) => pickDifferent(FACTS, current))}>🧬 Show another</button>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div>
            <div className="logo"><span className="dot" /> the·truth·machine</div>
            <p className="disclaimer">
              Made to challenge bad ideas, never to belittle people. Curiosity is the
              opposite of contempt. Believe things because the evidence survives testing,
              not because the claim survived centuries.
            </p>
          </div>
          <div className="footer-note">Built with evidence, uncertainty, and a sense of humour.</div>
        </div>
      </footer>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
