"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchOxymorons = useCallback(async () => {
    const res = await fetch("/api/facts?type=oxymoron");
    // pull a fresh set of 8 by calling a few times isn't ideal; grab the full set client-side
  }, []);

  useEffect(() => {
    fetchRoast("all");
    fetchFact();
    fetchMetaphor();
    // load oxymorons once from a dedicated fetch loop
    (async () => {
      const set = [];
      for (let i = 0; i < 8; i++) {
        const r = await fetch("/api/facts?type=oxymoron");
        const d = await r.json();
        if (!set.find((x) => x.phrase === d.item.phrase)) set.push(d.item);
      }
      setOxymorons(set);
    })();
    // eslint-disable-next-line
  }, []);

  const selectTag = (t) => {
    setActiveTag(t);
    fetchRoast(t);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const shareRoast = async () => {
    if (!roast) return;
    const text = `${roast.line}\n\n— Reality: ${roast.truth}\n\nvia The Truth Machine`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
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
            <a href="#ladder">Your Family Tree</a>
            <a href="#oxymorons">Oxymorons</a>
            <a href="#facts">Facts</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
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

      {/* ROASTER */}
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
              {tags.map((t) => (
                <button
                  key={t}
                  className={`chip ${activeTag === t ? "active" : ""}`}
                  onClick={() => selectTag(t)}
                >
                  {t}
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

      {/* LADDER */}
      <section className="block" id="ladder">
        <div className="wrap">
          <div className="section-tag">/ the actual family tree</div>
          <h2 className="section-title">
            Meet your ancestors. Not one of them checked a horoscope.
          </h2>
          <p className="section-sub">
            Scroll 3.8 billion years in thirty seconds. Every step is a renovation,
            never a fresh design — which is exactly why your body is full of
            gloriously bad plumbing.
          </p>

          <div className="ladder">
            {LADDER.map((r, i) => (
              <div className="rung" key={i}>
                <div className="era">{r.era}</div>
                <div className="who">{r.who}</div>
                <div className="note">{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METAPHOR */}
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

      {/* OXYMORONS */}
      <section className="block" id="oxymorons">
        <div className="wrap">
          <div className="section-tag">/ the oxymoron cabinet</div>
          <h2 className="section-title">Two words that shouldn't be friends.</h2>
          <p className="section-sub">
            The quiet contradictions we walk around with every day.
          </p>
          <div className="grid">
            {oxymorons.map((o, i) => (
              <div className="card" key={i}>
                <div className="ox">{o.phrase}</div>
                <div className="oxn">{o.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACTS */}
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
