"use client";

import { useState, useEffect, useCallback } from "react";
import EvolutionTree from "./components/EvolutionTree";
import { LADDER } from "../lib/content";

export default function Home() {
  const [roast, setRoast] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("all");
  const [fading, setFading] = useState(false);

  const [fact, setFact] = useState("");
  const [factFade, setFactFade] = useState(false);

  const [metaphor, setMetaphor] = useState("");
  const [metaFade, setMetaFade] = useState(false);

  const [oxymorons, setOxymorons] = useState([]);
  const [toast, setToast] = useState("");

  const fetchRoast = useCallback(async (tag) => {
    setFading(true);
    try {
      const res = await fetch(`/api/roast?tag=${tag || activeTag}`);
      const data = await res.json();
      setTimeout(() => {
        setRoast(data.roast);
        if (data.tags) setTags(data.tags);
        setFading(false);
      }, 200);
    } catch {
      setFading(false);
    }
  }, [activeTag]);

  const fetchFact = useCallback(async () => {
    setFactFade(true);
    const res = await fetch("/api/facts?type=fact");
    const data = await res.json();
    setTimeout(() => { setFact(data.item); setFactFade(false); }, 200);
  }, []);

  const fetchMetaphor = useCallback(async () => {
    setMetaFade(true);
    const res = await fetch("/api/facts?type=metaphor");
    const data = await res.json();
    setTimeout(() => { setMetaphor(data.item); setMetaFade(false); }, 200);
  }, []);

  useEffect(() => {
    fetchRoast("all");
    fetchFact();
    fetchMetaphor();

    (async () => {
      const set = [];
      for (let i = 0; i < 8; i++) {
        const response = await fetch("/api/facts?type=oxymoron");
        const data = await response.json();
        if (!set.find((item) => item.phrase === data.item.phrase)) set.push(data.item);
      }
      setOxymorons(set);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTag = (tag) => {
    setActiveTag(tag);
    fetchRoast(tag);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const shareRoast = async () => {
    if (!roast) return;
    const text = `${roast.line}\n\n— Reality: ${roast.truth}\n\nvia The Truth Machine`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsapp, "_blank");
      showToast("Opening WhatsApp…");
    }
  };

  const copyRoast = async () => {
    if (!roast) return;
    await navigator.clipboard.writeText(`${roast.line} — Reality: ${roast.truth}`);
    showToast("Copied. Go start an argument.");
  };

  return (
    <>
      <div className="blob a" />
      <div className="blob b" />

      <nav>
        <div className="wrap">
          <div className="logo">
            <span className="dot" />
            the<b>·</b>truth<b>·</b>machine
          </div>
          <div className="navlinks">
            <a href="#roaster">Roaster</a>
            <a href="#evolution-tree">Evolution Tree</a>
            <a href="#ladder">Timeline</a>
            <a href="#facts">Facts</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <span className="eyebrow">no stars · no omens · just receipts</span>
          <h1 className="title">
            You are a <em>fish</em> that learned to<br />worry about Mercury retrograde.
          </h1>
          <p className="lede">
            We live in an age of satellites, vaccines, and gene editing — and still
            hang chillies on the door to fight the dark. This is a{" "}
            <b>reality check with a sense of humour</b>: sharper metaphors, savage
            oxymorons, and the true, stranger, far more beautiful story of how you
            actually got here.
          </p>
        </div>
      </header>

      <div className="wrap">
        <div className="roaster" id="roaster">
          <div className="roaster-head">
            <h2>The Truth Roaster</h2>
            <div className="chips">
              <button
                className={`chip ${activeTag === "all" ? "active" : ""}`}
                onClick={() => selectTag("all")}
              >
                all
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`chip ${activeTag === tag ? "active" : ""}`}
                  onClick={() => selectTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <p className={`roast-line ${fading ? "fade" : ""}`}>
            {roast ? roast.line : "Warming up the reality engine…"}
          </p>

          {roast && (
            <div className={`roast-truth ${fading ? "fade" : ""}`}>
              <span>reality</span>
              <p>{roast.truth}</p>
            </div>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={() => fetchRoast()}>
              ⚡ Roast me again
            </button>
            <button className="btn btn-ghost" onClick={shareRoast}>
              Share on WhatsApp
            </button>
            <button className="btn btn-ghost" onClick={copyRoast}>
              Copy
            </button>
          </div>
        </div>
      </div>

      <EvolutionTree />

      <section className="block" id="ladder">
        <div className="wrap">
          <div className="section-tag">/ the actual family timeline</div>
          <h2 className="section-title">
            Meet your ancestors. Not one of them checked a horoscope.
          </h2>
          <p className="section-sub">
            Scroll 3.8 billion years in thirty seconds. Every step is a renovation,
            never a fresh design — which is exactly why your body is full of
            gloriously bad plumbing.
          </p>

          <div className="ladder">
            {LADDER.map((rung, index) => (
              <div className="rung" key={index}>
                <div className="era">{rung.era}</div>
                <div className="who">{rung.who}</div>
                <div className="note">{rung.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="section-tag">/ better metaphors</div>
          <p className={`metaphor ${metaFade ? "fade" : ""}`}>{metaphor}</p>
          <div className="actions">
            <button className="btn btn-ghost" onClick={fetchMetaphor}>
              Another one →
            </button>
          </div>
        </div>
      </section>

      <section className="block" id="oxymorons">
        <div className="wrap">
          <div className="section-tag">/ the oxymoron cabinet</div>
          <h2 className="section-title">Two words that shouldn't be friends.</h2>
          <p className="section-sub">
            The quiet contradictions we walk around with every day.
          </p>
          <div className="grid">
            {oxymorons.map((oxymoron, index) => (
              <div className="card" key={index}>
                <div className="ox">{oxymoron.phrase}</div>
                <div className="oxn">{oxymoron.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="facts">
        <div className="wrap">
          <div className="section-tag">/ stranger than any myth</div>
          <div className="factbox">
            <p className={factFade ? "fade" : ""}>{fact}</p>
            <button className="btn btn-primary" onClick={fetchFact}>
              🧬 Hit me with another truth
            </button>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}>
              <span className="dot" /> the·truth·machine
            </div>
            <p className="disclaimer">
              Made to poke fun at bad ideas, never at people. Curiosity is the
              opposite of contempt. If something here changed your mind — good.
              If it made you laugh first — even better. Believe things because
              they're true, not because they're old.
            </p>
          </div>
          <div>Built with evidence. Deploy on Vercel.</div>
        </div>
      </footer>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
