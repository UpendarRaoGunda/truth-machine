import AncestryClient from "./AncestryClient";
import styles from "./ancestry.module.css";

export const metadata = {
  title: "Ancestral Journey — 70,000 Years to You",
  description:
    "Explore a privacy-first, evidence-labelled reconstruction of probable ancestral population journeys using genome data and open-source analysis tools.",
};

export default function AncestryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />
      <nav className={styles.nav}>
        <a className={styles.logo} href="/">
          <span />the·truth·machine
        </a>
        <div>
          <a href="/#evolution-tree">Life Atlas</a>
          <a href="/download">Android</a>
        </div>
      </nav>
      <AncestryClient />
    </main>
  );
}
